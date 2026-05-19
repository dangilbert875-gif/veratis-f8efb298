import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { findArticle, relatedArticles, articles, type Article } from "@/data/articles";
import { products } from "@/data/products";
import { findBatch } from "@/data/batches";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const a = articles.find((x) => x.slug === params.slug);
    if (!a) return { meta: [{ title: "Article — VERATIS" }] };
    return {
      meta: [
        { title: `${a.title} — VERATIS Reference` },
        { name: "description", content: a.deck },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.deck },
        { property: "og:image", content: a.image },
        { property: "og:type", content: "article" },
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

function ArticlePage() {
  const { article } = Route.useLoaderData() as { article: Article };
  const related = relatedArticles(article.slug, article.category);
  const compounds = (article.relatedCompounds ?? [])
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const lots = (article.archiveLots ?? [])
    .map((l) => findBatch(l))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <Layout>
      {/* Hero */}
      <header className="border-b border-border bg-mist/40">
        <div className="mx-auto max-w-4xl px-6 pt-16 md:pt-20 pb-12">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-foreground/55 hover:text-ink transition">
            <ArrowLeft size={13} /> Reference library
          </Link>
          <p className="mt-8 text-[11px] font-mono uppercase tracking-[0.22em] text-primary">{article.category}</p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl leading-[1.08] tracking-[-0.02em] text-ink">{article.title}</h1>
          <p className="mt-5 text-[16px] md:text-[17px] text-muted-foreground leading-[1.7] max-w-2xl">{article.deck}</p>
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

      {/* Body */}
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {article.body.map((b, i) => {
          if (b.kind === "h")
            return (
              <h2 key={i} className="mt-12 mb-4 font-display text-[26px] leading-[1.2] tracking-[-0.015em] text-ink">
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