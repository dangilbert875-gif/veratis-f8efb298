
-- Replace handle_new_user to auto-promote the designated admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Auto-grant admin to the designated owner email
  IF lower(NEW.email) = 'dangilbert875@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Make sure the trigger is wired up on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- One-time backfill in case the user already exists
DO $$
DECLARE
  uid uuid;
  uemail text;
BEGIN
  SELECT id, email INTO uid, uemail FROM auth.users WHERE lower(email) = 'dangilbert875@gmail.com' LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.profiles (id, email)
    VALUES (uid, uemail)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();

    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
