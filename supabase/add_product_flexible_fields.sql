-- Add flexible fields to products for multi-type catalog support
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS unit_label text NOT NULL DEFAULT 'unit',
  ADD COLUMN IF NOT EXISTS min_order_quantity int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_order_quantity int;

ALTER TABLE IF EXISTS public.products
  DROP CONSTRAINT IF EXISTS products_min_order_quantity_check,
  DROP CONSTRAINT IF EXISTS products_max_order_quantity_check;

ALTER TABLE IF EXISTS public.products
  ADD CONSTRAINT products_min_order_quantity_check CHECK (min_order_quantity >= 1),
  ADD CONSTRAINT products_max_order_quantity_check CHECK (max_order_quantity IS NULL OR max_order_quantity >= min_order_quantity);
