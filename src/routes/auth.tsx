import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const search = z.object({
  mode: fallback(z.enum(["signin", "signup"]), "signin").default("signin"),
  redirect: fallback(z.string(), "/").default("/"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(search),
  head: () => ({ meta: [{ title: "Sign In | AESTHETE" }, { name: "description", content: "Access your AESTHETE account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect as any, replace: true });
    });
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: redirect as any, replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: redirect as any, replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-28 md:pt-32 pb-20 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Members</p>
            <h1 className="font-serif text-3xl md:text-4xl">{mode === "signup" ? "Join AESTHETE" : "Welcome Back"}</h1>
            <p className="text-sm text-ink-soft mt-3">
              {mode === "signup" ? "Create an account to track orders and save favorites." : "Sign in to continue."}
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="btn-ghost w-full justify-center mb-5"
            type="button"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-hairline" />
            <span className="eyebrow">or</span>
            <span className="flex-1 h-px bg-hairline" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="eyebrow block mb-2">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full h-12 border border-hairline bg-transparent px-4 text-sm focus:border-primary outline-none" />
              </div>
            )}
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-12 border border-hairline bg-transparent px-4 text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full h-12 border border-hairline bg-transparent px-4 text-sm focus:border-primary outline-none" />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-ink-soft">
            {mode === "signup" ? "Already a member?" : "New to AESTHETE?"}{" "}
            <Link to="/auth" search={{ mode: mode === "signup" ? "signin" : "signup", redirect }} className="underline text-ink">
              {mode === "signup" ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
