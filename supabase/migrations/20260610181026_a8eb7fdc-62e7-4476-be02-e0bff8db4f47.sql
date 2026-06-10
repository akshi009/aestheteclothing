
-- Allow multiple blocks per type; add type column
ALTER TABLE public.homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_key_key;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'custom';
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS video_url text;

-- Backfill type from key for existing rows
UPDATE public.homepage_sections SET type = 'hero' WHERE key = 'hero' AND type = 'custom';
UPDATE public.homepage_sections SET type = 'heritage' WHERE key = 'heritage' AND type = 'custom';
UPDATE public.homepage_sections SET type = 'featured_products' WHERE key = 'featured_intro' AND type = 'custom';
UPDATE public.homepage_sections SET type = 'newsletter' WHERE key = 'newsletter' AND type = 'custom';

-- Allow anyone (anon + authenticated) to read media objects so storefront can display uploads
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
CREATE POLICY "Authenticated upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated update media" ON storage.objects;
CREATE POLICY "Authenticated update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;
CREATE POLICY "Authenticated delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
