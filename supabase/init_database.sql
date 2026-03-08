-- ═══════════════════════════════════════════════════════════════════════════
-- Shop-ia — Script d'initialisation consolidé
-- Généré le 2026-03-08
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Ce fichier consolide TOUS les scripts de migration (migration.sql, v3–v11,
-- budtender, fix, rescue, vectors) en un seul CREATE TABLE propre.
--
-- Usage : exécuter dans Supabase Dashboard → SQL Editor sur une base vierge.
--
-- IMPORTANT : après ce script, appliquer séparément les fichiers d'embeddings
-- si nécessaire :
--   apply_vectors_part1.sql
--   apply_vectors_part2.sql
--   apply_vectors_part3.sql
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS vector;


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Categories ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  icon_name   text,
  image_url   text,
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Products ──────────────────────────────────────────────────────────────
-- Intègre : is_bundle, original_value (v2), attributes (base), sku (v6),
--           embedding vector(3072) (unify_vectors)

CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES categories(id),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  description     text,
  nutriscore      text,
  weight_info     text,
  weight_grams    numeric(8,2),
  price           numeric(10,2) NOT NULL,
  image_url       text,
  stock_quantity  int NOT NULL DEFAULT 0,
  is_available    boolean NOT NULL DEFAULT true,
  is_featured     boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  is_bundle       boolean NOT NULL DEFAULT false,
  is_subscribable boolean NOT NULL DEFAULT false,
  original_value  numeric(10,2),
  attributes      jsonb DEFAULT '{}'::jsonb,
  sku             text UNIQUE,
  embedding       vector(3072),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Profiles ──────────────────────────────────────────────────────────────
-- Intègre : referral_code, referred_by_id (v3), email (v11)

CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  email           text,
  loyalty_points  int NOT NULL DEFAULT 0,
  is_admin        boolean NOT NULL DEFAULT false,
  referral_code   text UNIQUE,
  referred_by_id  uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Addresses ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT 'Domicile',
  street      text NOT NULL,
  city        text NOT NULL,
  postal_code text NOT NULL,
  country     text NOT NULL DEFAULT 'France',
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Orders ────────────────────────────────────────────────────────────────
-- Intègre : loyalty_points_redeemed (base phase 3), promo_code/promo_discount (base)

CREATE TABLE IF NOT EXISTS orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES profiles(id),
  status                  text NOT NULL DEFAULT 'pending',
  delivery_type           text NOT NULL DEFAULT 'click_collect',
  address_id              uuid REFERENCES addresses(id),
  subtotal                numeric(10,2) NOT NULL,
  delivery_fee            numeric(10,2) NOT NULL DEFAULT 0,
  total                   numeric(10,2) NOT NULL,
  loyalty_points_earned   int NOT NULL DEFAULT 0,
  loyalty_points_redeemed int NOT NULL DEFAULT 0,
  promo_code              text,
  promo_discount          numeric(10,2) NOT NULL DEFAULT 0,
  viva_order_code         text,
  payment_status          text NOT NULL DEFAULT 'pending',
  notes                   text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── Order Items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  unit_price   numeric(10,2) NOT NULL,
  quantity     int NOT NULL,
  total_price  numeric(10,2) NOT NULL
);

-- ─── Stock Movements ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stock_movements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id),
  quantity_change int NOT NULL,
  type            text NOT NULL,
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Store Settings ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS store_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Loyalty Transactions ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id      uuid REFERENCES orders(id) ON DELETE SET NULL,
  type          text NOT NULL CHECK (type IN ('earned', 'redeemed', 'adjusted', 'expired')),
  points        int NOT NULL,
  balance_after int NOT NULL,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Subscriptions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id         uuid NOT NULL REFERENCES products(id),
  quantity           int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  frequency          text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  next_delivery_date date NOT NULL,
  status             text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ─── Subscription Orders ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscription_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── Reviews ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      text,
  is_verified  boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id, order_id)
);

-- ─── Promo Codes ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promo_codes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text UNIQUE NOT NULL,
  description      text,
  discount_type    text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value   numeric(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_value  numeric(10,2) NOT NULL DEFAULT 0,
  max_uses         int,
  uses_count       int NOT NULL DEFAULT 0,
  expires_at       timestamptz,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── Bundle Items ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bundle_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bundle_id, product_id)
);

