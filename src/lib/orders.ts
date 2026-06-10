import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "shipped",
  "out_for_delivery", "delivered", "cancelled", "returned",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-sky-100 text-sky-900",
  processing: "bg-blue-100 text-blue-900",
  shipped: "bg-indigo-100 text-indigo-900",
  out_for_delivery: "bg-violet-100 text-violet-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
  returned: "bg-stone-200 text-stone-900",
};

export type OrderItem = {
  id: string; order_id: string; product_id: string | null;
  name: string; price: number; quantity: number;
  image_url: string | null; product_slug: string | null;
};
export type Order = {
  id: string; status: string; total: number; created_at: string;
  customer_name: string | null; customer_email: string | null;
  shipping_address: any; user_id: string | null;
  order_items: OrderItem[];
};
export type OrderEvent = { id: string; order_id: string; status: string | null; note: string | null; actor_role: string; created_at: string };

export function useMyOrders() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,user_id,status,total,created_at,customer_name,customer_email,shipping_address,order_items(id,order_id,product_id,name,price,quantity,image_url,product_slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });
  useEffect(() => {
    const ch = supabase.channel("my-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => qc.invalidateQueries({ queryKey: ["my-orders"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "order_events" }, () => qc.invalidateQueries({ queryKey: /^order-events|my-orders/ as any }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  return q;
}

export function useOrderEvents(orderId: string | null) {
  return useQuery({
    queryKey: ["order-events", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_events" as any).select("*").eq("order_id", orderId!).order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as OrderEvent[];
    },
  });
}

export function useProductReviews(productId: string | null) {
  return useQuery({
    queryKey: ["product-reviews", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews" as any)
        .select("id,rating,title,body,images,author_name,created_at")
        .eq("product_id", productId!)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useFeaturedReviews() {
  return useQuery({
    queryKey: ["featured-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews" as any)
        .select("id,rating,title,body,author_name,images,created_at")
        .eq("status", "approved").eq("featured", true)
        .order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 60_000,
  });
}

export function useMyReturns() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["my-returns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("return_requests" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
  useEffect(() => {
    const ch = supabase.channel("my-returns-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "return_requests" }, () => qc.invalidateQueries({ queryKey: ["my-returns"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  return q;
}

export const RETURN_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  scheduled: "Return Scheduled",
  completed: "Completed",
};
