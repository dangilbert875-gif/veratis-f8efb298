
-- Extend orders table with new fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shipping_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tracking_number text;

UPDATE public.orders SET user_id = customer_id WHERE user_id IS NULL;

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text,
  description text,
  price_usd numeric NOT NULL DEFAULT 0,
  purity text,
  endotoxin text,
  lot_number text,
  stock_status text NOT NULL DEFAULT 'in_stock',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PRODUCT LOTS
CREATE TABLE IF NOT EXISTS public.product_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  lot_number text NOT NULL UNIQUE,
  purity text,
  identity_status text,
  endotoxin text,
  water_content text,
  release_date date,
  best_before date,
  coa_url text,
  tested_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lots public read" ON public.product_lots FOR SELECT USING (true);
CREATE POLICY "lots admin write" ON public.product_lots FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER lots_touch BEFORE UPDATE ON public.product_lots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items own select" ON public.order_items FOR SELECT TO authenticated USING (
  has_role(auth.uid(),'admin') OR EXISTS (
    SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.customer_id = auth.uid())
  )
);
CREATE POLICY "order_items admin write" ON public.order_items FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- EDUCATIONAL ARTICLES
CREATE TABLE IF NOT EXISTS public.educational_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text,
  excerpt text,
  body text,
  featured_image text,
  seo_title text,
  seo_description text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.educational_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles public read published" ON public.educational_articles FOR SELECT
  USING (published = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "articles admin write" ON public.educational_articles FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER articles_touch BEFORE UPDATE ON public.educational_articles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- VERIFICATION LOGS
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number text NOT NULL,
  lookup_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verif insert public" ON public.verification_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "verif admin read" ON public.verification_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- AFFILIATES
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  affiliate_code text NOT NULL UNIQUE,
  commission_percent numeric NOT NULL DEFAULT 10,
  total_referrals integer NOT NULL DEFAULT 0,
  total_sales numeric NOT NULL DEFAULT 0,
  payout_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliates own select" ON public.affiliates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "affiliates admin write" ON public.affiliates FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER affiliates_touch BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- AFFILIATE REFERRALS
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  commission_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aff_ref own select" ON public.affiliate_referrals FOR SELECT TO authenticated USING (
  has_role(auth.uid(),'admin') OR EXISTS (
    SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()
  )
);
CREATE POLICY "aff_ref admin write" ON public.affiliate_referrals FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Veratis',
  support_email text,
  btc_wallet text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.settings FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.settings (site_name) VALUES ('Veratis') ON CONFLICT DO NOTHING;

-- Grant admin role to dangilbert875@gmail.com if the auth user exists
DO $$
DECLARE u_id uuid;
BEGIN
  SELECT id INTO u_id FROM auth.users WHERE email = 'dangilbert875@gmail.com' LIMIT 1;
  IF u_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email) VALUES (u_id, 'dangilbert875@gmail.com')
      ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (u_id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
