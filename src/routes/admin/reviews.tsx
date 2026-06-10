import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Check, X, Eye, EyeOff, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

const STATUS = ["pending", "approved", "rejected", "hidden"] as const;

function ReviewsAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("pending");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews" as any)
        .select("*, products!inner(id,name,slug,image_url)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel("admin-reviews-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" },
        () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("reviews" as any).update(patch).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Updated.");
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews" as any).delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted.");
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r: any) => r.status === filter);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Moderation</p>
          <h1 className="font-serif text-3xl md:text-4xl">Reviews</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-[10px] tracking-[0.2em] uppercase px-4 h-9 border ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-hairline"}`}>{s}</button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-ink-soft text-sm">Loading…</p>
        : filtered.length === 0 ? <p className="text-ink-soft text-sm">No reviews.</p>
        : (
          <ul className="space-y-4">
            {filtered.map((r: any) => (
              <li key={r.id} className="border border-hairline p-5 bg-card">
                <div className="flex flex-wrap items-start gap-4">
                  {r.products?.image_url && <img src={r.products.image_url} alt="" className="w-16 h-16 object-cover border border-hairline" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.products?.name ?? "—"}</p>
                    <div className="flex gap-1 my-1">{[1,2,3,4,5].map((n) => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "fill-current" : "text-ink-soft"}`} />)}</div>
                    {r.title && <p className="text-sm font-medium">{r.title}</p>}
                    {r.body && <p className="text-sm text-ink-soft whitespace-pre-line mt-1">{r.body}</p>}
                    {Array.isArray(r.images) && r.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.images.map((u: string) => <img key={u} src={u} alt="" className="w-14 h-14 object-cover border border-hairline" />)}
                      </div>
                    )}
                    <p className="text-xs text-ink-soft mt-2">— {r.author_name || "Customer"}, {new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-surface-dim">{r.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <ActBtn icon={Check} label="Approve" onClick={() => update(r.id, { status: "approved" })} />
                  <ActBtn icon={X} label="Reject" onClick={() => update(r.id, { status: "rejected" })} />
                  <ActBtn icon={EyeOff} label="Hide" onClick={() => update(r.id, { status: "hidden" })} />
                  <ActBtn icon={Eye} label="Restore" onClick={() => update(r.id, { status: "approved" })} />
                  <ActBtn icon={Sparkles} label={r.featured ? "Unfeature" : "Feature"} onClick={() => update(r.id, { featured: !r.featured })} active={r.featured} />
                  <button onClick={() => remove(r.id)} className="text-[10px] tracking-[0.2em] uppercase px-3 h-8 border border-hairline text-destructive hover:bg-surface-dim inline-flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

function ActBtn({ icon: Icon, label, onClick, active }: { icon: any; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`text-[10px] tracking-[0.2em] uppercase px-3 h-8 border inline-flex items-center gap-1 ${active ? "border-primary bg-primary text-primary-foreground" : "border-hairline hover:bg-surface-dim"}`}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}
