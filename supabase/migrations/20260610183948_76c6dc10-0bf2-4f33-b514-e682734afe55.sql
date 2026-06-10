
-- 1) Extend order_items with image + slug for nicer order history
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS product_slug text;

-- 2) Order timeline events
CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text,
  note text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON public.order_events(order_id, created_at DESC);
GRANT SELECT, INSERT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View events for own order" ON public.order_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_events.order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Customer can log own order events" ON public.order_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_events.order_id AND o.user_id = auth.uid()));
CREATE POLICY "Admins manage events" ON public.order_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 3) Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending', -- pending|approved|rejected|hidden
  featured boolean NOT NULL DEFAULT false,
  author_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS reviews_featured_idx ON public.reviews(featured) WHERE featured;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews public" ON public.reviews FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own review for delivered order" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.id = reviews.order_id
        AND o.user_id = auth.uid()
        AND o.status = 'delivered'
        AND oi.product_id = reviews.product_id
    )
  );
CREATE POLICY "Users update own pending review" ON public.reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending') WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own pending review" ON public.reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Return requests
CREATE TABLE IF NOT EXISTS public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted', -- submitted|under_review|approved|rejected|scheduled|completed
  reason text NOT NULL,
  comments text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{order_item_id, name, quantity}]
  images text[] NOT NULL DEFAULT '{}',
  admin_notes text,
  pickup_scheduled_at timestamptz,
  refund_status text, -- pending|processed|na
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS return_requests_order_idx ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS return_requests_user_idx ON public.return_requests(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own returns" ON public.return_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create returns for own delivered orders" ON public.return_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = return_requests.order_id AND o.user_id = auth.uid() AND o.status = 'delivered')
  );
CREATE POLICY "Admins manage returns" ON public.return_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_return_requests_updated BEFORE UPDATE ON public.return_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Auto-log order status change events
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_events(order_id, status, note, actor_id, actor_role)
    VALUES (NEW.id, NEW.status, 'Order placed', NEW.user_id, 'customer');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_events(order_id, status, note, actor_id, actor_role)
    VALUES (NEW.id, NEW.status, NULL, auth.uid(),
      CASE WHEN public.has_role(auth.uid(),'admin') THEN 'admin'
           WHEN auth.uid() = NEW.user_id THEN 'customer'
           ELSE 'system' END);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_log_order_status ON public.orders;
CREATE TRIGGER trg_log_order_status AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- 6) Allow customer to cancel own pending order (RLS policy update)
DROP POLICY IF EXISTS "Users cancel own pending order" ON public.orders;
CREATE POLICY "Users cancel own pending order" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status IN ('pending','cancelled'));

-- 7) Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_events REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.return_requests REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.order_events; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.return_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
