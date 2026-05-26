import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { useCatalog, deriveCategories } from "@/lib/use-catalog";
import { batches, labPartner } from "@/data/batches";
import { useEffect, useState } from "react";
import { BatchVerify } from "@/components/site/BatchVerify";
import { Info, Scale, Target, MessagesSquare, ArrowRight, ChevronDown, X, Search, ShieldCheck } from "lucide-react";
import type { Product } from "@/data/products";

// Subtle category accent colors — 6px top-left bar on each card
const CATEGORY_ACCENTS: Record<string, string> = {
  "Tissue Recovery": "bg-teal-300/60",
  "Regenerative": "bg-amber-300/60",
  "Growth Hormone": "bg-sky-300/50",
  "Hormonal": "bg-rose-300/50",
  "Pigmentation": "bg-orange-300/50",
  "Mitochondrial": "bg-violet-300/55",
  "Metabolic": "bg-slate-500/40",
};

// All categories the brand offers (some may be empty)
const ALL_CATEGORIES = [
  "Tissue Recovery",
  "Regenerative",
  "Growth Hormone",
  "Hormonal",
  "Pigmentation",
  "Mitochondrial",
  "Metabolic",
];

const TAGLINES: Record<string, string> = {
  "bpc-157-12mg": "Pentadecapeptide for tissue recovery research",
  "bpc-tb-500-blend": "Combined recovery blend for soft tissue studies",
  "tb-500-fragment-12mg": "Thymosin Beta-4 fragment for soft tissue",
  "tb-4-full-sequence-10mg": "Full-sequence TB-4 for regenerative studies",
  "ghk-cu-100mg": "Copper tripeptide for skin & regenerative",
  "ghk-cu-50mg": "Copper tripeptide for skin & regenerative",
  "mots-c-10mg": "Mitochondrial-derived metabolic peptide",
  "retatrutide-10mg": "Triple agonist for metabolic research",
  "retatrutide-20mg": "Triple agonist for metabolic research",
  "tirzepatide-15mg": "GLP-1/GIP dual agonist",
  "tirzepatide-30mg": "GLP-1/GIP dual agonist",
};

// Real stock state derived from backend inventory.
// Falls back to "in_stock" when no inventory data is present (static catalog).
const LOW_STOCK_FLOOR = 20;
function stockForProduct(p: Product): {
  state: "in_stock" | "low" | "last3";
  count?: number;
} {
  if (p.inStock === false) return { state: "in_stock" };
  const n = p.inventoryCount;
  if (typeof n !== "number") return { state: "in_stock" };
  if (n <= 0) return { state: "in_stock" }; // out_of_stock handled via inStock=false
  if (n <= 3) return { state: "last3", count: n };
  const threshold = p.lowStockThreshold ?? LOW_STOCK_FLOOR;
  if (n <= threshold) return { state: "low", count: n };
  return { state: "in_stock" };
}

type SortKey = "featured" | "price-asc" | "price-desc" | "purity-desc" | "name-asc";

function purityNum(p: Product): number {
  const n = parseFloat(String(p.purity).replace("%", ""));
  return Number.isFinite(n) ? n : 0;
}

