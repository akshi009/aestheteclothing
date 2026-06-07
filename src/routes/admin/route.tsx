import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Atelier Console | AESTHETE" }, { name: "robots", content: "noindex" }] }),
  ssr: false,
  component: AdminLayout,
});

type GateState = "loading" | "unauth" | "no-admins" | "not-admin" | "ok";

function AdminLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<GateState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const check = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate({ to: "/auth", search: { mode: "signin", redirect: "/admin" }, replace: true });
      setState("unauth");
      return;
    }
    setUserId(session.user.id);

    const { data: mine } = await supabase
      .from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
    if (mine) { setState("ok"); return; }

    const { count } = await supabase
      .from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
    setState((count ?? 0) === 0 ? "no-admins" : "not-admin");
  };

  useEffect(() => { check(); }, []);

  const claimAdmin = async () => {
    if (!userId) return;
    setClaiming(true);
    const { count } = await supabase
      .from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) { toast.error("An admin already exists."); setClaiming(false); await check(); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    setClaiming(false);
    if (error) { toast.error(error.message); return; }
    toast.success("You are now an admin.");
    setState("ok");
  };

  if (state === "loading" || state === "unauth") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  if (state === "no-admins") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="eyebrow mb-3">Initial Setup</p>
          <h1 className="font-serif text-3xl mb-4">Claim the Atelier</h1>
          <p className="text-ink-soft mb-8">No admins exist yet. Claim ownership of this store to access the admin console.</p>
          <button onClick={claimAdmin} disabled={claiming} className="btn-primary justify-center">
            {claiming && <Loader2 className="w-4 h-4 animate-spin" />}
            Become Admin
          </button>
        </div>
      </div>
    );
  }

  if (state === "not-admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <ShieldOff className="w-10 h-10 mx-auto mb-4 text-ink-soft" />
          <h1 className="font-serif text-3xl mb-3">Access Restricted</h1>
          <p className="text-ink-soft mb-6">Your account does not have admin privileges.</p>
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", search: { mode: "signin", redirect: "/admin" }, replace: true }); }} className="btn-ghost">
            Sign in with another account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