-- ─── Product Recommendations (Cross-Selling) ──────────────────────────────

CREATE TABLE IF NOT EXISTS product_recommendations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommended_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order     int NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, recommended_id),
  CHECK (product_id <> recommended_id)
);

-- ─── Referrals (v3) ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS referrals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id    uuid NOT NULL REFERENCES profiles(id),
  referee_id     uuid NOT NULL REFERENCES profiles(id),
  status         text NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'completed')),
  reward_issued  boolean DEFAULT false,
  points_awarded integer DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

-- ─── POS Reports (v5 + v7 reconciliation) ─────────────────────────────────
-- Intègre : product_breakdown, cash_counted, cash_difference (v7)

CREATE TABLE IF NOT EXISTS pos_reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date                date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_sales         numeric(10,2) NOT NULL DEFAULT 0,
  cash_total          numeric(10,2) NOT NULL DEFAULT 0,
  card_total          numeric(10,2) NOT NULL DEFAULT 0,
  mobile_total        numeric(10,2) NOT NULL DEFAULT 0,
  items_sold          int NOT NULL DEFAULT 0,
  order_count         int NOT NULL DEFAULT 0,
  product_breakdown   jsonb DEFAULT '{}'::jsonb,
  cash_counted        numeric(10,2) DEFAULT 0,
  cash_difference     numeric(10,2) DEFAULT 0,
  closed_at           timestamptz NOT NULL DEFAULT now(),
  closed_by           uuid REFERENCES profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ─── User AI Preferences (BudTender) ──────────────────────────────────────
-- Intègre : age_range, intensity_preference (v5), extra_prefs (v6)

CREATE TABLE IF NOT EXISTS user_ai_preferences (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal                 text,
  experience_level     text,
  preferred_format     text,
  budget_range         text,
  aroma_preferences    text[] DEFAULT '{}',
  age_range            text,
  intensity_preference text,
  extra_prefs          jsonb DEFAULT '{}'::jsonb,
  updated_at           timestamptz DEFAULT now()
);

-- ─── BudTender Interactions ────────────────────────────────────────────────
-- session_id est nullable (fix_budtender_interactions)

CREATE TABLE IF NOT EXISTS assistant_interactions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id           text,
  interaction_type     text NOT NULL,
  quiz_answers         jsonb DEFAULT '{}',
  recommended_products uuid[],
  clicked_product      uuid REFERENCES products(id) ON DELETE SET NULL,
  feedback             text CHECK (feedback IN ('positive', 'negative')),
  created_at           timestamptz DEFAULT now(),
  UNIQUE(user_id, session_id)
);

COMMENT ON COLUMN assistant_interactions.clicked_product IS 'ID of the product clicked during a recommendation session';
COMMENT ON COLUMN assistant_interactions.feedback IS 'User satisfaction feedback: positive or negative';
COMMENT ON COLUMN assistant_interactions.recommended_products IS 'List of product IDs suggested by the AI in this interaction';

-- ─── User Active Sessions (v9) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_active_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id   text NOT NULL,
  device_name text,
  user_agent  text,
  ip_address  text,
  last_seen   timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_extra_prefs ON user_ai_preferences USING GIN (extra_prefs);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_user_last_seen ON user_active_sessions(user_id, last_seen DESC);


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. FONCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── is_admin : check if current user is admin (bypassing RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── handle_new_user : profil auto à l'inscription (v11 : inclut email) ──

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Referral Code Generation (rescue_signup_500 : version robuste) ──────

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN DEFAULT FALSE;
BEGIN
  FOR i IN 1..10 LOOP
    new_code := 'GRN-' || upper(substring(md5(random()::text) from 1 for 6));
    done := NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
    IF done THEN
      RETURN new_code;
    END IF;
  END LOOP;
  -- Fallback with timestamp (très improbable)
  RETURN 'GRN-' || upper(substring(md5(now()::text) from 1 for 6));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.tr_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    BEGIN
      NEW.referral_code := public.generate_referral_code();
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Referral code generation failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created_gen_code ON public.profiles;
CREATE TRIGGER on_profile_created_gen_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tr_generate_referral_code();

-- ─── Promo Code Usage ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_promo_uses(code_text text)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes SET uses_count = uses_count + 1 WHERE code = code_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Bundle Stock Sync ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_bundle_stock(p_bundle_id uuid)
RETURNS void AS $$
DECLARE
  min_stock int;
BEGIN
  SELECT MIN(FLOOR(p.stock_quantity::float / bi.quantity))::int
    INTO min_stock
    FROM bundle_items bi
    JOIN products p ON p.id = bi.product_id
   WHERE bi.bundle_id = p_bundle_id;

  UPDATE products
     SET stock_quantity = COALESCE(min_stock, 0)
   WHERE id = p_bundle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trigger_sync_bundles_on_stock_change()
RETURNS trigger AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT bundle_id FROM bundle_items WHERE product_id = NEW.id
  LOOP
    PERFORM public.sync_bundle_stock(r.bundle_id);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_bundle_stock ON products;
CREATE TRIGGER trg_sync_bundle_stock
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity AND NEW.is_bundle = false)
  EXECUTE FUNCTION public.trigger_sync_bundles_on_stock_change();

