
-- ───────── 1. Schema migration versioning ─────────
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  name text NOT NULL,
  checksum text,
  applied_by uuid,
  applied_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schema_migrations admin read" ON public.schema_migrations;
CREATE POLICY "schema_migrations admin read"
  ON public.schema_migrations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- writes only via service-role / DB itself
REVOKE INSERT, UPDATE, DELETE ON public.schema_migrations FROM anon, authenticated;

-- ───────── 2. Admin permission helpers ─────────
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon, authenticated, service_role;

-- ───────── 3. Soft-delete / restore helpers ─────────
CREATE OR REPLACE FUNCTION public.soft_delete(_table text, _id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  IF _table NOT IN (
    'products', 'educational_articles', 'product_lots',
    'orders', 'affiliates', 'customer_meta', 'research_partners'
  ) THEN
    RAISE EXCEPTION 'Soft delete not supported for table %', _table;
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET archived_at = now() WHERE id = $1 AND archived_at IS NULL',
    _table
  ) USING _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore(_table text, _id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  IF _table NOT IN (
    'products', 'educational_articles', 'product_lots',
    'orders', 'affiliates', 'customer_meta', 'research_partners'
  ) THEN
    RAISE EXCEPTION 'Restore not supported for table %', _table;
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET archived_at = NULL WHERE id = $1',
    _table
  ) USING _id;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete(text, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.restore(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore(text, uuid) TO authenticated, service_role;

-- ───────── 4. Extend audit trigger coverage ─────────
DROP TRIGGER IF EXISTS trg_audit_affiliates ON public.affiliates;
CREATE TRIGGER trg_audit_affiliates
  AFTER INSERT OR UPDATE OR DELETE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_customer_meta ON public.customer_meta;
CREATE TRIGGER trg_audit_customer_meta
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_meta
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_research_partners ON public.research_partners;
CREATE TRIGGER trg_audit_research_partners
  AFTER INSERT OR UPDATE OR DELETE ON public.research_partners
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_referrals ON public.referrals;
CREATE TRIGGER trg_audit_referrals
  AFTER INSERT OR UPDATE OR DELETE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_settings ON public.settings;
CREATE TRIGGER trg_audit_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- ───────── 5. Record this migration ─────────
INSERT INTO public.schema_migrations (version, name, notes)
VALUES (
  '20260519_phase2_helpers',
  'Migration versioning, soft-delete helpers, admin permission helpers, extended audit coverage',
  'Phase 2 platform helpers'
)
ON CONFLICT (version) DO NOTHING;
