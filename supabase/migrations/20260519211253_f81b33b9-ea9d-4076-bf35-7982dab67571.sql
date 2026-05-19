-- Veratis backend schema initialization (idempotent)

-- Required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'affiliate');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
  END IF;
END $$;

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Admin role helper. Roles must live in user_roles, not profiles.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Products
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

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- Product lots / COA archive
CREATE TABLE IF NOT EXISTS public.product_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_product_lots_product_id ON public.product_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_lot_number ON public.product_lots(lot_number);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid,
  user_id uuid,
  customer_email text NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  total_usd numeric NOT NULL DEFAULT 0,
  btc_amount numeric,
  btc_address text,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  shipping_status text NOT NULL DEFAULT 'pending',
  tracking_number text,
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Educational CMS
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

CREATE INDEX IF NOT EXISTS idx_educational_articles_slug ON public.educational_articles(slug);
CREATE INDEX IF NOT EXISTS idx_educational_articles_published ON public.educational_articles(published);

-- Verification logs
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number text NOT NULL,
  lookup_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_logs_lot_number ON public.verification_logs(lot_number);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON public.verification_logs(created_at);

-- Affiliates
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

CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliate_code ON public.affiliates(affiliate_code);

-- Affiliate referrals
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  commission_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_order_id ON public.affiliate_referrals(order_id);

-- Settings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Veratis',
  support_email text,
  btc_wallet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auth profile bootstrap function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles',
    'products',
    'product_lots',
    'orders',
    'educational_articles',
    'affiliates',
    'settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS touch_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER touch_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles self select" ON public.profiles;
CREATE POLICY "profiles self select" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles self insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles admin insert" ON public.profiles;
CREATE POLICY "profiles self insert" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
CREATE POLICY "profiles self update" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
DROP POLICY IF EXISTS "roles self select" ON public.user_roles;
CREATE POLICY "roles self select" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "roles admin manage" ON public.user_roles;
CREATE POLICY "roles admin manage" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products policies
DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read" ON public.products
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "products admin write" ON public.products;
CREATE POLICY "products admin write" ON public.products
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Product lots policies
DROP POLICY IF EXISTS "lots public read" ON public.product_lots;
CREATE POLICY "lots public read" ON public.product_lots
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "lots admin write" ON public.product_lots;
CREATE POLICY "lots admin write" ON public.product_lots
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders policies
DROP POLICY IF EXISTS "orders own select" ON public.orders;
CREATE POLICY "orders own select" ON public.orders
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "orders customer insert" ON public.orders;
CREATE POLICY "orders customer insert" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "orders admin write" ON public.orders;
CREATE POLICY "orders admin write" ON public.orders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Order items policies
DROP POLICY IF EXISTS "order_items own select" ON public.order_items;
CREATE POLICY "order_items own select" ON public.order_items
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (o.customer_id = auth.uid() OR o.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "order_items admin write" ON public.order_items;
CREATE POLICY "order_items admin write" ON public.order_items
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Educational article policies
DROP POLICY IF EXISTS "articles public read published" ON public.educational_articles;
CREATE POLICY "articles public read published" ON public.educational_articles
FOR SELECT TO public
USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "articles admin write" ON public.educational_articles;
CREATE POLICY "articles admin write" ON public.educational_articles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Verification log policies
DROP POLICY IF EXISTS "verif insert public" ON public.verification_logs;
CREATE POLICY "verif insert public" ON public.verification_logs
FOR INSERT TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "verif admin read" ON public.verification_logs;
CREATE POLICY "verif admin read" ON public.verification_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Affiliates policies
DROP POLICY IF EXISTS "affiliates own select" ON public.affiliates;
CREATE POLICY "affiliates own select" ON public.affiliates
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "affiliates own insert" ON public.affiliates;
CREATE POLICY "affiliates own insert" ON public.affiliates
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "affiliates admin write" ON public.affiliates;
CREATE POLICY "affiliates admin write" ON public.affiliates
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Affiliate referral policies
DROP POLICY IF EXISTS "aff_ref own select" ON public.affiliate_referrals;
CREATE POLICY "aff_ref own select" ON public.affiliate_referrals
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.affiliates a
    WHERE a.id = affiliate_referrals.affiliate_id
      AND a.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "aff_ref admin write" ON public.affiliate_referrals;
CREATE POLICY "aff_ref admin write" ON public.affiliate_referrals
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Settings policies
DROP POLICY IF EXISTS "settings public read" ON public.settings;
CREATE POLICY "settings public read" ON public.settings
FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "settings admin write" ON public.settings;
CREATE POLICY "settings admin write" ON public.settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed a default settings row if none exists
INSERT INTO public.settings (site_name, support_email)
SELECT 'Veratis', 'support@veratis.com'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
