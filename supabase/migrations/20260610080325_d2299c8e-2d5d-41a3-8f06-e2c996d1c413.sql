CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
GRANT SELECT ON public.site_settings TO anon;