-- ─── Product Recommendations (avec fallback catégorie) ─────────────────────

CREATE OR REPLACE FUNCTION public.get_product_recommendations(p_product_id uuid, p_limit int DEFAULT 4)
RETURNS SETOF products AS $$
DECLARE
  cat_id uuid;
BEGIN
  SELECT category_id INTO cat_id FROM products WHERE id = p_product_id;

  RETURN QUERY
    SELECT prod.*
    FROM (
        SELECT r.recommended_id as id, 0 AS priority, r.sort_order AS srt
        FROM product_recommendations r
        JOIN products p ON p.id = r.recommended_id
        WHERE r.product_id = p_product_id
          AND p.is_active = true AND p.is_available = true
        UNION ALL
        SELECT p.id, 1 AS priority, (random() * 100)::int AS srt
        FROM products p
        WHERE p.category_id = cat_id
          AND p.id <> p_product_id
          AND p.is_active = true AND p.is_available = true
          AND NOT EXISTS (
            SELECT 1 FROM product_recommendations
            WHERE product_id = p_product_id AND recommended_id = p.id
          )
    ) sub
    JOIN products prod ON prod.id = sub.id
    ORDER BY sub.priority, sub.srt
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── Vector Search : match_products ────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  category_id uuid,
  slug text,
  name text,
  description text,
  nutriscore text,
  weight_info text,
  weight_grams numeric(8,2),
  price numeric(10,2),
  image_url text,
  stock_quantity int,
  is_available boolean,
  is_featured boolean,
  is_active boolean,
  created_at timestamptz,
  attributes jsonb,
  is_bundle boolean,
  original_value numeric(10,2),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.category_id,
    p.slug,
    p.name,
    p.description,
    p.nutriscore,
    p.weight_info,
    p.weight_grams,
    p.price,
    p.image_url,
    p.stock_quantity,
    p.is_available,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.attributes,
    p.is_bundle,
    p.original_value,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.is_active = true
    AND p.is_available = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ─── POS Customer Creation (v10 : avec identité) ──────────────────────────

CREATE OR REPLACE FUNCTION public.create_pos_customer(
  p_full_name text,
  p_phone     text DEFAULT NULL,
  p_email     text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_email   text;
BEGIN
  -- Admin-only guard
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  v_email := COALESCE(p_email, 'pos_' || replace(v_user_id::text, '-', '') || '@greenmoon.internal');

  -- 1. Create auth user
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    role, raw_user_meta_data, created_at, updated_at,
    aud, confirmation_token, is_super_admin
  )
  VALUES (
    v_user_id, v_email,
    crypt(replace(gen_random_uuid()::text, '-', ''), gen_salt('bf')),
    now(), 'authenticated',
    jsonb_build_object('full_name', p_full_name),
    now(), now(), 'authenticated', '', false
  );

  -- 2. Create identity (required for Supabase Dashboard visibility)
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  )
  VALUES (
    v_user_id, v_user_id,
    jsonb_build_object('sub', v_user_id, 'email', v_email),
    'email', now(), now(), now()
  );

  -- 3. Update profile with phone if provided
  IF p_phone IS NOT NULL AND p_phone <> '' THEN
    UPDATE public.profiles SET phone = p_phone WHERE id = v_user_id;
  END IF;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_pos_customer(text, text, text) TO authenticated;

