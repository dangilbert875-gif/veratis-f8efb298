
-- 1) Order access token for PII protection on unauthenticated lookup
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS access_token text;
UPDATE public.orders SET access_token = encode(gen_random_bytes(16), 'hex') WHERE access_token IS NULL;
ALTER TABLE public.orders ALTER COLUMN access_token SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN access_token SET DEFAULT encode(gen_random_bytes(16), 'hex');
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_access_token ON public.orders(access_token);

-- 2) Remove user self-insert on affiliates (prevents commission_percent escalation)
DROP POLICY IF EXISTS "affiliates own insert" ON public.affiliates;

-- 3) Remove unconditional public SELECT on settings (no client reads it)
DROP POLICY IF EXISTS "settings public read" ON public.settings;

-- 4) Pin search_path on SECURITY DEFINER pgmq wrappers
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 5) Revoke EXECUTE on privileged SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.soft_delete(text, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore(text, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_order_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_admin_account_event(uuid, text, uuid, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lookup_promo_code(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated;
