import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { findArticle, relatedArticles, articles, type Article } from "@/data/articles";
import { products } from "@/data/products";
import { findBatch } from "@/data/batches";
import { Figure } from "@/components/site/ArticleVisuals";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const a = articles.find((x) => x.slug === params.slug);
    if (!a) return { meta: [{ title: "Article — VERATIS" }] };
    const origin = "https://pure-peptide-labs.lovable.app";
    return {
      meta: [
        { title: `${a.title} — VERATIS Reference` },
        { name: "description", content: a.deck },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.deck },
        { property: "og:image", content: a.image },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${origin}/blog/${a.slug}` },
        { property: "article:published_time", content: a.publishedOn },
        { property: "article:modified_time", content: a.updatedOn },
        { property: "article:section", content: a.category },
      ],
      links: [
        { rel: "canonical", href: `${origin}/blog/${a.slug}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: a.title,
            description: a.deck,
            datePublished: a.publishedOn,
            dateModified: a.updatedOn,
            author: { "@type": "Organization", name: a.author },
            publisher: { "@type": "Organization", name: "VERATIS" },
            articleSection: a.category,
            inLanguage: "en",
            mainEntityOfPage: `${origin}/blog/${a.slug}`,
          }),
        },
      ],
    };
  },
  loader: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-foreground/55">Reference library</p>
        <h1 className="mt-4 font-display text-3xl text-ink">Entry not found.</h1>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft size={14} /> Back to the library
        </Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-2xl text-ink">Something went wrong.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </Layout>
  ),
  component: ArticlePage,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData() as { article: Article };
  const related = relatedArticles(article.slug, article.category);
  const compounds = (article.relatedCompounds ?? [])
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const lots = (article.archiveLots ?? [])
    .map((l) => findBatch(l))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  // Adjacent articles for prev/next, chronological by publishedOn
  const ordered = useMemo(
    () => [...articles].sort((a, b) => +new Date(a.publishedOn) - +new Date(b.publishedOn)),
    []
  );
  const idx = ordered.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;

  // Table of contents from headings
  const toc = useMemo(
    () =>
      article.body
        .filter((b): b is { kind: "h"; text: string } => b.kind === "h")
        .map((h) => ({ id: slugify(h.text), text: h.text })),
    [article]
  );

  return (
    <Layout>
      <ReadingProgress />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55">
          <Link to="/" className="hover:text-ink transition">VERATIS</Link>
          <ChevronRight size={11} className="text-foreground/35" />
          <Link to="/blog" className="hover:text-ink transition">Reference library</Link>
          <ChevronRight size={11} className="text-foreground/35" />
          <span className="text-ink">{article.category}</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="border-b border-border bg-mist/40">
        <div className="mx-auto max-w-4xl px-6 pt-16 md:pt-20 pb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary">{article.category}</p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl leading-[1.08] tracking-[-0.02em] text-ink">{article.title}</h1>
          <p className="mt-5 text-[16px] md:text-[17px] text-muted-foreground leading-[1.7] max-w-2xl">{article.deck}</p>
          {(article.reviewedBy || article.revision) && (
            <p className="mt-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/55">
              {article.reviewedBy && (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                  Reviewed by {article.reviewedBy}
                </span>
              )}
              {article.revision && <span>· Revision {article.revision}</span>}
              <span>· Archive-linked</span>
            </p>
          )}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55 border-t border-border pt-5">
            <Meta label="Author" value={article.author} />
            <Meta label="Read" value={`${article.readMinutes} min`} />
            <Meta label="Published" value={formatDate(article.publishedOn)} />
            <Meta label="Updated" value={formatDate(article.updatedOn)} />
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="aspect-[16/9] rounded-[3px] overflow-hidden border border-border bg-mist">
            <img src={article.image} alt="" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Body + sidebar TOC */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 grid lg:grid-cols-[1fr_minmax(0,_44rem)_16rem] gap-x-12">
        {/* left spacer column for symmetry on large screens */}
        <div aria-hidden className="hidden lg:block" />

        <article>
        {article.body.map((b, i) => {
          if (b.kind === "h")
            return (
              <h2 id={slugify(b.text)} key={i} className="scroll-mt-24 mt-12 mb-4 font-display text-[26px] leading-[1.2] tracking-[-0.015em] text-ink">
                {b.text}
              </h2>
            );
          if (b.kind === "p")
            return (
              <p key={i} className="mb-5 text-[16px] leading-[1.8] text-foreground/85">
                {b.text}
              </p>
            );
          if (b.kind === "quote")
            return (
              <blockquote
                key={i}
                className="my-10 border-l-2 border-primary pl-6 font-display text-[22px] md:text-[24px] leading-[1.35] tracking-[-0.01em] text-ink"
              >
                “{b.text}”
                {b.cite && (
                  <footer className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/55">— {b.cite}</footer>
                )}
              </blockquote>
            );
          if (b.kind === "list")
            return (
              <ul key={i} className="mb-6 space-y-2.5 text-[15.5px] leading-[1.7] text-foreground/85">
                {b.items.map((it, j) => (
                  <li key={j} className="pl-5 relative">
                    <span className="absolute left-0 top-[0.7em] w-2 h-px bg-foreground/40" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          if (b.kind === "table")
            return (
              <div key={i} className="my-8 border border-border rounded-[3px] overflow-hidden">
                <table className="w-full text-[13.5px]">
                  <thead className="bg-mist/60 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
                    <tr>
                      {b.head.map((h) => (
                        <th key={h} className="text-left px-4 py-3 border-b border-border">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={ri} className={ri !== b.rows.length - 1 ? "border-b border-border/70" : ""}>
                        {r.map((c, ci) => (
                          <td key={ci} className="px-4 py-3.5 align-top text-foreground/85 leading-[1.6]">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          if (b.kind === "definition")
            return (
              <aside
                key={i}
                className="my-8 border-l-2 border-ink pl-5 py-1"
              >
                <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
                  Definition · {b.term}
                </p>
                <p className="mt-2 text-[15px] leading-[1.7] text-ink">{b.body}</p>
              </aside>
            );
          if (b.kind === "figure")
            return <Figure key={i} kind={b.figure} caption={b.caption} figureNumber={String(i)} />;
          return null;
        })}

        {/* References */}
        <section className="mt-16 pt-8 border-t border-border">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-4">References</p>
          <ol className="space-y-2 text-[13px] text-muted-foreground leading-[1.65] list-decimal pl-5">
            {article.references.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </section>
        </article>

        {/* Sticky TOC sidebar */}
        {toc.length > 1 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 pb-3 mb-3 border-b border-border">
                On this page
              </p>
              <ol className="space-y-2.5 text-[13px] leading-[1.55]">
                {toc.map((t, i) => (
                  <li key={t.id} className="flex gap-3">
                    <span className="font-mono text-[10.5px] text-foreground/40 tabular-nums pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${t.id}`}
                      className="text-foreground/70 hover:text-ink transition"
                    >
                      {t.text}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-6 pt-4 border-t border-border text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/45">
                {article.readMinutes} min · {toc.length} sections
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Related compounds + archive lots */}
      {(compounds.length > 0 || lots.length > 0) && (
        <section className="border-t border-border bg-mist/40">
          <div className="mx-auto max-w-5xl px-6 py-16 grid md:grid-cols-2 gap-12">
            {compounds.length > 0 && (
              <div>
                <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-4">Related compounds</p>
                <ul className="divide-y divide-border border-y border-border">
                  {compounds.map((p) => (
                    <li key={p.slug}>
                      <Link
                        to="/shop/$slug"
                        params={{ slug: p.slug }}
                        className="flex items-baseline justify-between gap-4 py-3.5 group"
                      >
                        <span className="text-[14px] text-ink group-hover:text-primary transition">{p.name}</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55">{p.purity}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lots.length > 0 && (
              <div>
                <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-4">Referenced archive lots</p>
                <ul className="divide-y divide-border border-y border-border">
                  {lots.map((b) => (
                    <li key={b.lot}>
                      <Link to="/verify" className="flex items-baseline justify-between gap-4 py-3.5 group">
                        <span className="font-mono text-[13px] tracking-[0.08em] text-ink group-hover:text-primary transition">LOT {b.lot}</span>
                        <span className="text-[12px] text-foreground/55">{b.product}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-2 gap-px bg-border">
            <div className="bg-background p-8">
              {prev ? (
                <Link to="/blog/$slug" params={{ slug: prev.slug }} className="block group">
                  <p className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
                    <ArrowLeft size={12} /> Previous entry
                  </p>
                  <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.18em] text-primary">{prev.category}</p>
                  <h3 className="mt-2 font-display text-[20px] leading-[1.25] tracking-[-0.01em] text-ink group-hover:text-primary transition">
                    {prev.title}
                  </h3>
                </Link>
              ) : (
                <span className="block opacity-30 text-[10.5px] font-mono uppercase tracking-[0.22em]">Start of archive</span>
              )}
            </div>
            <div className="bg-background p-8 md:text-right">
              {next ? (
                <Link to="/blog/$slug" params={{ slug: next.slug }} className="block group">
                  <p className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 md:justify-end w-full">
                    Next entry <ArrowRight size={12} />
                  </p>
                  <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.18em] text-primary">{next.category}</p>
                  <h3 className="mt-2 font-display text-[20px] leading-[1.25] tracking-[-0.01em] text-ink group-hover:text-primary transition">
                    {next.title}
                  </h3>
                </Link>
              ) : (
                <span className="block opacity-30 text-[10.5px] font-mono uppercase tracking-[0.22em]">End of archive</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex items-end justify-between mb-8">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">Continue reading</p>
              <Link to="/blog" className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink inline-flex items-center gap-2 hover:text-primary transition">
                All entries <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((r) => (
                <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} className="block border-t border-border pt-5 group">
                  <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">{r.category}</p>
                  <h3 className="mt-3 font-display text-[19px] leading-[1.25] tracking-[-0.01em] text-ink group-hover:text-primary transition">{r.title}</h3>
                  <p className="mt-3 text-[13.5px] text-muted-foreground leading-[1.7]">{r.deck}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-foreground/45">{label}</p>
      <p className="mt-1 text-ink normal-case tracking-normal font-sans text-[12.5px]">{value}</p>
    </div>
  );
}