import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/navigation")({ component: NavAdmin });

type NavItem = { id: string; location: "header" | "footer"; label: string; url: string; position: number; visible: boolean; open_new_tab: boolean };

function NavAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-nav"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_items" as any).select("*").order("location").order("position");
      if (error) throw error;
      return (data ?? []) as unknown as NavItem[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-nav"] });

  const add = async (location: "header" | "footer") => {
    const max = data.filter((i) => i.location === location).reduce((m, i) => Math.max(m, i.position), 0);
    const { error } = await supabase.from("nav_items" as any).insert({ location, label: "New Link", url: "/", position: max + 1 });
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-10">
        <p className="eyebrow mb-2">Navigation</p>
        <h1 className="font-serif text-3xl md:text-4xl">Menus</h1>
        <p className="text-sm text-ink-soft mt-2">Manage your header and footer menu items.</p>
      </div>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
        <div className="space-y-10">
          {(["header", "footer"] as const).map((loc) => (
            <section key={loc}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl capitalize">{loc} Menu</h2>
                <button onClick={() => add(loc)} className="btn-primary"><Plus className="w-4 h-4" /> Add Link</button>
              </div>
              <div className="border border-hairline bg-card divide-y divide-hairline">
                {data.filter((i) => i.location === loc).length === 0 ? (
                  <p className="p-6 text-sm text-ink-soft">No items.</p>
                ) : data.filter((i) => i.location === loc).map((item, idx, arr) => (
                  <NavRow key={item.id} item={item} onRefresh={refresh} canUp={idx > 0} canDown={idx < arr.length - 1} prev={arr[idx - 1]} next={arr[idx + 1]} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function NavRow({ item, onRefresh, canUp, canDown, prev, next }: any) {
  const [v, setV] = useState(item);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("nav_items" as any).update({ label: v.label, url: v.url, visible: v.visible, open_new_tab: v.open_new_tab, position: v.position }).eq("id", v.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    onRefresh();
  };
  const remove = async () => {
    if (!confirm("Remove this link?")) return;
    const { error } = await supabase.from("nav_items" as any).delete().eq("id", v.id);
    if (error) toast.error(error.message); else onRefresh();
  };
  const swap = async (other: any) => {
    if (!other) return;
    const a = supabase.from("nav_items" as any).update({ position: other.position }).eq("id", v.id);
    const b = supabase.from("nav_items" as any).update({ position: v.position }).eq("id", other.id);
    await Promise.all([a, b]);
    onRefresh();
  };

  return (
    <div className="p-4 flex flex-wrap items-center gap-3">
      <div className="flex flex-col">
        <button disabled={!canUp} onClick={() => swap(prev)} className="disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
        <button disabled={!canDown} onClick={() => swap(next)} className="disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
      </div>
      <input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} placeholder="Label" className="h-10 px-3 border border-hairline bg-transparent text-sm flex-1 min-w-[140px] focus:border-primary outline-none" />
      <input value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} placeholder="/url or https://..." className="h-10 px-3 border border-hairline bg-transparent text-sm flex-1 min-w-[180px] focus:border-primary outline-none" />
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={v.open_new_tab} onChange={(e) => setV({ ...v, open_new_tab: e.target.checked })} /> New tab</label>
      <button onClick={() => setV({ ...v, visible: !v.visible })} className="h-10 px-3 border border-hairline text-xs flex items-center gap-1">{v.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
      <button onClick={save} disabled={busy} className="h-10 px-3 bg-primary text-primary-foreground text-xs flex items-center gap-1">{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save</button>
      <button onClick={remove} className="h-10 px-3 border border-hairline text-xs text-destructive flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );
}