function totalMgForProduct(p: Product): number {
  const tokens = p.dosage.match(/(\d[\d,.]*)\s*MG/gi);
  if (!tokens) return 0;
  return tokens.reduce((s, t) => {
    const n = parseFloat(t.replace(/MG/gi, "").replace(/,/g, "").trim());
    return s + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Peptides — VERATIS" },
      { name: "description", content: "Browse research-grade peptides. Every batch HPLC and mass-spec verified." },
      { property: "og:title", content: "Catalog of research-grade peptides — VERATIS" },
      { property: "og:description", content: "Browse the VERATIS catalog. Every vial is lot-traceable to an independent certificate of analysis." },
      { property: "og:url", content: "https://veratisbio.com/shop" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category } = Route.useSearch();
  const { products, loading, source } = useCatalog();
  const categories = deriveCategories(products);
  const initial = (() => {
    if (!category) return "All";
    const match = categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase(),
    );
    return match?.name ?? category;
  })();
  const [filter, setFilter] = useState<string>(initial);
  const [sort, setSort] = useState<SortKey>("featured");
  const [verifyOpenMobile, setVerifyOpenMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  useEffect(() => {
    setFilter(initial);
  }, [initial]);
  // Mobile: single-column, 4 per page. Desktop: multi-column, 12 per page.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const pageSize = isMobile ? 4 : 12;
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [filter, sort, query, pageSize]);

  const q = query.trim().toLowerCase();
  const baseFiltered = products.filter((p) => {
    if (filter !== "All" && p.category !== filter) return false;
    if (q) {
      const hay = `${p.name} ${p.slug} ${p.lot} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const filtered = [...baseFiltered].sort((a, b) => {
    switch (sort) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "purity-desc": return purityNum(b) - purityNum(a);
      case "name-asc": return a.name.localeCompare(b.name);
      default: return 0;
    }
  });
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const activeFilters: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filter !== "All") activeFilters.push({ key: "cat", label: filter, clear: () => setFilter("All") });
  if (q) activeFilters.push({ key: "q", label: `“${query}”`, clear: () => setQuery("") });
  if (sort !== "featured") activeFilters.push({ key: "sort", label: `Sort: ${sort.replace("-", " ")}`, clear: () => setSort("featured") });

  function clearAll() {
    setFilter("All");
    setQuery("");
    setSort("featured");
  }

  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);

  // Cheapest $/mg across the catalog for the "Best value" badge
  const cheapestPerMg = (() => {
    let best: { slug: string; ppm: number } | null = null;
    for (const p of products) {
      const total = totalMgForProduct(p);
      if (total > 0) {
        const ppm = p.price / total;
        if (!best || ppm < best.ppm) best = { slug: p.slug, ppm };
      }
    }
    return best;
  })();

  return (
    <Layout>
      <PageHeader
        eyebrow="Catalog"
        title="Catalog of compounds."
        lead="Every entry below is produced under the same lyophilization, sealing, and verification protocol. Each vial carries a unique lot number traceable to an independent certificate of analysis."
      />

      {/* Hero trust stat — mean purity promoted to top of catalog */}
      <section className="border-y border-border bg-mist/25">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-baseline gap-4 sm:gap-5">
            <span className="font-display text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] leading-none text-ink tabular-nums">
              {avgPurity}%
            </span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-foreground/55">
                Mean purity · entire catalog
              </p>
              <p className="mt-1 text-[12.5px] sm:text-[13px] text-muted-foreground leading-snug max-w-md">
                HPLC-verified across {batches.length} lots by {labPartner.name}.
              </p>
            </div>
          </div>
          <Link
            to="/verify"
            className="self-start md:self-auto hidden md:inline-flex items-center gap-2 h-11 px-5 border border-ink/25 rounded-[3px] text-[11.5px] font-mono uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-background transition"
          >
            <ShieldCheck size={13} strokeWidth={1.5} />
            Verify any lot in under 1 second
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* Mobile-only sticky verify banner */}
      <div className="md:hidden sticky top-0 z-30 border-b border-border bg-background">
        <button
          type="button"
          onClick={() => setVerifyOpenMobile((v) => !v)}
          aria-expanded={verifyOpenMobile}
          className="w-full flex items-center justify-between gap-3 px-5 h-12 text-[11.5px] font-mono uppercase tracking-[0.16em] text-ink"
        >
          <span className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Verify any lot in under 1 second
          </span>
          {verifyOpenMobile ? <X size={14} /> : <ArrowRight size={14} />}
        </button>
        {verifyOpenMobile ? (
          <div className="px-4 pb-4 pt-1 border-t border-border bg-mist/30">
            <BatchVerify compact />
          </div>
        ) : null}
      </div>

      {/* Operational metadata band */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-4 sm:py-5 grid grid-cols-2 md:grid-cols-4 gap-y-2.5 gap-x-4 sm:gap-x-8 text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.18em] text-foreground/55">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
            <span className="text-foreground/60">Active SKUs</span>
            <span className="text-ink tabular-nums">{String(products.length).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
            <span className="text-foreground/60">Lots on record</span>
            <span className="inline-flex items-center gap-1.5">
              <Link
                to="/coa-archive"
                className="text-ink tabular-nums underline decoration-foreground/30 underline-offset-[3px] hover:decoration-ink transition"
              >
                {batches.length}
              </Link>
            <span
              className="group relative hidden sm:inline-flex items-center text-foreground/40 hover:text-ink transition cursor-help"
              tabIndex={0}
              aria-label="Multiple lots per SKU. Browse full archive."
            >
              <Info size={11} strokeWidth={1.75} />
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 px-3 py-2 rounded-[3px] border border-border bg-background text-[10.5px] font-mono normal-case tracking-[0.04em] text-foreground leading-snug opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition z-20 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]">
                Multiple lots per SKU. Browse full archive →
              </span>
            </span>
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
            <span className="text-foreground/60">Mean purity</span>
            <span className="text-ink tabular-nums">{avgPurity}%</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
            <span className="text-foreground/60">Assayed by</span>
            <span className="text-ink normal-case tracking-[0.04em] truncate">{labPartner.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-6 py-10 sm:py-14 md:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 min-w-0">
          {/* Main column */}
          <div className="lg:col-span-9 min-w-0 w-full">
            {/* Filter chips + sort */}
            <div className="mb-8 md:mb-12 pb-5 border-b border-border min-w-0">
              {/* Search bar */}
              <div className="mb-4 relative max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/45" />
                <input
                  aria-label="Search products by compound or lot number"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search compound or lot number…"
                  className="w-full h-11 pl-10 pr-3 rounded-[3px] border border-border bg-background text-[13px] text-ink placeholder:text-muted-foreground focus:outline-none focus:border-ink/50 transition"
                />
              </div>

              {/* Chip row — horizontal scroll on mobile with fade edges */}
              <div className="relative -mx-1 min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                  {["All", ...ALL_CATEGORIES.filter((c) => products.some((p) => p.category === c))].map((c) => {
                    const active = filter === c;
                    const count = c === "All" ? products.length : products.filter((p) => p.category === c).length;
                    return (
                      <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={[
                          "shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-full border text-[12px] font-medium tracking-[0.01em] transition-all duration-150 touch-manipulation",
                          active
                            ? "bg-ink text-background border-ink"
                            : "bg-background text-foreground/70 border-border hover:border-ink/40 hover:text-ink",
                        ].join(" ")}
                      >
                        {c}
                        <span className={`text-[10px] font-mono tabular-nums ${active ? "text-background/60" : "text-foreground/40"}`}>
                          {String(count).padStart(2, "0")}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div aria-hidden className="md:hidden absolute left-0 top-0 bottom-1 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div aria-hidden className="md:hidden absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>

              {/* Sort + result count */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/50 tabular-nums">
                  {String(filtered.length).padStart(2, "0")} {filtered.length === 1 ? "result" : "results"}
                </span>
                <label className="inline-flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">Sort by</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="appearance-none h-11 pl-3 pr-9 rounded-[3px] border border-border bg-background text-[12.5px] text-ink hover:border-ink/40 focus:outline-none focus:border-ink/60 transition cursor-pointer"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="purity-desc">Purity: High to Low</option>
                      <option value="name-asc">Name: A–Z</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
                  </div>
                </label>
              </div>

              {/* Active filter chips + Clear all */}
              {activeFilters.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {activeFilters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={f.clear}
                      className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full border border-border bg-mist/40 text-[11px] text-foreground/75 hover:text-ink hover:border-ink/30 transition"
                    >
                      {f.label}
                      <X size={11} strokeWidth={1.75} />
                    </button>
                  ))}
                  {activeFilters.length > 1 ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55 hover:text-ink transition px-1"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Product grid OR empty state */}
            {filtered.length === 0 ? (
              <EmptyCategory category={filter} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 md:gap-x-8 gap-y-10 sm:gap-y-14 md:gap-y-16">
                {visible.map((p) => {
                  const stock = stockForProduct(p);
                  return (
                    <ProductCard
                      key={p.slug}
                      p={p}
                      accentClass={CATEGORY_ACCENTS[p.category]}
                      stockState={stock.state}
                      lowStockCount={stock.count}
                      showPricePerMg
                      bestValuePerMg={cheapestPerMg?.slug === p.slug}
                      showQuantity
                      showViewCoa
                      compactImage
                      tagline={TAGLINES[p.slug]}
                    />
                  );
                })}
              </div>
            )}

            {hasMore ? (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55 tabular-nums">
                  Showing {visible.length} of {filtered.length}
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + pageSize)}
                  className="inline-flex items-center gap-2 h-12 px-6 border border-ink/20 rounded-[3px] text-[11px] font-medium uppercase tracking-[0.22em] text-ink bg-background hover:bg-ink hover:text-background hover:border-ink transition"
                >
                  Load more <ArrowRight size={13} />
                </button>
              </div>
            ) : null}

            {loading && source === "fallback" && (
              <p className="mt-10 text-center text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/45">
                Synchronising catalog…
              </p>
            )}

            <p className="mt-10 pt-6 border-t border-border text-center text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/50 tabular-nums">
              {String(products.length).padStart(2, "0")} compounds in our active catalog
            </p>
          </div>

          {/* Sticky verify sidebar — desktop only */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <BatchVerify compact />
            </div>
          </aside>
        </div>
      </section>

      {/* Need help choosing? */}
      <section className="border-y border-border bg-mist/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Catalog tools</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight leading-tight">Need help choosing?</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Browse by research goal or talk to our team.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4 md:gap-5">
            {[
              { icon: Scale, title: "Compare peptides", body: "See mechanism, half-life, and research notes side by side.", cta: "Open comparison", to: "/standards" as const },
              { icon: Target, title: "By research goal", body: "Filter peptides by what you're studying — recovery, metabolic, longevity, more.", cta: "Browse by goal", to: "/shop" as const },
              { icon: MessagesSquare, title: "Talk to our team", body: "Bulk research orders or COA questions? We respond within 1 business day.", cta: "Contact", to: "/contact" as const },
            ].map(({ icon: Icon, title, body, cta, to }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col bg-background border border-border rounded-[3px] p-6 sm:p-7 min-h-[180px] hover:border-ink/40 transition"
              >
                <Icon size={22} className="text-ink/75 mb-4" strokeWidth={1.25} />
                <h3 className="font-display text-[1.125rem] text-ink leading-tight tracking-tight">{title}</h3>
                <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed flex-1">{body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-ink group-hover:gap-2.5 transition-all">
                  {cta} <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog help bar — sits above footer */}
      <section className="bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12.5px] text-foreground/75">
          <p>Questions about purity, dosing, or COAs?</p>
          <div className="flex items-center gap-5 text-[12px]">
            <Link to="/faq" className="inline-flex items-center gap-1 text-ink hover:text-primary transition">
              Read the FAQ <ArrowRight size={12} />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-1 text-ink hover:text-primary transition">
              Contact us <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function EmptyCategory({ category }: { category: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const label = category === "All" ? "new compounds" : category;
  return (
    <div className="border border-dashed border-border rounded-[3px] bg-mist/30 px-6 py-14 sm:py-20 text-center">
      <p className="font-display text-[1.5rem] sm:text-[1.75rem] text-ink tracking-tight leading-snug">
        No compounds in this category yet.
      </p>
      <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed max-w-md mx-auto">
        We expand the catalog quarterly. Get notified when{" "}
        <span className="text-ink">{label}</span> releases.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) setSubmitted(true);
        }}
        className="mt-7 max-w-md mx-auto flex flex-col sm:flex-row gap-2"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@lab.edu"
          className="flex-1 h-11 px-4 rounded-[3px] border border-border bg-background text-[13px] text-ink placeholder:text-muted-foreground focus:outline-none focus:border-ink/50 transition"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[3px] bg-ink text-background text-[11.5px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 active:scale-[0.985] transition whitespace-nowrap"
        >
          {submitted ? "Subscribed ✓" : "Notify me"}
        </button>
      </form>
    </div>
  );
}