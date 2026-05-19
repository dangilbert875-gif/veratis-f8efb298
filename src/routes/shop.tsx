import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/data/products";
import { batches, labPartner } from "@/data/batches";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Peptides — VERATIS" },
      { name: "description", content: "Browse research-grade peptides. Every batch HPLC and mass-spec verified." },
      { property: "og:title", content: "Catalog of research-grade peptides — VERATIS" },
      { property: "og:description", content: "Browse the VERATIS catalog. Every vial is lot-traceable to an independent certificate of analysis." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/shop" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [filter, setFilter] = useState<string>("All");
  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);
  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);

  return (
    <Layout>
      <PageHeader
        eyebrow="Catalog"
        title="Catalog of compounds."
        lead="Every entry below is produced under the same lyophilization, sealing, and verification protocol. Each vial carries a unique lot number traceable to an independent certificate of analysis."
      />
      {/* Operational metadata band */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-8 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
          <div className="flex items-center gap-3">
            <span className="text-foreground/35">Compounds</span>
            <span className="text-ink tabular-nums">{String(products.length).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-foreground/35">Lots on record</span>
            <span className="text-ink tabular-nums">{batches.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-foreground/35">Mean purity</span>
            <span className="text-ink tabular-nums">{avgPurity}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-foreground/35">Assayed by</span>
            <span className="text-ink normal-case tracking-[0.04em]">{labPartner.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {/* Filter rail — editorial chips, not pills */}
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 mb-14 pb-6 border-b border-border">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/45 mr-2">— Filter</span>
          {["All", ...categories.map((c) => c.name)].map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={[
                  "relative pb-1 text-[12.5px] tracking-[0.01em] transition-colors duration-200",
                  active ? "text-ink" : "text-foreground/55 hover:text-ink",
                  "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-px after:bg-ink",
                  active ? "after:opacity-100" : "after:opacity-0",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
          <span className="ml-auto text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/50 tabular-nums">
            {String(filtered.length).padStart(2, "0")} results
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filtered.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>
    </Layout>
  );
}