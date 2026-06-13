ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS composition_care text,
  ADD COLUMN IF NOT EXISTS shipping_returns text;