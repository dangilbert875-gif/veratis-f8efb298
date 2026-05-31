import { ArrowUpRight } from "lucide-react";

/**
 * Referenced Sources. the canonical editorial module for surfacing
 * external scientific references across the Veratis archive.
 *
 * Used on compound dossiers, education articles, and methodology pages.
 * Veratis does not scrape, reproduce, or iframe third-party content; this
 * module is an editorially curated set of outbound references. All links
 * open in a new tab with rel="nofollow noopener noreferrer".
 */

export type SourceKind =
  | "peppedia"
  | "pubmed"
  | "method"
  | "sequence"
  | "archive"
  | "standard"
  | "external";

export type ReferencedSource = {
  kind: SourceKind;
  /** Editorial title of the reference (e.g. compound name, paper title). */
  label: string;
  /** Outbound URL. Opens in a new tab with nofollow. */
  href: string;
  /** Optional one-line editorial note. */
  note?: string;
  /** Optional small metadata (e.g. "Updated 2025", "PMID 31234567"). */
  meta?: string;
};

const KIND_LABEL: Record<SourceKind, string> = {
  peppedia: "Educational database",
  pubmed: "Peer-reviewed source",
  method: "Assay methodology",
  sequence: "Sequence resource",
  archive: "Scientific archive",
  standard: "Analytical standard",
  external: "Independent resource",
};

const KIND_PROVIDER: Partial<Record<SourceKind, string>> = {
  peppedia: "PepPedia",
  pubmed: "PubMed",
};

/**
 * Quiet CTA copy by kind. replaces generic "View on ..." button language.
 */
function ctaFor(kind: SourceKind): string {
  switch (kind) {
    case "peppedia":
      return "Open PepPedia reference";
    case "pubmed":
      return "Open peer-reviewed source";
    case "archive":
      return "View archive entry";
    case "method":
      return "Open methodology reference";
    case "sequence":
      return "Open sequence resource";
    case "standard":
      return "Open analytical standard";
    default:
      return "Open external reference";
  }
}

export function ReferencedSources({
  sources,
  heading = "Referenced sources",
  intro,
}: {
  sources: ReferencedSource[];
  heading?: string;
  intro?: string;
}) {
  if (!sources.length) return null;

  return (
    <section
      aria-label={heading}
      className="border-t border-border pt-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
            §
          </span>
          <h3 className="text-[12px] font-mono uppercase tracking-[0.22em] text-ink">
            {heading}
          </h3>
        </div>
        <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/45 tabular-nums">
          {String(sources.length).padStart(2, "0")} curated
        </p>
      </div>

      {intro && (
        <p className="text-[13.5px] text-muted-foreground leading-[1.7] max-w-2xl mb-6">
          {intro}
        </p>
      )}

      <ul className="divide-y divide-border border-y border-border">
        {sources.map((s, i) => (
          <li key={`${s.href}-${i}`}>
            <a
              href={s.href}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="block group py-5 px-1 -mx-1 transition-colors hover:bg-mist/40"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/55">
                    <span>{KIND_LABEL[s.kind]}</span>
                    {KIND_PROVIDER[s.kind] && (
                      <>
                        <span className="text-foreground/25">·</span>
                        <span className="text-ink/80">{KIND_PROVIDER[s.kind]}</span>
                      </>
                    )}
                    {s.meta && (
                      <>
                        <span className="text-foreground/25">·</span>
                        <span className="tabular-nums">{s.meta}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-2 text-[15px] leading-[1.55] text-ink transition-colors group-hover:text-primary">
                    {s.label}
                  </p>
                  {s.note && (
                    <p className="mt-1.5 text-[13px] text-muted-foreground leading-[1.65] max-w-2xl">
                      {s.note}
                    </p>
                  )}
                </div>
                <span
                  aria-hidden
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55 transition-colors group-hover:text-ink shrink-0"
                >
                  {ctaFor(s.kind)}
                  <ArrowUpRight
                    size={12}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[12px] text-muted-foreground/90 leading-[1.65] max-w-2xl">
        External educational resources, independently curated. Veratis does not
        control or guarantee third-party content.
      </p>
    </section>
  );
}

/**
 * Convenience builders for the most common source kinds.
 */
export function pepPediaSource(query?: string): ReferencedSource {
  const base = "https://pep-pedia.org";
  return {
    kind: "peppedia",
    label: query ? `Reference entry · ${query}` : "PepPedia reference library",
    href: query ? `${base}/ask?q=${encodeURIComponent(query)}` : base,
    note: query
      ? `Independent educational notes on ${query}, maintained outside of Veratis.`
      : "Independent peptide reference resource maintained outside of Veratis.",
  };
}