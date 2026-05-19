import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { VialImage } from "./VialImage";
import { useCart } from "@/lib/cart";

function titleFor(name: string) {
  return name
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*VIAL\s*$/i, " Vial")
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

export function ProductCard({ p }: { p: Product }) {
  const lot = p.lot;
  const available = p.inStock !== false;
  const title = titleFor(p.name);
  const { addItem } = useCart();

  return (
    <article className="group">
      <Link
        to="/shop/$slug"
        params={{ slug: p.slug }}
        className="block"
        aria-label={`${title} — view details`}
      >
        <div className="relative aspect-square bg-mist rounded-[3px] overflow-hidden border border-border/70">
          {/* hairline registration ticks on the four corners */}
          <span aria-hidden className="absolute top-0 left-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute top-0 left-0 w-px h-3 bg-ink/25" />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute top-0 right-0 w-px h-3 bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 left-0 w-px h-3 bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-px bg-ink/25" />
          <span aria-hidden className="absolute bottom-0 right-0 w-px h-3 bg-ink/25" />

          <div className="absolute inset-0 transition duration-[900ms] ease-out group-hover:scale-[1.02]">
            <VialImage
              name={p.name}
              dosage={p.dosage}
              lot={lot}
              purity={p.purity}
              size="card"
              alt={`${title} — ${sizeFor(p.size)} lyophilized research vial`}
            />
          </div>

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[9.5px] font-mono uppercase tracking-[0.16em] text-foreground/55">
            <span>{p.purity} HPLC</span>
            <span className="tabular-nums">LOT {lot}</span>
          </div>
        </div>

        <div className="pt-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/55">
              {p.category}
            </p>
            <h3 className="mt-2.5 text-[15px] text-ink font-display tracking-tight leading-[1.25] min-h-[2.5em] line-clamp-2">
              {title}
            </h3>
            <p className="mt-1 text-[11.5px] text-muted-foreground font-mono tabular-nums">
              {sizeFor(p.size)} · lyophilized
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[15px] text-ink font-medium tabular-nums leading-none mt-[1.45rem]">
              ${p.price}
            </p>
            <p className={`mt-2 text-[10px] font-mono uppercase tracking-[0.18em] ${available ? "text-foreground/65" : "text-foreground/60"}`}>
              {available ? "Available" : "Reserved"}
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (available) addItem(p, 1);
        }}
        disabled={!available}
        className="mt-4 w-full inline-flex items-center justify-center h-10 border border-ink/20 rounded-[3px] text-[10.5px] font-medium uppercase tracking-[0.22em] text-ink bg-background transition-all duration-200 hover:bg-ink hover:text-background hover:border-ink hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_20px_-10px_rgba(15,23,42,0.25)] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-ink disabled:hover:shadow-none"
      >
        {available ? "Add to Cart" : "Reserved"}
      </button>
    </article>
  );
}
