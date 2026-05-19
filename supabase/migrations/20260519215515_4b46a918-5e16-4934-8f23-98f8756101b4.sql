
-- =====================================================================
-- ENUMS
-- =====================================================================
DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft','published','archived','out_of_stock');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.article_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.customer_state AS ENUM ('active','vip','research_partner','suspended','flagged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.research_partner_status AS ENUM ('applied','approved','rejected','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.affiliate_status AS ENUM ('active','paused','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend order_status enum with new values (idempotent)
DO $$ BEGIN
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_payment';
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'packed'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivered'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'refunded'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'cancelled'; EXCEPTION WHEN others THEN NULL; END $$;

-- =====================================================================
-- PRODUCTS — extend
-- =====================================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS full_description text,
  ADD COLUMN IF NOT EXISTS molecular_class text,
  ADD COLUMN IF NOT EXISTS storage_guidance text,
  ADD COLUMN IF NOT EXISTS lyophilized boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_image text,
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS compare_at_price numeric,
  ADD COLUMN IF NOT EXISTS inventory_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS meta_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status public.product_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS related_product_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_article_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sort ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products(archived_at);

-- =====================================================================
-- PRODUCT LOTS — extend
-- =====================================================================
ALTER TABLE public.product_lots
  ADD COLUMN IF NOT EXISTS identity_method text,
  ADD COLUMN IF NOT EXISTS lab_partner text,
  ADD COLUMN IF NOT EXISTS lcms_url text,
  ADD COLUMN IF NOT EXISTS hplc_url text,
  ADD COLUMN IF NOT EXISTS raw_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_lots_active ON public.product_lots(active);
CREATE INDEX IF NOT EXISTS idx_lots_lot_number ON public.product_lots(lot_number);

-- =====================================================================
-- EDUCATIONAL ARTICLES — extend
-- =====================================================================
ALTER TABLE public.educational_articles
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS peptide_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_product_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_article_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS external_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status public.article_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Backfill status from existing published boolean
UPDATE public.educational_articles
SET status = CASE WHEN published THEN 'published'::public.article_status ELSE 'draft'::public.article_status END
WHERE status = 'draft';

CREATE INDEX IF NOT EXISTS idx_articles_status ON public.educational_articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_publish_at ON public.educational_articles(publish_at);

-- =====================================================================
-- ORDERS — extend
-- =====================================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS transaction_hash text,
  ADD COLUMN IF NOT EXISTS risk_flag boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- =====================================================================
-- AFFILIATES — extend
-- =====================================================================
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS payout_address text,
  ADD COLUMN IF NOT EXISTS payout_preference text NOT NULL DEFAULT 'btc',
  ADD COLUMN IF NOT EXISTS status public.affiliate_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS pending_payout numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_payout_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- =====================================================================
-- NEW TABLE: customer_meta (CRM extension to profiles)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.customer_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  tags text[] NOT NULL DEFAULT '{}',
  state public.customer_state NOT NULL DEFAULT 'active',
  admin_notes text,
  total_spend numeric NOT NULL DEFAULT 0,
  last_order_at timestamptz,
  referral_source text,
  affiliate_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by uuid
);
ALTER TABLE public.customer_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_meta admin all" ON public.customer_meta;
CREATE POLICY "customer_meta admin all" ON public.customer_meta
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "customer_meta self select" ON public.customer_meta;
CREATE POLICY "customer_meta self select" ON public.customer_meta
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

DROP TRIGGER IF EXISTS trg_customer_meta_updated_at ON public.customer_meta;
CREATE TRIGGER trg_customer_meta_updated_at
  BEFORE UPDATE ON public.customer_meta
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================================
-- NEW TABLE: research_partners
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.research_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid,
  institution text NOT NULL,
  research_category text,
  contact_email text,
  status public.research_partner_status NOT NULL DEFAULT 'applied',
  nda_accepted_at timestamptz,
  verification_docs jsonb NOT NULL DEFAULT '[]'::jsonb,
  pricing_tier text,
  account_manager_id uuid,
  notes text,
  purchase_volume numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by uuid
);
ALTER TABLE public.research_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "research_partners admin all" ON public.research_partners;
CREATE POLICY "research_partners admin all" ON public.research_partners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "research_partners self select" ON public.research_partners;
CREATE POLICY "research_partners self select" ON public.research_partners
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- Public application submission (status forced to 'applied')
DROP POLICY IF EXISTS "research_partners public apply" ON public.research_partners;
CREATE POLICY "research_partners public apply" ON public.research_partners
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'applied'
    AND length(trim(institution)) BETWEEN 1 AND 255
    AND (contact_email IS NULL OR length(trim(contact_email)) BETWEEN 3 AND 255));

DROP TRIGGER IF EXISTS trg_research_partners_updated_at ON public.research_partners;
CREATE TRIGGER trg_research_partners_updated_at
  BEFORE UPDATE ON public.research_partners
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================================
-- NEW TABLE: referral_clicks
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  affiliate_code text,
  ip_hash text,
  referrer text,
  landed_at timestamptz NOT NULL DEFAULT now(),
  converted_order_id uuid,
  converted_at timestamptz
);
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_referral_clicks_affiliate ON public.referral_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_landed_at ON public.referral_clicks(landed_at);

