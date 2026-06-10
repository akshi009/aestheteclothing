import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setCurrencyFormat } from "@/lib/format";

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
  general: { store_name: string; tagline: string; currency: string; locale?: string; support_email: string };
  shipping: { free_shipping_threshold: number; standard_rate: number; express_rate: number };
};

export type HomepageSection = {
  id: string; key: string; title: string | null; subtitle: string | null;
  body: string | null; image_url: string | null; cta_label: string | null;
  cta_url: string | null; position: number; visible: boolean; extra: Record<string, any>;
};

export type NavItem = {
  id: string; location: "header" | "footer"; label: string; url: string;
  parent_id: string | null; position: number; visible: boolean; open_new_tab: boolean;
};

export type CmsPage = {
  id: string; slug: string; title: string; content: string;
  meta_title: string | null; meta_description: string | null; status: "draft" | "published";
};

const defaults: SiteSettings = {
  general: { store_name: "AESTHETE", tagline: "Quietly extraordinary.", currency: "INR", locale: "en-IN", support_email: "" },
  shipping: { free_shipping_threshold: 5000, standard_rate: 250, express_rate: 600 },
};

export function useProducts(opts?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: ["storefront-products", !!opts?.featuredOnly],
    queryFn: async () => {
      let q = supabase.from("products").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (opts?.featuredOnly) q = q.eq("featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as StoreProduct[];
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
  const q = useQuery({
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
  // sync currency formatter to settings
  useEffect(() => {
    if (q.data?.general?.currency) setCurrencyFormat(q.data.general.currency, q.data.general.locale);
  }, [q.data?.general?.currency, q.data?.general?.locale]);
  return q;
}

export function useHomepageSections() {
  return useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections" as any).select("*").order("position");
      if (error) throw error;
      return (data ?? []) as unknown as HomepageSection[];
    },
    staleTime: 30_000,
  });
}

export function useSectionMap() {
  const q = useHomepageSections();
  const map: Record<string, HomepageSection | undefined> = {};
  (q.data ?? []).forEach((s) => { map[s.key] = s; });
  return { ...q, map };
}

export function useNavItems(location: "header" | "footer") {
  return useQuery({
    queryKey: ["nav-items", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_items" as any)
        .select("*")
        .eq("location", location)
        .eq("visible", true)
        .order("position");
      if (error) throw error;
      return (data ?? []) as unknown as NavItem[];
    },
    staleTime: 60_000,
  });
}

export function useCmsPage(slug: string | undefined) {
  return useQuery({
    queryKey: ["cms-page", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("pages" as any).select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as CmsPage | null;
    },
  });
}
