import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  status: string;
  featured: boolean;
  created_at: string;
};

export type SiteSettings = {
  general: { store_name: string; tagline: string; currency: string; support_email: string };
  shipping: { free_shipping_threshold: number; standard_rate: number; express_rate: number };
};

const defaults: SiteSettings = {
  general: { store_name: "AESTHETE", tagline: "Quietly extraordinary.", currency: "USD", support_email: "" },
  shipping: { free_shipping_threshold: 500, standard_rate: 25, express_rate: 60 },
};

export function useProducts(opts?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: ["storefront-products", !!opts?.featuredOnly],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (opts?.featuredOnly) q = q.eq("featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as StoreProduct[];
    },
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["storefront-product", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as StoreProduct | null;
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["storefront-settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, any> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
      return {
        general: { ...defaults.general, ...(map.general ?? {}) },
        shipping: { ...defaults.shipping, ...(map.shipping ?? {}) },
      };
    },
    staleTime: 60_000,
  });
}
