CREATE SEQUENCE IF NOT EXISTS public.order_number_seq
  START WITH 1501
  INCREMENT BY 1
  MINVALUE 1501
  NO MAXVALUE
  CACHE 1;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.order_number_seq')::text;
$$;

REVOKE ALL ON FUNCTION public.next_order_number() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO service_role;