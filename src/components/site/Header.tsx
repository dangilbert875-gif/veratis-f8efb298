import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/lab-testing", label: "Lab Testing" },
  { to: "/blog", label: "Education" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="w-full bg-ink text-background text-[12px] tracking-wide">
        <div className="mx-auto max-w-7xl px-6 h-9 flex items-center justify-center gap-6">
          <span className="opacity-90">Free shipping on US orders over $150</span>
          <span className="hidden sm:inline opacity-50">·</span>
          <span className="hidden sm:inline opacity-90">Every batch third-party tested</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="inline-block w-6 h-6 rounded-full border border-primary relative">
                <span className="absolute inset-1.5 rounded-full bg-primary/80" />
              </span>
              <span className="font-display text-xl tracking-tight text-ink">
                Pure Peptide
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="text-foreground/70 hover:text-foreground transition"
                  activeProps={{ className: "text-foreground" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <button aria-label="Search" className="p-2 hover:text-foreground"><Search size={18} /></button>
            <button aria-label="Account" className="p-2 hover:text-foreground hidden sm:block"><User size={18} /></button>
            <button aria-label="Cart" className="p-2 hover:text-foreground relative">
              <ShoppingBag size={18} />
              <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </button>
            <button aria-label="Menu" className="md:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-6 py-4 flex flex-col gap-3">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="text-sm py-1.5 text-foreground/80"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}