COMMENT ON FUNCTION public.create_pos_customer IS
  'Creates a walk-in customer profile from the POS terminal. Admin-only. '
  'Includes identity creation for Supabase Dashboard visibility.';

-- ─── Admin : récupérer l'email d'un client (v11) ──────────────────────────

CREATE OR REPLACE FUNCTION public.admin_get_user_email(p_user_id uuid)
RETURNS text AS $$
DECLARE
  v_email text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.admin_get_user_email(uuid) TO authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enable RLS on all tables ──────────────────────────────────────────────

ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_preferences     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_interactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_sessions    ENABLE ROW LEVEL SECURITY;

-- ─── Categories : lecture publique ─────────────────────────────────────────

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_admin_write" ON categories;
CREATE POLICY "categories_admin_write" ON categories FOR ALL USING (
  public.is_admin()
);

-- ─── Products : lecture publique ───────────────────────────────────────────

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_admin_write" ON products FOR ALL USING (
  public.is_admin()
);

-- ─── Profiles : propriétaire ou admin ──────────────────────────────────────

DROP POLICY IF EXISTS "profiles_self_read" ON profiles;
CREATE POLICY "profiles_self_read" ON profiles FOR SELECT USING (
  id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "profiles_self_update" ON profiles;
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
  public.is_admin()
);

-- ─── Addresses : propriétaire uniquement ───────────────────────────────────

DROP POLICY IF EXISTS "addresses_owner" ON addresses;
CREATE POLICY "addresses_owner" ON addresses FOR ALL USING (user_id = auth.uid());

-- ─── Orders : propriétaire ou admin ────────────────────────────────────────

DROP POLICY IF EXISTS "orders_owner_read" ON orders;
CREATE POLICY "orders_owner_read" ON orders FOR SELECT USING (
  user_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "orders_auth_insert" ON orders;
CREATE POLICY "orders_auth_insert" ON orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (
  public.is_admin()
);

-- ─── Order Items : propriétaire ou admin ───────────────────────────────────

DROP POLICY IF EXISTS "order_items_owner_read" ON order_items;
CREATE POLICY "order_items_owner_read" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND (
      o.user_id = auth.uid() OR
      public.is_admin()
    )
  )
);

DROP POLICY IF EXISTS "order_items_auth_insert" ON order_items;
CREATE POLICY "order_items_auth_insert" ON order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── Stock Movements : admin uniquement ────────────────────────────────────

DROP POLICY IF EXISTS "stock_admin_all" ON stock_movements;
CREATE POLICY "stock_admin_all" ON stock_movements FOR ALL USING (
  public.is_admin()
);

-- ─── Store Settings : lecture publique, admin tout ─────────────────────────

DROP POLICY IF EXISTS "store_settings_public_read" ON store_settings;
CREATE POLICY "store_settings_public_read" ON store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "store_settings_admin_all" ON store_settings;
CREATE POLICY "store_settings_admin_all" ON store_settings FOR ALL USING (
  public.is_admin()
);

-- ─── Loyalty Transactions ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "loyalty_tx_owner_read" ON loyalty_transactions;
CREATE POLICY "loyalty_tx_owner_read" ON loyalty_transactions FOR SELECT USING (
  user_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "loyalty_tx_auth_insert" ON loyalty_transactions;
CREATE POLICY "loyalty_tx_auth_insert" ON loyalty_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "loyalty_tx_admin_all" ON loyalty_transactions;
CREATE POLICY "loyalty_tx_admin_all" ON loyalty_transactions FOR ALL USING (
  public.is_admin()
);

-- ─── Subscriptions ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "subscriptions_owner_read" ON subscriptions;
CREATE POLICY "subscriptions_owner_read" ON subscriptions FOR SELECT USING (
  user_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "subscriptions_owner_insert" ON subscriptions;
CREATE POLICY "subscriptions_owner_insert" ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions_owner_update" ON subscriptions;
CREATE POLICY "subscriptions_owner_update" ON subscriptions FOR UPDATE USING (
  user_id = auth.uid() OR
  public.is_admin()
);

-- ─── Subscription Orders ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "sub_orders_owner_read" ON subscription_orders;
CREATE POLICY "sub_orders_owner_read" ON subscription_orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND (
      s.user_id = auth.uid() OR
      public.is_admin()
    )
  )
);

