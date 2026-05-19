import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingBag, Menu, X, ShieldCheck, FlaskConical, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/verify", label: "Verify Batch" },
  { to: "/coa-archive", label: "COA Archive" },
  { to: "/standards", label: "Standards" },
  { to: "/how-to-pay", label: "How To Pay" },
  { to: "/blog", label: "Education" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="w-full bg-ink text-background text-[11px] tracking-[0.14em] uppercase">
        <div className="mx-auto max-w-7xl px-6 h-9 flex items-center justify-center gap-6 text-background/80">
          <span className="inline-flex items-center gap-1.5"><BadgeCheck size={12} className="text-primary" strokeWidth={2} /> Third-party tested</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-90"><FlaskConical size={12} className="text-primary" strokeWidth={2} /> Batch verified</span>
          <span className="hidden md:inline-flex items-center gap-1.5 opacity-90"><ShieldCheck size={12} className="text-primary" strokeWidth={2} /> Research use only</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-6 h-[72px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Link to="/" aria-label="VERATIS — home" className="shrink-0 group block">
              <Logo height={22} className="md:h-[26px]" />
            </Link>
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="relative text-foreground/60 hover:text-ink transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100"
                  activeProps={{ className: "text-ink after:scale-x-100" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Link
              to="/verify"
              className="hidden md:inline-flex items-center gap-1.5 mr-1 text-[12px] font-medium text-ink border border-border rounded-full pl-3 pr-3.5 py-1.5 hover:border-ink/40 hover:bg-mist transition"
            >
              <ShieldCheck size={13} className="text-primary" strokeWidth={2} />
              Verify batch
            </Link>
            <button aria-label="Search" className="p-2 hover:text-foreground"><Search size={18} /></button>
            <button aria-label="Account" className="p-2 hover:text-foreground hidden sm:block"><User size={18} /></button>
            <button aria-label="Cart" className="p-2 hover:text-foreground relative">
              <ShoppingBag size={18} />
              <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </button>
            <button aria-label="Menu" className="lg:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border bg-background">
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
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="text-sm py-1.5 text-foreground/80"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
