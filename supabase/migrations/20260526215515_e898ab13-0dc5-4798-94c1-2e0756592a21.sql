CREATE TABLE public.page_toggles (
  page_key text PRIMARY KEY,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_toggles TO anon, authenticated;
GRANT ALL ON public.page_toggles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_toggles TO authenticated;

ALTER TABLE public.page_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_toggles public read"
ON public.page_toggles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "page_toggles admin write"
ON public.page_toggles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER page_toggles_touch
BEFORE UPDATE ON public.page_toggles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.page_toggles (page_key, label, enabled) VALUES
  ('education', 'Education (Reference Library / Blog)', true)
ON CONFLICT (page_key) DO NOTHING;