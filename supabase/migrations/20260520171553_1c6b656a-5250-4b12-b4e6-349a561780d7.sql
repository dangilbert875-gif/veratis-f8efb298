-- Expand orders for full operational control
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS shipping_name text,
  ADD COLUMN IF NOT EXISTS shipping_address_1 text,
  ADD COLUMN IF NOT EXISTS shipping_address_2 text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS shipping_zip text,
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS btc_tx_hash text,
  ADD COLUMN IF NOT EXISTS btc_confirmations integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_expires_at timestamptz;

-- Backfill fulfillment_status from existing shipping_status if present
UPDATE public.orders
SET fulfillment_status = CASE
  WHEN shipping_status IN ('shipped','delivered','processing','packed','held','cancelled') THEN shipping_status
  WHEN status = 'shipped' THEN 'shipped'
  WHEN status = 'delivered' THEN 'delivered'
  WHEN status = 'cancelled' THEN 'cancelled'
  ELSE 'not_started'
END
WHERE fulfillment_status = 'not_started';

-- Backfill btc_tx_hash from transaction_hash
UPDATE public.orders
SET btc_tx_hash = transaction_hash
WHERE btc_tx_hash IS NULL AND transaction_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- order_items: enrich for fulfillment
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS lot_number text,
  ADD COLUMN IF NOT EXISTS coa_url text;
