
REVOKE EXECUTE ON FUNCTION public.soft_delete(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.restore(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.next_order_number() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_admin_account_event(uuid, text, uuid, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_promo_code(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC;