DROP POLICY IF EXISTS "ref_clicks admin all" ON public.referral_clicks;
CREATE POLICY "ref_clicks admin all" ON public.referral_clicks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "ref_clicks affiliate select" ON public.referral_clicks;
CREATE POLICY "ref_clicks affiliate select" ON public.referral_clicks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = referral_clicks.affiliate_id AND a.user_id = auth.uid()));

-- Public insert for click tracking (no PII)
DROP POLICY IF EXISTS "ref_clicks public insert" ON public.referral_clicks;
CREATE POLICY "ref_clicks public insert" ON public.referral_clicks
  FOR INSERT TO anon, authenticated
  WITH CHECK (affiliate_id IS NOT NULL
    AND (ip_hash IS NULL OR length(ip_hash) <= 128)
    AND (referrer IS NULL OR length(referrer) <= 2048));

-- =====================================================================
-- NEW TABLE: audit_logs
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  diff jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

DROP POLICY IF EXISTS "audit_logs admin read" ON public.audit_logs;
CREATE POLICY "audit_logs admin read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies — entries are only written by SECURITY DEFINER triggers below.

-- =====================================================================
-- NEW TABLE: article_views (append-only)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  ip_hash text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_article_views_article ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_at ON public.article_views(viewed_at);

DROP POLICY IF EXISTS "article_views admin read" ON public.article_views;
CREATE POLICY "article_views admin read" ON public.article_views
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "article_views public insert" ON public.article_views;
CREATE POLICY "article_views public insert" ON public.article_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (article_id IS NOT NULL AND (ip_hash IS NULL OR length(ip_hash) <= 128));

-- =====================================================================
-- TIGHTEN PRODUCT / ARTICLE / LOT PUBLIC READ POLICIES
-- =====================================================================
DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read" ON public.products
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "articles public read published" ON public.educational_articles;
CREATE POLICY "articles public read published" ON public.educational_articles
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "lots public read" ON public.product_lots;
CREATE POLICY "lots public read" ON public.product_lots
  FOR SELECT TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- AUDIT TRIGGER FUNCTION + ATTACH
-- =====================================================================
CREATE OR REPLACE FUNCTION public.log_audit_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_entity_id text;
  v_diff jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_entity_id := COALESCE(OLD.id::text, '');
    v_diff := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    v_entity_id := COALESCE(NEW.id::text, '');
    v_diff := jsonb_build_object('new', to_jsonb(NEW));
  ELSE
    v_entity_id := COALESCE(NEW.id::text, OLD.id::text, '');
    v_diff := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, diff)
  VALUES (v_actor, TG_OP, TG_TABLE_NAME, v_entity_id, v_diff);

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_change() FROM PUBLIC;

-- Attach audit trigger to operational tables
DROP TRIGGER IF EXISTS trg_audit_products ON public.products;
CREATE TRIGGER trg_audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_product_lots ON public.product_lots;
CREATE TRIGGER trg_audit_product_lots
  AFTER INSERT OR UPDATE OR DELETE ON public.product_lots
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_articles ON public.educational_articles;
CREATE TRIGGER trg_audit_articles
  AFTER INSERT OR UPDATE OR DELETE ON public.educational_articles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_orders ON public.orders;
CREATE TRIGGER trg_audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS trg_audit_payouts ON public.payouts;
CREATE TRIGGER trg_audit_payouts
  AFTER INSERT OR UPDATE OR DELETE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- =====================================================================
-- STORAGE BUCKETS + POLICIES
-- =====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('article-images', 'article-images', true),
  ('coa-pdfs', 'coa-pdfs', false),
  ('chromatograms', 'chromatograms', false),
  ('raw-lab-data', 'raw-lab-data', false)
ON CONFLICT (id) DO NOTHING;

-- Public buckets: anyone can read
DROP POLICY IF EXISTS "public images read" ON storage.objects;
CREATE POLICY "public images read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images', 'article-images'));

-- Admin upload/modify across all admin buckets
DROP POLICY IF EXISTS "admin storage write" ON storage.objects;
CREATE POLICY "admin storage write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'article-images', 'coa-pdfs', 'chromatograms', 'raw-lab-data')
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admin storage update" ON storage.objects;
CREATE POLICY "admin storage update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('product-images', 'article-images', 'coa-pdfs', 'chromatograms', 'raw-lab-data')
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admin storage delete" ON storage.objects;
CREATE POLICY "admin storage delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('product-images', 'article-images', 'coa-pdfs', 'chromatograms', 'raw-lab-data')
    AND public.has_role(auth.uid(), 'admin')
  );

-- Admins can read private buckets (public ones already covered above)
DROP POLICY IF EXISTS "admin private buckets read" ON storage.objects;
CREATE POLICY "admin private buckets read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('coa-pdfs', 'chromatograms', 'raw-lab-data')
    AND public.has_role(auth.uid(), 'admin')
  );
