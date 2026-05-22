
CREATE TABLE public.payment_methods (
  id text PRIMARY KEY,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods public read"
ON public.payment_methods FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "payment_methods admin write"
ON public.payment_methods FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER payment_methods_touch_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.payment_methods (id, label, enabled, sort_order) VALUES
  ('bitcoin', 'Bitcoin', true, 0),
  ('venmo', 'Venmo', true, 1);
