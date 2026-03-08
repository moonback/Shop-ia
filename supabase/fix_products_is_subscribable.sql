-- Ensure subscription flag exists on existing databases
ALTER TABLE IF EXISTS public.products
ADD COLUMN IF NOT EXISTS is_subscribable boolean NOT NULL DEFAULT false;

-- Optional safety: keep null-free values if legacy rows existed before NOT NULL enforcement
UPDATE public.products
SET is_subscribable = false
WHERE is_subscribable IS NULL;
