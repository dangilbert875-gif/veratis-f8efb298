import { Link } from "@tanstack/react-router";
import type { Dossier } from "@/data/compoundDossiers";
import { products } from "@/data/products";
import { siblingSlugsForKey, dossierForSlug } from "@/data/compoundDossiers";
import { ReferencedSources, pepPediaSource } from "@/components/site/ReferencedSources";

/**
 * Editorial scientific dossier surfaced inside every product detail page.
 * Read-only, no interactions beyond outbound links. Tone is research-only:
 * never make therapeutic claims here.
 */
export function CompoundDossier({
  dossier,
  currentSlug,
}: {
  dossier: Dossier;
  currentSlug: string;
}) {
  const allSlugs = products.map((p) => p.slug);
  const siblingSizes = siblingSlugsForKey(dossier.key, allSlugs, currentSlug);

  const relatedProducts = dossier.related
    .flatMap((key) =>
      products.filter((p) => {
        const d = dossierForSlug(p.slug);
        return d?.key === key;
      })
    )
    // de-duplicate by compound key — only show the first SKU per related compound
    .filter((p, _i, arr) => {
      const k = dossierForSlug(p.slug)?.key;
      return arr.findIndex((q) => dossierForSlug(q.slug)?.key === k) === arr.indexOf(p);
    });

  return (
    <article className="border-t border-border bg-background">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
        {/* Dossier header */}
        <header className="border-b border-border pb-8 mb-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
            <span className="text-primary">Compound dossier</span>
            <span className="text-foreground/30">·</span>
            <span>Research use only</span>
            <span className="text-foreground/30">·</span>
            <span>Revision 1.0</span>
          </div>
          <h2 className="mt-5 font-display text-3xl md:text-[2.5rem] leading-[1.08] tracking-[-0.02em] text-ink">
            {dossier.displayName}
          </h2>
          <p className="mt-3 text-[13.5px] text-muted-foreground leading-[1.7]">
            {dossier.classification}
            {dossier.sequenceNote && (
              <>
                <span className="block mt-1 font-mono text-[12px] tracking-[0.04em] text-foreground/65">
                  Sequence · {dossier.sequenceNote}
                </span>
              </>
            )}
          </p>
        </header>

        <Section eyebrow="Overview" heading={`What is ${dossier.displayName}?`}>
          {dossier.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section eyebrow="Origin" heading="Discovery & background">
          <p>{dossier.origin}</p>
        </Section>

        <Section eyebrow="Research interest" heading="What it has been studied for">
          <p className="text-[12.5px] font-mono uppercase tracking-[0.18em] text-foreground/55 mb-4 mt-0">
            Research-only phrasing · not a claim of efficacy
          </p>
          <ul className="space-y-2.5">
            {dossier.researchInterest.map((it, i) => (
              <li key={i} className="pl-5 relative text-foreground/85">
                <span className="absolute left-0 top-[0.75em] w-2 h-px bg-foreground/40" />
                {it}
              </li>
            ))}
          </ul>
        </Section>

        <Section eyebrow="Mechanism" heading="How it has been characterized">
          {dossier.mechanism.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        <Section eyebrow="Production" heading="Origin & sourcing">
          <p>{dossier.sourcing}</p>
        </Section>

        <Section eyebrow="Verification" heading="Purity & release">
          <p>{dossier.verification}</p>
          <p className="mt-4 text-[12.5px] font-mono uppercase tracking-[0.18em]">
            <Link to="/verify" className="text-primary hover:text-ink transition">
              Open the verification system →
            </Link>
          </p>
        </Section>

        <Section eyebrow="Handling" heading="Storage & handling">
          <p>{dossier.storage}</p>
        </Section>

        <Section eyebrow="Further reading" heading="">
          <ReferencedSources
            heading="Referenced sources"
            intro={`Independent reference material on ${dossier.displayName}, curated for scientific context. Veratis remains the primary verification authority for every released lot.`}
            sources={[pepPediaSource(dossier.displayName)]}
          />
        </Section>

        {/* Sibling sizes — other SKUs of the same compound */}
        {siblingSizes.length > 0 && (
          <Section eyebrow="Other sizes of this compound" heading="">
            <ul className="divide-y divide-border border-y border-border">
              {siblingSizes.map((slug) => {
                const p = products.find((x) => x.slug === slug)!;
                return (
                  <li key={slug}>
                    <Link
                      to="/shop/$slug"
                      params={{ slug }}
                      className="flex items-baseline justify-between gap-4 py-3.5 group"
                    >
                      <span className="text-[14px] text-ink group-hover:text-primary transition">
                        {p.name}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55 tabular-nums">
                        ${p.price}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* Related research */}
        {relatedProducts.length > 0 && (
          <Section eyebrow="Related research" heading="Compounds often studied alongside">
            <ul className="divide-y divide-border border-y border-border">
              {relatedProducts.map((p) => {
                const d = dossierForSlug(p.slug)!;
                return (
                  <li key={p.slug}>
                    <Link
                      to="/shop/$slug"
                      params={{ slug: p.slug }}
                      className="flex items-baseline justify-between gap-4 py-3.5 group"
                    >
                      <span>
                        <span className="text-[14px] text-ink group-hover:text-primary transition">
                          {d.displayName}
                        </span>
                        <span className="block text-[11.5px] text-foreground/55 mt-0.5">
                          {d.classification}
                        </span>
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/45">
                        View →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* FAQ */}
        {dossier.faq.length > 0 && (
          <Section eyebrow="Reference Q&A" heading="Questions researchers ask about this compound">
            <dl className="border-t border-border">
              {dossier.faq.map((q) => (
                <div key={q.q} className="py-5 border-b border-border">
                  <dt className="font-display text-[18px] leading-[1.3] tracking-[-0.01em] text-ink">
                    {q.q}
                  </dt>
                  <dd className="mt-2.5 text-[15px] text-foreground/85 leading-[1.7]">{q.a}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {/* Closing compliance note */}
        <footer className="mt-12 pt-8 border-t border-border">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/55">
            For in-vitro research use only · Not for human or veterinary consumption · Educational content only · Research applications continue to evolve
          </p>
        </footer>
      </div>
    </article>
  );
}

function Section({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-12 py-10 border-t border-border first:border-t-0 first:pt-0">
      <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 pt-1">
        — {eyebrow}
      </p>
      <div className="space-y-4 text-[15.5px] leading-[1.75] text-foreground/85">
        {heading && (
          <h3 className="font-display text-[22px] md:text-[26px] leading-[1.2] tracking-[-0.015em] text-ink mb-2">
            {heading}
          </h3>
        )}
        {children}
      </div>
    </section>
  );
}