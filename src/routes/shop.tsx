import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/data/products";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Peptides — VERATIS" },
      { name: "description", content: "Browse research-grade peptides. Every batch HPLC and mass-spec verified." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [filter, setFilter] = useState<string>("All");
  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);
  return (
    <Layout>
      <PageHeader
        eyebrow="Catalog"
        title="The full catalog."
        lead="Every product is lyophilized, sealed under nitrogen, and shipped with a batch-specific certificate of analysis."
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-border">
          {["All", ...categories.map((c) => c.name)].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={
                "text-sm px-4 py-2 rounded-full border transition " +
                (filter === c
                  ? "bg-ink text-background border-ink"
                  : "bg-background border-border text-foreground/70 hover:border-foreground/40")
              }
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">{filtered.length} products</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
          {filtered.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>
    </Layout>
  );
}