DROP POLICY IF EXISTS "sub_orders_admin_insert" ON subscription_orders;
CREATE POLICY "sub_orders_admin_insert" ON subscription_orders FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- ─── Reviews ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (
  is_published = true OR
  user_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "reviews_owner_insert" ON reviews;
CREATE POLICY "reviews_owner_insert" ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_owner_update" ON reviews;
CREATE POLICY "reviews_owner_update" ON reviews FOR UPDATE
  USING (user_id = auth.uid() AND is_published = false);

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL USING (
  public.is_admin()
);

-- ─── Promo Codes ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "promo_codes_auth_read" ON promo_codes;
CREATE POLICY "promo_codes_auth_read" ON promo_codes FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "promo_codes_admin_all" ON promo_codes;
CREATE POLICY "promo_codes_admin_all" ON promo_codes FOR ALL USING (
  public.is_admin()
);

-- ─── Bundle Items ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "bundle_items_public_read" ON bundle_items;
CREATE POLICY "bundle_items_public_read" ON bundle_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "bundle_items_admin_all" ON bundle_items;
CREATE POLICY "bundle_items_admin_all" ON bundle_items FOR ALL USING (
  public.is_admin()
);

-- ─── Product Recommendations ───────────────────────────────────────────────

DROP POLICY IF EXISTS "recommendations_public_read" ON product_recommendations;
CREATE POLICY "recommendations_public_read" ON product_recommendations FOR SELECT USING (true);

DROP POLICY IF EXISTS "recommendations_admin_all" ON product_recommendations;
CREATE POLICY "recommendations_admin_all" ON product_recommendations FOR ALL USING (
  public.is_admin()
);

-- ─── Referrals ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can see their own referrals as referrer" ON referrals;
CREATE POLICY "Users can see their own referrals as referrer" ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can see their own referral as referee" ON referrals;
CREATE POLICY "Users can see their own referral as referee" ON referrals FOR SELECT
  USING (auth.uid() = referee_id);

-- ─── POS Reports ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "pos_reports_admin_all" ON pos_reports;
CREATE POLICY "pos_reports_admin_all" ON pos_reports FOR ALL USING (
  public.is_admin()
);

-- ─── User AI Preferences ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "ai_prefs_owner_all" ON user_ai_preferences;
CREATE POLICY "ai_prefs_owner_all" ON user_ai_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_prefs_admin_select" ON user_ai_preferences;
CREATE POLICY "ai_prefs_admin_select" ON user_ai_preferences
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ─── Assistant Interactions ────────────────────────────────────────────────

DROP POLICY IF EXISTS "interactions_owner_all" ON assistant_interactions;
CREATE POLICY "interactions_owner_all" ON assistant_interactions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interactions_admin_select" ON assistant_interactions;
CREATE POLICY "interactions_admin_select" ON assistant_interactions
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ─── User Active Sessions ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "sessions_self_select" ON user_active_sessions;
CREATE POLICY "sessions_self_select" ON user_active_sessions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "sessions_self_insert" ON user_active_sessions;
CREATE POLICY "sessions_self_insert" ON user_active_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sessions_self_update" ON user_active_sessions;
CREATE POLICY "sessions_self_update" ON user_active_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "sessions_self_delete" ON user_active_sessions;
CREATE POLICY "sessions_self_delete" ON user_active_sessions FOR DELETE
  USING (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. STORAGE : bucket product-images
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- We check for storage schema existence to avoid "relation storage.buckets does not exist"
  -- on environments where storage isn't initialized yet.
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'product-images',
        'product-images',
        true,
        5242880,
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      );
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
    CREATE POLICY "product_images_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');

    DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
    CREATE POLICY "product_images_admin_insert"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_admin()
      );

    DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
    CREATE POLICY "product_images_admin_update"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'product-images'
        AND public.is_admin()
      );

    DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
    CREATE POLICY "product_images_admin_delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'product-images'
        AND public.is_admin()
      );
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT ALL ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO anon;
GRANT ALL ON public.referrals TO service_role;


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Categories ────────────────────────────────────────────────────────────

