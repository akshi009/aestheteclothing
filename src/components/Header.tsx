import { Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-hairline">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl md:text-3xl tracking-[0.18em] font-bold">
          AESTHETE
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/collections" className="nav-link">Collections</Link>
          <Link to="/collections" search={{ filter: "new" } as never} className="nav-link">New Arrivals</Link>
          <Link to="/collections" search={{ filter: "runway" } as never} className="nav-link">Runway</Link>
          <Link to="/admin" className="nav-link">Atelier</Link>
        </nav>
        <div className="flex items-center gap-5 text-ink">
          <button aria-label="Search" className="hover:opacity-60 transition"><Search className="w-[18px] h-[18px] stroke-[1.5]" /></button>
          <button aria-label="Wishlist" className="hover:opacity-60 transition"><Heart className="w-[18px] h-[18px] stroke-[1.5]" /></button>
          <button aria-label="Bag" className="relative hover:opacity-60 transition">
            <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
            <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">2</span>
          </button>
          <Link to="/admin" aria-label="Account" className="hover:opacity-60 transition"><User className="w-[18px] h-[18px] stroke-[1.5]" /></Link>
        </div>
      </div>
    </header>
  );
}
