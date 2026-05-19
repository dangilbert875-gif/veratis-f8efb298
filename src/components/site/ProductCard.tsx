import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      to="/shop/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="aspect-square bg-mist rounded-lg overflow-hidden border border-border/60 relative">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700"
        />
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] bg-background/90 backdrop-blur px-2 py-1 rounded text-ink/80 border border-border">
          {p.purity} pure
        </span>
      </div>
      <div className="pt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.category}</p>
          <h3 className="mt-1 text-base text-ink font-display tracking-tight">
            {p.name} <span className="text-muted-foreground font-sans text-sm">· {p.size}</span>
          </h3>
        </div>
        <p className="text-base text-ink font-medium tabular-nums">${p.price}</p>
      </div>
    </Link>
  );
}