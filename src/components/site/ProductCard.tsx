import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { batches } from "@/data/batches";

function lotFor(slug: string) {
  return batches.find((b) => b.slug === slug)?.lot ?? "PP-XXXX";
}

export function ProductCard({ p }: { p: Product }) {
  const lot = lotFor(p.slug);
  const available = p.inStock !== false;
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      {/* Specimen frame — every product photographed in the same environment */}
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

        <img
          src={p.image}
          alt={`${p.name} — ${p.size} lyophilized vial`}
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full h-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.02]"
        />

        {/* Specimen metadata strip — appears like a microscope slide caption */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[9.5px] font-mono uppercase tracking-[0.16em] text-foreground/55">
          <span>{p.purity} HPLC</span>
          <span className="tabular-nums">LOT {lot}</span>
        </div>
      </div>

      <div className="pt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/50">{p.category}</p>
          <h3 className="mt-2 text-[15px] text-ink font-display tracking-tight leading-tight">
            {p.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground font-mono tabular-nums">
            {p.size} · lyophilized
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] text-ink font-medium tabular-nums">${p.price}</p>
          <p className={`mt-0.5 text-[10px] font-mono uppercase tracking-[0.16em] ${available ? "text-foreground/65" : "text-foreground/60"}`}>
            {available ? "Available" : "Reserved"}
          </p>
        </div>
      </div>
    </Link>
  );
}