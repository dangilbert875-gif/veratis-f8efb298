import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { VialImage } from "./VialImage";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { Minus, Plus, FileText } from "lucide-react";
import { downloadCoa } from "@/lib/coa";

function titleFor(name: string) {
  return name
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*VIAL\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sizeFor(size: string) {
  return size
    .replace(/\bMG\b/g, "mg")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

type Badge = { label: string; tone?: "amber" | "gray" | "green" };
type StockState = "in_stock" | "low" | "last3";

export function ProductCard({
  p,
  badge,
  stockText,
  stockTone,
  tagline,
  accentClass,
  stockState,
  lowStockCount,
  showPricePerMg,
  bestValuePerMg,
  showQuantity,
  showViewCoa,
  compactImage,
}: {
  p: Product;
  badge?: Badge;
  stockText?: string;
  stockTone?: "default" | "amber";
  tagline?: string;
  /** 6px corner accent bar color (Tailwind bg-* class). */
  accentClass?: string;
  /** Stock state for catalog cards. Overrides stockText. */
  stockState?: StockState;
  /** Used when stockState === "low" to render "Low stock · N left". */
  lowStockCount?: number;
  /** Show $X/mg under the price. */
  showPricePerMg?: boolean;
  /** Show small "Best value" badge next to $/mg. */
  bestValuePerMg?: boolean;
  /** Render qty stepper above Add to Cart. */
  showQuantity?: boolean;
  /** Render secondary "View COA →" button next to Add to Cart. */
  showViewCoa?: boolean;
  /** Slightly reduce the framed image on dense catalog mobile layouts. */
  compactImage?: boolean;
}) {
  const lot = p.lot;
  const available = p.inStock !== false;
  const title = titleFor(p.name);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const badgeToneClass =
    badge?.tone === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : badge?.tone === "green"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-mist text-foreground/70 border-border";

  // Resolve stock display
  let resolvedStockText = stockText;
  let resolvedStockColor =
    stockTone === "amber" ? "text-amber-700" : "text-foreground/55";
  if (stockState) {
    if (stockState === "in_stock") {
      resolvedStockText = "In stock";
      resolvedStockColor = "text-foreground/55";
    } else if (stockState === "low") {
      resolvedStockText = `Low stock · ${lowStockCount ?? 6} left`;
      resolvedStockColor = "text-amber-700";
    } else if (stockState === "last3") {
      resolvedStockText = "Last 3 vials";
      resolvedStockColor = "text-red-700";
    }
  }

  // Compute total mg for price-per-mg
  function parseTotalMg(d: string): number {
    const tokens = d.match(/(\d[\d,.]*)\s*MG/gi);
    if (!tokens) return 0;
    return tokens.reduce((sum, t) => {
      const n = parseFloat(t.replace(/MG/gi, "").replace(/,/g, "").trim());
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }
  const totalMg = parseTotalMg(p.dosage);
  const pricePerMg = totalMg > 0 ? p.price / totalMg : null;

  return (
    <article className={`group w-full max-w-full min-w-0 mx-auto flex flex-col h-full ${compactImage ? "max-[639px]:max-w-[340px]" : ""}`}>
      <Link
        to="/shop/$slug"
        params={{ slug: p.slug }}
        className="flex flex-col flex-1"
        aria-label={`${title} — view details`}
      >
        <div className={`relative aspect-square bg-mist rounded-[3px] overflow-hidden border border-border/70 w-full mx-auto ${compactImage ? "max-w-[320px] sm:max-w-none" : ""}`}>
          {accentClass ? (
            <span
              aria-hidden
              className={`absolute top-0 left-0 h-[6px] w-14 z-10 ${accentClass}`}
            />
          ) : null}

          {/* hairline registration ticks on the four corners */}
          <span aria-hidden className="absolute top-0 left-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute top-0 left-0 w-px h-3 bg-ink/25" />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute top-0 right-0 w-px h-3 bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 left-0 w-px h-3 bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 right-0 w-px h-3 bg-ink/25" />

          {badge ? (
            <span
              className={`absolute ${accentClass ? "top-4" : "top-2.5"} left-2.5 z-10 inline-flex items-center px-2 py-[3px] rounded-[2px] border text-[9px] font-mono uppercase tracking-[0.16em] ${badgeToneClass}`}
            >
              {badge.label}
            </span>
          ) : null}

          <div className={`absolute inset-0 flex items-center justify-center transition duration-[900ms] ease-out group-hover:scale-[1.02] ${compactImage ? "p-5 sm:p-3" : "p-3 sm:p-3"}`}>
            <VialImage
              name={p.name}
              dosage={p.dosage}
              lot={lot}
              purity={p.purity}
              size="card"
              alt={`${title} — ${sizeFor(p.size)} lyophilized research vial`}
              imageUrl={p.image}
            />
          </div>

        </div>

        {/* Title block — fixed-height, balanced wrap */}
        <div className="mt-3 sm:mt-5 text-center sm:text-left">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">
            {p.category}
          </p>
          <h3
            className="mt-2 sm:mt-2.5 text-[16px] sm:text-[15px] text-ink font-display tracking-tight leading-[1.25] min-h-[2.5em] line-clamp-2 [text-wrap:balance]"
          >
            {title}
          </h3>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground leading-snug line-clamp-2 min-h-[2.6em]">
            {tagline ?? ""}
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground font-mono tabular-nums truncate">
            {sizeFor(p.size)} · lyophilized
          </p>
        </div>

        {/* Price + availability row — clean horizontal rhythm */}
        <div className="mt-auto pt-3 border-t border-border/70 flex items-baseline justify-center sm:justify-between gap-6 sm:gap-3">
          <div className="flex flex-col gap-1 items-center sm:items-start">
            <p className={`text-[10px] font-mono uppercase tracking-[0.2em] ${available ? "text-foreground/65" : "text-foreground/55"}`}>
              {available ? "Available" : "Reserved"}
            </p>
            {resolvedStockText ? (
              <p className={`text-[10px] font-mono tracking-[0.1em] ${resolvedStockColor}`}>
                {resolvedStockText}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p className="text-[16px] sm:text-[15px] text-ink font-medium tabular-nums leading-none">
              ${p.price}
            </p>
            {showPricePerMg && pricePerMg ? (
              <div className="flex items-center gap-1.5">
                {bestValuePerMg ? (
                  <span className="inline-flex items-center px-1.5 py-[1px] rounded-[2px] border border-emerald-200 bg-emerald-50 text-emerald-800 text-[8.5px] font-mono uppercase tracking-[0.14em]">
                    Best value
                  </span>
                ) : null}
                <p className="text-[10.5px] font-mono tabular-nums text-foreground/55">
                  ${pricePerMg.toFixed(2)}/mg
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      {showQuantity ? (
        <div className="mt-4 flex items-center justify-center gap-3 h-11 border border-border/70 rounded-[3px] bg-background">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="inline-flex items-center justify-center w-11 h-11 text-ink/70 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Minus size={14} />
          </button>
          <span className="text-[13px] font-mono tabular-nums text-ink min-w-[2ch] text-center">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            disabled={qty >= 10}
            aria-label="Increase quantity"
            className="inline-flex items-center justify-center w-11 h-11 text-ink/70 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Plus size={14} />
          </button>
        </div>
      ) : null}

      <div className={`${showQuantity ? "mt-2" : "mt-4"} flex gap-2`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (available) addItem(p, qty);
          }}
          disabled={!available}
          className="flex-1 inline-flex items-center justify-center h-12 sm:h-11 border border-ink/20 rounded-[3px] text-[11px] sm:text-[10.5px] font-medium uppercase tracking-[0.22em] text-ink bg-background transition-all duration-200 hover:bg-ink hover:text-background hover:border-ink hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_20px_-10px_rgba(15,23,42,0.25)] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-ink disabled:hover:shadow-none touch-manipulation"
        >
          {available ? "Add to Cart" : "Reserved"}
        </button>
        {showViewCoa ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void downloadCoa({
                lot,
                product: title,
                size: sizeFor(p.size),
                purity: p.purity,
              });
            }}
            aria-label={`View COA for lot ${lot}`}
            className="inline-flex items-center justify-center gap-1.5 h-12 sm:h-11 px-3 border border-border rounded-[3px] text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/70 bg-background hover:text-ink hover:border-ink/40 transition touch-manipulation"
          >
            <FileText size={12} strokeWidth={1.5} />
            <span className="hidden sm:inline">COA</span>
          </button>
        ) : null}
      </div>
    </article>
  );
}
