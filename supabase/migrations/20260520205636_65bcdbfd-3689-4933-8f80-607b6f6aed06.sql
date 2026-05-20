INSERT INTO public.user_roles (user_id, role)
SELECT ur.user_id, 'super_admin'::public.app_role
FROM public.user_roles ur
WHERE ur.role = 'admin'::public.app_role
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.super_admin_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.user_roles
  WHERE role = 'super_admin'::public.app_role;
$$;

REVOKE ALL ON FUNCTION public.super_admin_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.super_admin_count() TO service_role;

CREATE OR REPLACE FUNCTION public.log_admin_account_event(
  _actor uuid,
  _action text,
  _target_user uuid,
  _diff jsonb
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, diff)
  VALUES (_actor, _action, 'admin_account', COALESCE(_target_user::text, ''), COALESCE(_diff, '{}'::jsonb));
$$;

REVOKE ALL ON FUNCTION public.log_admin_account_event(uuid, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_admin_account_event(uuid, text, uuid, jsonb) TO service_role;