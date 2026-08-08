-- ============================================================
-- DashMatrix — Supabase Tables
-- Organized by tab/page
-- ============================================================

-- ============================================================
-- TAB: Tableau de bord (/)
-- Tables: orders, products, expenses
-- ============================================================

-- ============================================================
-- TAB: Commandes (/orders) & Détail commande (/orders/:orderId)
-- Table: orders
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAB: Produits (/products)
-- Table: products
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  compare_price NUMERIC,
  category TEXT NOT NULL DEFAULT 'Autre',
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  images TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAB: Comptabilité (/accounting)
-- Tables: orders, expenses
-- ============================================================

-- ============================================================
-- TAB: Designer du site (/designer) & Boutique (/store)
-- Tables: site_content, products
-- ============================================================

-- ============================================================
-- Table: site_content
-- ============================================================

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  urgency_banner TEXT DEFAULT '',
  urgency_banner_active BOOLEAN DEFAULT true,
  stock_warning TEXT DEFAULT '',
  stock_count INTEGER DEFAULT 0,
  product_title TEXT DEFAULT '',
  product_icon TEXT DEFAULT '',
  product_description TEXT DEFAULT '',
  price_label TEXT DEFAULT '',
  order_form_title TEXT DEFAULT '',
  order_form_subtitle TEXT DEFAULT '',
  order_button_text TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  whatsapp_active BOOLEAN DEFAULT true,
  why_title TEXT DEFAULT '',
  why_features JSONB DEFAULT '[]',
  why_cta TEXT DEFAULT '',
  why_image TEXT DEFAULT '',
  hero_title TEXT DEFAULT '',
  hero_text TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  hero_cta TEXT DEFAULT '',
  delivery_title TEXT DEFAULT '',
  delivery_text TEXT DEFAULT '',
  delivery_image TEXT DEFAULT '',
  delivery_cta TEXT DEFAULT '',
  faq_title TEXT DEFAULT '',
  faq JSONB DEFAULT '[]',
  showcase_image TEXT DEFAULT '',
  comparisons JSONB DEFAULT '[]',
  stats_title TEXT DEFAULT '',
  stats JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  urgency_title TEXT DEFAULT '',
  urgency_cta TEXT DEFAULT '',
  reviews_map_title TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#334155',
  button_color TEXT DEFAULT '#334155',
  facebook_pixel_id TEXT DEFAULT ''
);

-- ============================================================
-- Table: expenses
-- ============================================================

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  amount NUMERIC NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- orders: anonymous read/write
CREATE POLICY orders_anon_read ON orders FOR SELECT USING (true);
CREATE POLICY orders_anon_insert ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS orders_anon_update ON orders;
CREATE POLICY orders_anon_update ON orders FOR UPDATE USING (true);
DROP POLICY IF EXISTS orders_anon_delete ON orders;
CREATE POLICY orders_anon_delete ON orders FOR DELETE USING (true);

-- products: anonymous read/write
CREATE POLICY products_anon_read ON products FOR SELECT USING (true);
CREATE POLICY products_anon_insert ON products FOR INSERT WITH CHECK (true);
CREATE POLICY products_anon_update ON products FOR UPDATE USING (true);
CREATE POLICY products_anon_delete ON products FOR DELETE USING (true);

-- site_content: anonymous read, upsert
CREATE POLICY site_content_anon_read ON site_content FOR SELECT USING (true);
CREATE POLICY site_content_anon_upsert ON site_content FOR ALL USING (true);

-- expenses: anonymous read/write
CREATE POLICY expenses_anon_read ON expenses FOR SELECT USING (true);
CREATE POLICY expenses_anon_insert ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY expenses_anon_update ON expenses FOR UPDATE USING (true);
CREATE POLICY expenses_anon_delete ON expenses FOR DELETE USING (true);
-- ============================================================
-- Supabase Storage: product-images bucket
-- NOTE: Create the bucket "product-images" in the Supabase Dashboard > Storage first.
-- Then run the RLS policies below.
-- ============================================================

CREATE POLICY product_images_anon_insert ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY product_images_anon_read ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY product_images_anon_update ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY product_images_anon_delete ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