INSERT INTO categories (slug, name, description, icon_name, image_url, sort_order) VALUES
  ('epicerie-salee', 'Épicerie Salée', 'Une sélection de produits salés de qualité pour vos repas quotidiens.', 'Utensils', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', 1),
  ('epicerie-sucree', 'Épicerie Sucrée', 'Douceurs, chocolats et produits sucrés pour tous les gourmands.', 'Cookie', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800', 2),
  ('boissons', 'Boissons', 'Jus artisanaux, thés bios et rafraîchissements naturels.', 'Coffee', 'https://images.unsplash.com/photo-1544145945-f904253d0c71?w=800', 3),
  ('produits-frais', 'Produits Frais', 'Sélection de produits de la ferme et produits laitiers frais.', 'Egg', 'https://images.unsplash.com/photo-1546487813-f931b2691761?w=800', 4)
ON CONFLICT (slug) DO NOTHING;

-- ─── Products ──────────────────────────────────────────────────────────────

DO $$
DECLARE
  cat_salee   uuid;
  cat_sucree  uuid;
  cat_boisson uuid;
  cat_frais   uuid;
BEGIN
  SELECT id INTO cat_salee   FROM categories WHERE slug = 'epicerie-salee';
  SELECT id INTO cat_sucree  FROM categories WHERE slug = 'epicerie-sucree';
  SELECT id INTO cat_boisson FROM categories WHERE slug = 'boissons';
  SELECT id INTO cat_frais   FROM categories WHERE slug = 'produits-frais';

  INSERT INTO products (category_id, slug, name, description, nutriscore, weight_info, weight_grams, price, image_url, stock_quantity, is_featured) VALUES
    (cat_salee, 'huile-olive-bio', 'Huile d''Olive Bio', 'Huile d''olive extra vierge extraite à froid. Origine Provence.', 'A', '500ml', 500, 14.90, 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?w=800', 50, true),
    (cat_salee, 'pates-artisanales', 'Pâtes Artisanales', 'Pâtes de blé dur séchées lentement pour une texture parfaite.', 'A', '500g', 500, 4.50, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800', 100, false),
    (cat_sucree, 'chocolat-noir', 'Chocolat Noir 70%', 'Chocolat noir intense issu du commerce équitable.', 'B', '100g', 100, 3.90, 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800', 80, true),
    (cat_sucree, 'miel-lavande', 'Miel de Lavande', 'Miel crémeux récolté au cœur de la Provence.', 'C', '250g', 250, 9.90, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800', 45, false),
    (cat_boisson, 'jus-pomme', 'Jus de Pomme Artisanal', 'Pur jus de pomme fraîchement pressé sans sucres ajoutés.', 'B', '1L', 1000, 5.50, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800', 60, true),
    (cat_boisson, 'the-vert', 'Thé Vert Bio', 'Thé vert bio de haute qualité aux notes délicates.', 'A', '100g', 100, 12.00, 'https://images.unsplash.com/photo-1597481499750-3e6b21643c12?w=800', 40, false),
    (cat_frais, 'fromage-chevre', 'Fromage de Chèvre', 'Fromage de chèvre frais de producteur local.', 'B', '200g', 200, 6.90, 'https://images.unsplash.com/photo-1485962391045-8c707d835041?w=800', 25, true),
    (cat_frais, 'yaourt-nature', 'Yaourt Nature Bio', 'Pack de 4 yaourts nature au lait entier bio.', 'A', '4x125g', 500, 3.20, 'https://images.unsplash.com/photo-1485962391045-8c707d835041?w=800', 30, false)
  ON CONFLICT (slug) DO NOTHING;

  -- ─── Store Settings ──────────────────────────────────────────────────────
  INSERT INTO store_settings (key, value) VALUES
    ('delivery_fee', '4.90'),
    ('delivery_free_threshold', '60.00'),
    ('store_name', '"Shop-ia"'),
    ('store_address', '"45 Avenue de la Fraîcheur, 75001 Paris"'),
    ('store_phone', '"01 99 88 77 66"'),
    ('store_hours', '"Lun–Sam 09h00–20h00"'),
    ('banner_text', '"🛒 Bienvenue chez Shop-ia : Votre panier intelligent livré chez vous !"'),
    ('banner_enabled', 'true')
  ON CONFLICT (key) DO NOTHING;
END $$;

-- ─── SKU exemples ──────────────────────────────────────────────────────────

UPDATE products SET sku = 'F-001' WHERE slug = 'huile-olive-bio' AND sku IS NULL;
UPDATE products SET sku = 'F-002' WHERE slug = 'chocolat-noir' AND sku IS NULL;
UPDATE products SET sku = 'F-003' WHERE slug = 'jus-pomme' AND sku IS NULL;

-- ─── Attributs produits ────────────────────────────────────────────────────

DO $$
BEGIN
  UPDATE products SET attributes = jsonb_build_object(
    'origin', 'France',
    'labels', jsonb_build_array('Bio', 'Extra Vierge')
  ) WHERE slug = 'huile-olive-bio';

  UPDATE products SET attributes = jsonb_build_object(
    'origin', 'Équateur',
    'labels', jsonb_build_array('Commerce Équitable', 'Vegan')
  ) WHERE slug = 'chocolat-noir';

  UPDATE products SET attributes = jsonb_build_object(
    'origin', 'France',
    'allergens', jsonb_build_array('Lactose')
  ) WHERE slug IN ('fromage-chevre', 'yaourt-nature');
END $$;

-- ─── Promo Codes ───────────────────────────────────────────────────────────

INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_value, max_uses, expires_at)
VALUES
  ('OUVERTURE', 'Offre de bienvenue -15%', 'percent', 15, 20, 500, now() + interval '90 days'),
  ('LIVRGRATUITE', 'Livraison offerte sur votre panier', 'fixed', 4.90, 40, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

-- ─── Bundle : Pack Petit Déjeuner ──────────────────────────────────────────

DO $$
DECLARE
  bundle_id   uuid;
  jus_id      uuid;
  yaourt_id   uuid;
BEGIN
  SELECT id INTO jus_id      FROM products WHERE slug = 'jus-pomme'  LIMIT 1;
  SELECT id INTO yaourt_id   FROM products WHERE slug = 'yaourt-nature'  LIMIT 1;

  IF jus_id IS NOT NULL AND yaourt_id IS NOT NULL THEN
    INSERT INTO products (
      category_id, slug, name, description,
      price, original_value, image_url, stock_quantity,
      is_available, is_featured, is_active, is_bundle
    )
    SELECT
      (SELECT id FROM categories WHERE slug = 'produits-frais'),
      'pack-petit-dej',
      'Pack Petit Déjeuner',
      'Le réveil parfait avec un pur jus de pomme et des yaourts bios. Économisez sur le duo.',
      7.50, 8.70,
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
      0, true, true, true, true
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'pack-petit-dej')
    RETURNING id INTO bundle_id;

    IF bundle_id IS NOT NULL THEN
      INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES
        (bundle_id, jus_id, 1),
        (bundle_id, yaourt_id, 1)
      ON CONFLICT DO NOTHING;

      PERFORM public.sync_bundle_stock(bundle_id);

      -- SKU for bundle
      UPDATE products SET sku = 'B-001' WHERE id = bundle_id AND sku IS NULL;
    END IF;
  END IF;
END $$;

-- ─── Recommandations croisées ──────────────────────────────────────────────

DO $$
DECLARE
  huile   uuid; pates uuid; jus uuid; yaourt uuid;
BEGIN
  SELECT id INTO huile  FROM products WHERE slug = 'huile-olive-bio' LIMIT 1;
  SELECT id INTO pates  FROM products WHERE slug = 'pates-artisanales' LIMIT 1;
  SELECT id INTO jus    FROM products WHERE slug = 'jus-pomme'       LIMIT 1;
  SELECT id INTO yaourt FROM products WHERE slug = 'yaourt-nature'    LIMIT 1;

  IF huile IS NOT NULL AND pates IS NOT NULL THEN
    INSERT INTO product_recommendations (product_id, recommended_id, sort_order)
    VALUES (pates, huile, 0) ON CONFLICT DO NOTHING;
  END IF;
  IF jus IS NOT NULL AND yaourt IS NOT NULL THEN
    INSERT INTO product_recommendations (product_id, recommended_id, sort_order)
    VALUES (yaourt, jus, 0) ON CONFLICT DO NOTHING;
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- FIN — Base de données initialisée avec succès
-- ═══════════════════════════════════════════════════════════════════════════
-- Fichiers d'embeddings à appliquer séparément si nécessaire :
--   supabase/apply_vectors_part1.sql
--   supabase/apply_vectors_part2.sql
--   supabase/apply_vectors_part3.sql
-- ═══════════════════════════════════════════════════════════════════════════
