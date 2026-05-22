-- Promo / referral codes: support fixed-amount discounts and unattached codes
ALTER TABLE public.referrals
  ALTER COLUMN partner_id DROP NOT NULL;

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS discount_type text NOT NULL DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_discount_type_check;
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_discount_type_check
  CHECK (discount_type IN ('percent','fixed'));

-- Unique code (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS referrals_code_lower_idx
  ON public.referrals (lower(code));

-- Orders: capture applied promo code + discount amount
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_code text,
  ADD COLUMN IF NOT EXISTS discount_amount_usd numeric NOT NULL DEFAULT 0;

-- Public lookup by code (RLS-bypassing security definer, returns only safe columns)
CREATE OR REPLACE FUNCTION public.lookup_promo_code(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  label text,
  discount_type text,
  discount_amount numeric,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.code, r.label, r.discount_type, r.discount_amount, r.active
  FROM public.referrals r
  WHERE lower(r.code) = lower(trim(_code))
    AND r.active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_promo_code(text) TO anon, authenticated;