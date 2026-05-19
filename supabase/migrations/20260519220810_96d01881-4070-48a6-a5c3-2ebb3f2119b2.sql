-- Phase 2.5 B — internal notes (polymorphic)
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN (
    'product','order','customer','lot','article','affiliate','research_partner'
  )),
  entity_id text NOT NULL,
  author_id uuid,
  body_md text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS internal_notes_entity_idx
  ON public.internal_notes (entity_type, entity_id, pinned DESC, created_at DESC);

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "internal_notes admin all" ON public.internal_notes;
CREATE POLICY "internal_notes admin all"
  ON public.internal_notes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_internal_notes_updated_at ON public.internal_notes;
CREATE TRIGGER trg_internal_notes_updated_at
  BEFORE UPDATE ON public.internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Audit changes to internal notes themselves
DROP TRIGGER IF EXISTS trg_audit_internal_notes ON public.internal_notes;
CREATE TRIGGER trg_audit_internal_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();