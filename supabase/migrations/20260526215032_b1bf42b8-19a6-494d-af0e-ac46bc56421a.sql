ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_created_webhook_sent boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_order_created_webhook_sent
ON public.orders (order_number, order_created_webhook_sent);