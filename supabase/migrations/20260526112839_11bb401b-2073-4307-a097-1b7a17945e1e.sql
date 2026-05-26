
-- 1. Inventory decrement RPC: atomically reduces stock by slug, never below 0.
CREATE OR REPLACE FUNCTION public.decrement_product_inventory(_slug text, _qty integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF _qty IS NULL OR _qty <= 0 THEN
    RETURN NULL;
  END IF;
  UPDATE public.products
  SET inventory_count = GREATEST(0, inventory_count - _qty),
      stock_status = CASE
        WHEN GREATEST(0, inventory_count - _qty) = 0 THEN 'out_of_stock'
        ELSE stock_status
      END,
      updated_at = now()
  WHERE slug = _slug
  RETURNING inventory_count INTO new_count;
  RETURN new_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_product_inventory(text, integer) FROM PUBLIC, anon, authenticated;

-- 2. Raise low-stock alert floor to 20 bottles for all products
ALTER TABLE public.products ALTER COLUMN low_stock_threshold SET DEFAULT 20;
UPDATE public.products SET low_stock_threshold = 20 WHERE low_stock_threshold < 20;
