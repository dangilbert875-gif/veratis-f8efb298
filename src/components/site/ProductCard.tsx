import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { VialImage } from "./VialImage";

// Strip dosage tokens and normalize "VIAL" → "Vial" for the card title.
// Examples:
//   "Retatrutide 30mg VIAL"          → "Retatrutide Vial"
//   "BPC/TB-500 Blend 10mg/10mg VIAL" → "BPC/TB-500 Blend Vial"
//   "HCG 10,000 IU VIAL"             → "HCG 10,000 IU Vial"
function titleFor(name: string) {
  return name
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*VIAL\s*$/i, " Vial")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Normalize the metadata line: "12 mg vial · lyophilized", "10,000 IU vial · lyophilized"
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
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: p.slug }}
      className="group block"
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

        {/* Specimen metadata strip */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[9.5px] font-mono uppercase tracking-[0.16em] text-foreground/55">
          <span>{p.purity} HPLC</span>
          <span className="tabular-nums">LOT {lot}</span>
        </div>
      </div>

      {/* Caption: fixed-height title block keeps prices + availability aligned
          across every card, regardless of name length */}
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
  );
}
