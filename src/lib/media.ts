import { supabase } from "@/integrations/supabase/client";

// Bucket is private (workspace policy blocks public buckets) — generate
// long-lived signed URLs so storefront visitors can render uploads.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadMedia(file: File): Promise<{ url: string; path: string }> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw error;
  return { url: await signedUrl(path), path };
}

export async function signedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (error || !data?.signedUrl) throw error ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase().split("?")[0];
  return /\.(mp4|webm|mov|m4v|ogg)$/.test(u);
}
