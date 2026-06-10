
-- Storage policies for media bucket
CREATE POLICY "Public read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
CREATE POLICY "Admins upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Homepage Sections (CMS-managed blocks rendered on the storefront homepage)
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  body text,
  image_url text,
  cta_label text,
  cta_url text,
  position int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_sections TO anon, authenticated;
GRANT ALL ON public.homepage_sections TO service_role, authenticated;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sections public read" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Admins manage sections" ON public.homepage_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Navigation items (header/footer menus)
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL CHECK (location IN ('header','footer')),
  label text NOT NULL,
  url text NOT NULL,
  parent_id uuid REFERENCES public.nav_items(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  open_new_tab boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon, authenticated;
GRANT ALL ON public.nav_items TO service_role, authenticated;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nav public read" ON public.nav_items FOR SELECT USING (true);
CREATE POLICY "Admins manage nav" ON public.nav_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CMS Pages (about / contact / faq / policy / custom)
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  position int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon, authenticated;
GRANT ALL ON public.pages TO service_role, authenticated;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pages public read published" ON public.pages FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage pages" ON public.pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER trg_homepage_sections_updated BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default homepage sections
INSERT INTO public.homepage_sections (key, title, subtitle, body, cta_label, cta_url, position) VALUES
  ('hero', 'The Architectural Silhouette', 'L''Atelier Series 01', 'Exploring the intersection of structural engineering and high-performance tailoring. A jacket designed for the modern visionary.', 'Explore Collection', '/collections', 1),
  ('heritage', 'Crafted for Eternity', 'The Heritage', 'At our atelier, luxury isn''t a price point, it''s a philosophy. Every garment is born in our Milanese atelier, where traditional hand-stitching meets advanced structural modeling.', NULL, NULL, 2),
  ('featured_intro', 'Featured Pieces', 'The Selection', NULL, NULL, NULL, 3),
  ('newsletter', 'Join the Atelier', 'Inner Circle', 'Be the first to experience new collections and exclusive artisan collaborations.', 'Subscribe', NULL, 4)
ON CONFLICT (key) DO NOTHING;

-- Seed default nav items
INSERT INTO public.nav_items (location, label, url, position) VALUES
  ('header', 'Collections', '/collections', 1),
  ('header', 'New Arrivals', '/collections?filter=new', 2),
  ('header', 'Runway', '/collections?filter=runway', 3),
  ('footer', 'About', '/p/about', 1),
  ('footer', 'Contact', '/p/contact', 2),
  ('footer', 'Shipping & Returns', '/p/shipping', 3),
  ('footer', 'Privacy Policy', '/p/privacy', 4);

-- Seed default pages
INSERT INTO public.pages (slug, title, content, meta_title, meta_description) VALUES
  ('about', 'About Us', '<h2>Our Story</h2><p>Welcome to our atelier. Edit this page from the admin console.</p>', 'About Us', 'Learn about our atelier and craft.'),
  ('contact', 'Contact', '<p>Get in touch with our concierge team.</p>', 'Contact', 'Contact our concierge team.'),
  ('shipping', 'Shipping & Returns', '<p>Edit shipping policy from the admin console.</p>', 'Shipping & Returns', 'Our shipping and returns policy.'),
  ('privacy', 'Privacy Policy', '<p>Edit privacy policy from the admin console.</p>', 'Privacy Policy', 'Our privacy policy.'),
  ('faq', 'FAQ', '<h3>Common questions</h3><p>Edit FAQ from the admin console.</p>', 'FAQ', 'Frequently asked questions.')
ON CONFLICT (slug) DO NOTHING;

-- Default currency to INR
UPDATE public.site_settings
  SET value = jsonb_set(jsonb_set(value, '{currency}', '"INR"'), '{locale}', '"en-IN"')
  WHERE key = 'general';
