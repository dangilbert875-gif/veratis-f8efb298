import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layout, PageHeader } from "@/components/site/Layout";
import { articles, categories, type ArticleCategory } from "@/data/articles";
import { Search } from "lucide-react";
import { ReferencedSources, pepPediaSource } from "@/components/site/ReferencedSources";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Reference Library — VERATIS" },
      { name: "description", content: "A working reference library for peptide handling, HPLC analysis, lyophilization, cold-chain storage, endotoxin standards, mass spectrometry, and laboratory protocol." },
      { property: "og:title", content: "Reference Library — VERATIS" },
      { property: "og:description", content: "Long-form notes on HPLC, mass spectrometry, lyophilization, cold-chain storage, and verification systems." },
      { property: "og:url", content: "https://veratisbio.com/blog" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/blog" }],
  }),
  component: Blog,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Blog() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ArticleCategory | "All">("All");

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const mostReferenced = articles.filter((a) => a.mostReferenced).slice(0, 4);
  const recentlyUpdated = [...articles]
    .sort((a, b) => +new Date(b.updatedOn) - +new Date(a.updatedOn))
    .slice(0, 4);
  const featuredMethods = articles.filter((a) => a.featuredMethod);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (active !== "All" && a.category !== active) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.deck.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [query, active]);

  return (
    <Layout>
      <PageHeader
        eyebrow="Reference library"
        title="A working library for the laboratory."
        lead="Long-form notes on analytical method, formulation, storage, and the verification systems that sit behind every released lot."
      />

      {/* Operational strip */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55">
          <span>{articles.length} entries · 8 categories</span>
          <span>Most recent update · {formatDate([...articles].sort((a,b)=>+new Date(b.updatedOn)-+new Date(a.updatedOn))[0].updatedOn)}</span>
          <span className="inline-flex items-center gap-2"><span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" /> Library online</span>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20">
        <Link to="/blog/$slug" params={{ slug: featured.slug }} className="grid md:grid-cols-12 gap-10 group items-center">
          <div className="md:col-span-7 aspect-[4/3] rounded-[3px] overflow-hidden border border-border bg-mist">
            <img src={featured.image} alt="" loading="lazy" width={1536} height={1024} className="w-full h-full object-cover group-hover:scale-[1.015] transition duration-700" />
          </div>
          <div className="md:col-span-5">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-primary">Featured · {featured.category}</p>
            <h2 className="mt-4 font-display text-3xl md:text-[2.5rem] leading-[1.1] tracking-[-0.02em] text-ink">{featured.title}</h2>
            <p className="mt-4 text-[15px] text-muted-foreground leading-[1.75]">{featured.deck}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55">
              <span>{featured.readMinutes} min read</span>
              <span>Published {formatDate(featured.publishedOn)}</span>
              <span>Updated {formatDate(featured.updatedOn)}</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Curated rails */}
      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-3 gap-10">
          <Rail title="Most referenced" entries={mostReferenced} />
          <Rail title="Recently updated" entries={recentlyUpdated} showDate />
          <Rail title="Featured methods" entries={featuredMethods} />
        </div>
      </section>

      {/* Index w/ search + filter */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-2">— Catalogue</p>
            <h2 className="font-display text-3xl md:text-[2.25rem] leading-[1.1] tracking-[-0.02em] text-ink">All entries</h2>
          </div>
          <label className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45" strokeWidth={1.75} />
            <input
              aria-label="Search reference library"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic, method, term…"
              className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-[3px] text-[13.5px] text-ink placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {(["All", ...categories] as const).map((c) => {
            const isActive = active === c;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={[
                  "text-[11px] font-mono uppercase tracking-[0.16em] px-3 py-1.5 rounded-[3px] border transition",
                  isActive
                    ? "border-ink bg-ink text-background"
                    : "border-border text-foreground/65 hover:text-ink hover:border-foreground/40",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries match that query.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map((a) => (
              <Link
                key={a.slug}
                to="/blog/$slug"
                params={{ slug: a.slug }}
                className="group block border-t border-border pt-5"
              >
                <div className="flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
                  <span>{a.category}</span>
                  <span>{a.readMinutes} min</span>
                </div>
                <h3 className="mt-3 font-display text-[20px] leading-[1.25] tracking-[-0.01em] text-ink group-hover:text-primary transition">{a.title}</h3>
                <p className="mt-3 text-[13.5px] text-muted-foreground leading-[1.7]">{a.deck}</p>
                <p className="mt-4 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/45">Updated {formatDate(a.updatedOn)}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-20 max-w-3xl">
          <ReferencedSources
            heading="Referenced sources"
            intro="External educational archives we cite alongside the Veratis reference library. Curated, independent, and outside our control."
            sources={[pepPediaSource()]}
          />
        </div>
      </section>
    </Layout>
  );
}

function Rail({ title, entries, showDate }: { title: string; entries: { slug: string; title: string; category: string; updatedOn: string }[]; showDate?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 pb-4 mb-4 border-b border-border">{title}</p>
      <ul className="space-y-4">
        {entries.map((e, i) => (
          <li key={e.slug} className="flex gap-4">
            <span className="font-mono text-[11px] text-foreground/40 tabular-nums pt-0.5">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1">
              <Link to="/blog/$slug" params={{ slug: e.slug }} className="text-[14px] text-ink hover:text-primary transition leading-snug">
                {e.title}
              </Link>
              <p className="mt-1 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/50">
                {e.category}{showDate ? ` · ${formatDate(e.updatedOn)}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}