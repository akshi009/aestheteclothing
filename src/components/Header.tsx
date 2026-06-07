import { Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-hairline">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl md:text-3xl tracking-[0.18em] font-bold">AESTHETE</Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/collections" className="nav-link">Collections</Link>
          <Link to="/collections" search={{ filter: "new" } as never} className="nav-link">New Arrivals</Link>
          <Link to="/collections" search={{ filter: "runway" } as never} className="nav-link">Runway</Link>
          {isAdmin && <Link to="/admin" className="nav-link">Atelier</Link>}
        </nav>
        <div className="flex items-center gap-5 text-ink">
          <button aria-label="Search" className="hover:opacity-60 transition"><Search className="w-[18px] h-[18px] stroke-[1.5]" /></button>
          <button aria-label="Wishlist" className="hover:opacity-60 transition"><Heart className="w-[18px] h-[18px] stroke-[1.5]" /></button>
          <button aria-label="Bag" className="relative hover:opacity-60 transition">
            <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
            <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
          <div className="relative" ref={ref}>
            {user ? (
              <>
                <button onClick={() => setOpen((o) => !o)} aria-label="Account" className="hover:opacity-60 transition">
                  <User className="w-[18px] h-[18px] stroke-[1.5]" />
                </button>
                {open && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-background border border-hairline shadow-lg py-2 text-sm">
                    <p className="px-4 py-2 text-xs text-ink-soft truncate border-b border-hairline">{user.email}</p>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-dim">
                        <LayoutDashboard className="w-4 h-4" /> Atelier Console
                      </Link>
                    )}
                    <button onClick={() => signOut()} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-surface-dim">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/auth" search={{ mode: "signin", redirect: "/" }} aria-label="Sign in" className="hover:opacity-60 transition">
                <User className="w-[18px] h-[18px] stroke-[1.5]" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
