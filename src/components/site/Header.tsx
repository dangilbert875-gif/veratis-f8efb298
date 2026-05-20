import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { SearchOverlay } from "./SearchOverlay";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/coa-archive", label: "COA Archive" },
  { to: "/blog", label: "Education" },
  { to: "/about", label: "About" },
] as const;

/* ------------------------------------------------------------------ */
/* Custom icon system — hairline 1.25 stroke, optically balanced.     */
/* Kept inline so the header has no third-party icon dependency and    */
/* every glyph shares the same scientific drawing style.               */
/* ------------------------------------------------------------------ */

type IconProps = { size?: number; className?: string };
const baseSvg = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

const IconSearch = ({ size = 18, className }: IconProps) => (
  <svg {...baseSvg(size)} className={className}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m20 20-4.6-4.6" />
  </svg>
);
const IconCart = ({ size = 18, className }: IconProps) => (
  <svg {...baseSvg(size)} className={className}>
    <path d="M4 5h2.2l1.6 11.2a1.5 1.5 0 0 0 1.5 1.3h8a1.5 1.5 0 0 0 1.5-1.2L20.5 8H7" />
  </svg>
);
const IconShield = ({ size = 14, className }: IconProps) => (
  <svg {...baseSvg(size)} className={className}>
    <path d="M12 3.25 5 5.5v6c0 4 3 7.5 7 9.25 4-1.75 7-5.25 7-9.25v-6Z" />
    <path d="m9 12.25 2 2 4-4" />
  </svg>
);
const IconDot = ({ size = 10, className }: IconProps) => (
  <svg {...baseSvg(size)} className={className} strokeWidth={0} fill="currentColor">
    <circle cx="12" cy="12" r="5" />
  </svg>
);
const IconMenu = ({ size = 18, className }: IconProps) => (
  <svg {...baseSvg(size)} className={className}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
const IconClose = ({ size = 18, className }: IconProps) => (
  <svg {...baseSvg(size)} className={className}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

/* Signature detail: an "operational status" indicator — a tiny
   live dot + monospace tag. Used in the top utility bar and in the
   Verify-batch pill. Reads as "this system is currently online and
   audited" rather than as a marketing badge.                       */
function StatusDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-1.5 w-1.5 ${className}`} aria-hidden="true">
      <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, openCart, lastAddedAt } = useCart();
  const [pulse, setPulse] = useState(false);
  const initial = useRef(true);
  useEffect(() => {
    if (initial.current) { initial.current = false; return; }
    if (!lastAddedAt) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 650);
    return () => clearTimeout(t);
  }, [lastAddedAt]);
  return (
    <>
      {/* Institutional certification bar — calibration signage, not a banner */}
      <div className="w-full bg-ink text-background/90 text-[10px] leading-none tracking-[0.24em] uppercase font-medium antialiased">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-7 flex items-center justify-center gap-5 sm:gap-7">
          <span className="inline-flex items-center gap-2">
            <StatusDot />
            <span>Third-party tested</span>
          </span>
          <span aria-hidden className="hidden sm:inline-block h-2 w-px bg-background/20" />
          <span className="hidden sm:inline-flex items-center gap-2">
            <IconShield size={10} className="text-primary/70" />
            <span>Batch verified · ISO 17025</span>
          </span>
          <span aria-hidden className="hidden md:inline-block h-2 w-px bg-background/20" />
          <span className="hidden md:inline-flex items-center gap-2">
            For research use
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/88 backdrop-blur supports-[backdrop-filter]:bg-background/74">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 h-[68px] md:h-[76px] lg:h-[82px] flex items-center justify-between gap-6 lg:gap-10">
          <div className="min-w-0 flex items-center gap-8 xl:gap-12">
            <Link
              to="/"
              aria-label="VERATIS — home"
              className="shrink-0 block transition-opacity duration-200 hover:opacity-80"
            >
              <Logo className="h-auto w-[124px] sm:w-[142px] lg:w-[164px] xl:w-[176px]" />
            </Link>
            <nav className="hidden xl:flex items-center gap-7 2xl:gap-9 text-[12px] font-medium tracking-[0.04em] text-foreground/55 whitespace-nowrap">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={[
                    // Signature detail: precision underline — a 14px
                    // centered tick that expands to the full label width
                    // on hover. Reads as a calibration mark rather than
                    // a typical link underline.
                    "relative py-1 transition-colors duration-200 hover:text-ink",
                    "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1",
                    "after:h-px after:w-3.5 after:bg-ink/80",
                    "after:opacity-0 after:transition-all after:duration-300 after:ease-out",
                    "hover:after:opacity-100 hover:after:w-[calc(100%-2px)]",
                  ].join(" ")}
                  activeProps={{
                    className:
                      "text-ink after:opacity-100 after:w-[calc(100%-2px)]",
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-foreground/65">
            {/* Verify-batch — squared, tactile, with live status dot */}
            <Link
              to="/verify"
              className="hidden md:inline-flex items-center gap-2 mr-2 h-9 px-3.5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-ink bg-background border border-ink/15 rounded-[3px] shadow-[0_1px_0_rgba(15,23,42,0.04)] hover:bg-mist hover:border-ink/30 transition-colors duration-200"
            >
              <StatusDot />
              <span>Verify batch</span>
            </Link>

            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-[3px] hover:bg-mist transition-colors duration-200"
            >
              <IconSearch />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="p-2.5 rounded-[3px] hover:bg-mist active:scale-95 transition-all duration-200 relative"
            >
              <span className={pulse ? "inline-block animate-[wiggle_0.55s_ease-out]" : "inline-block"}>
                <IconCart />
              </span>
              {count > 0 && (
                <span
                  key={count}
                  className="absolute top-1 right-1 text-[9px] font-medium tabular-nums bg-ink text-background rounded-full min-w-[15px] h-[15px] px-1 inline-flex items-center justify-center animate-in zoom-in-50 fade-in duration-300"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              className="lg:hidden p-2.5 rounded-[3px] hover:bg-mist transition-colors duration-200"
              onClick={() => setOpen(!open)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-6 py-5 flex flex-col gap-1 text-[14px]">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-foreground/80 border-b border-border/60 last:border-b-0 hover:text-ink transition-colors"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="py-2.5 text-foreground/80 hover:text-ink transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/verify"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center gap-2 h-11 px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-ink border border-ink/20 rounded-[3px] hover:bg-mist transition-colors"
              >
                <StatusDot />
                Verify batch
              </Link>
            </div>
          </div>
        )}
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
