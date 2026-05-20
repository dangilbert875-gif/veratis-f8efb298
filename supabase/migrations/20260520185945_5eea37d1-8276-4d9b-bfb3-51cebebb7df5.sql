
-- 1. Status enum for verification lots
DO $$ BEGIN
  CREATE TYPE public.lot_status AS ENUM (
    'draft','pending_assay','awaiting_coa','released',
    'archived','deactivated','failed','retest_required'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Columns
ALTER TABLE public.product_lots
  ADD COLUMN IF NOT EXISTS status public.lot_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS public_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verify_lookup_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_page_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coa_download_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS visibility_override boolean NOT NULL DEFAULT false;

-- 3. Backfill status from existing data
UPDATE public.product_lots SET status =
  CASE
    WHEN archived_at IS NOT NULL THEN 'archived'::public.lot_status
    WHEN active = false THEN 'deactivated'::public.lot_status
    WHEN coa_url IS NULL THEN 'awaiting_coa'::public.lot_status
    WHEN purity IS NULL OR release_date IS NULL THEN 'pending_assay'::public.lot_status
    ELSE 'released'::public.lot_status
  END
WHERE status = 'draft';

-- 4. Trigger to keep visibility flags in sync with status (unless overridden)
CREATE OR REPLACE FUNCTION public.sync_lot_visibility()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.visibility_override THEN
    RETURN NEW;
  END IF;
  CASE NEW.status
    WHEN 'released' THEN
      NEW.public_visible := true;
      NEW.verify_lookup_enabled := true;
      NEW.product_page_visible := true;
      NEW.coa_download_enabled := (NEW.coa_url IS NOT NULL);
    WHEN 'awaiting_coa' THEN
      NEW.public_visible := false;
      NEW.verify_lookup_enabled := false;
      NEW.product_page_visible := false;
      NEW.coa_download_enabled := false;
    WHEN 'archived' THEN
      NEW.public_visible := false;
      NEW.verify_lookup_enabled := false;
      NEW.product_page_visible := false;
      NEW.coa_download_enabled := false;
      IF NEW.archived_at IS NULL THEN NEW.archived_at := now(); END IF;
    WHEN 'deactivated' THEN
      NEW.public_visible := false;
      NEW.verify_lookup_enabled := false;
      NEW.product_page_visible := false;
      NEW.coa_download_enabled := false;
      IF NEW.deactivated_at IS NULL THEN NEW.deactivated_at := now(); END IF;
      NEW.active := false;
    ELSE
      -- draft, pending_assay, failed, retest_required → hidden
      NEW.public_visible := false;
      NEW.verify_lookup_enabled := false;
      NEW.product_page_visible := false;
      NEW.coa_download_enabled := false;
  END CASE;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_lot_visibility ON public.product_lots;
CREATE TRIGGER trg_sync_lot_visibility
  BEFORE INSERT OR UPDATE ON public.product_lots
  FOR EACH ROW EXECUTE FUNCTION public.sync_lot_visibility();

-- 5. Audit log for status / visibility changes
CREATE OR REPLACE FUNCTION public.log_lot_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    OLD.status IS DISTINCT FROM NEW.status
    OR OLD.public_visible IS DISTINCT FROM NEW.public_visible
    OR OLD.verify_lookup_enabled IS DISTINCT FROM NEW.verify_lookup_enabled
    OR OLD.product_page_visible IS DISTINCT FROM NEW.product_page_visible
    OR OLD.coa_download_enabled IS DISTINCT FROM NEW.coa_download_enabled
  ) THEN
    INSERT INTO public.audit_logs(actor_id, action, entity_type, entity_id, diff)
    VALUES (
      auth.uid(),
      'LOT_STATUS_CHANGE',
      'product_lots',
      NEW.id::text,
      jsonb_build_object(
        'lot_number', NEW.lot_number,
        'old', jsonb_build_object(
          'status', OLD.status,
          'public_visible', OLD.public_visible,
          'verify_lookup_enabled', OLD.verify_lookup_enabled,
          'product_page_visible', OLD.product_page_visible,
          'coa_download_enabled', OLD.coa_download_enabled
        ),
        'new', jsonb_build_object(
          'status', NEW.status,
          'public_visible', NEW.public_visible,
          'verify_lookup_enabled', NEW.verify_lookup_enabled,
          'product_page_visible', NEW.product_page_visible,
          'coa_download_enabled', NEW.coa_download_enabled
        )
      )
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_lot_status_change ON public.product_lots;
CREATE TRIGGER trg_log_lot_status_change
  AFTER UPDATE ON public.product_lots
  FOR EACH ROW EXECUTE FUNCTION public.log_lot_status_change();

-- 6. Tighten public read RLS — released + public_visible only
DROP POLICY IF EXISTS "lots public read" ON public.product_lots;
CREATE POLICY "lots public read"
  ON public.product_lots FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'released' AND public_visible = true AND archived_at IS NULL)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE INDEX IF NOT EXISTS idx_product_lots_public
  ON public.product_lots(status, public_visible)
  WHERE archived_at IS NULL;
