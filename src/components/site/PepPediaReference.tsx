import { ExternalLink } from "lucide-react";

/**
 * External reference module linking out to PepPedia (https://pep-pedia.org/).
 *
 * VERATIS does not control, scrape, or reproduce PepPedia content. This is a
 * tasteful outbound reference only. All links open in a new tab and carry
 * rel="nofollow noopener noreferrer".
 */
export function PepPediaReference({
  query,
  variant = "block",
}: {
  /** Optional compound or topic name. Used to deep-link into PepPedia's Ask. */
  query?: string;
  /** "block" = full bordered module · "inline" = single quiet link line */
  variant?: "block" | "inline";
}) {
  const base = "https://pep-pedia.org";
  const href = query
    ? `${base}/ask?q=${encodeURIComponent(query)}`
    : base;

  if (variant === "inline") {
    return (
      <p className="text-[12px] text-muted-foreground leading-[1.6]">
        Further reading ·{" "}
        <a
          href={href}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="text-ink underline decoration-foreground/30 underline-offset-4 hover:decoration-primary hover:text-primary transition"
        >
          View {query ? `“${query}”` : "this topic"} on PepPedia
        </a>
        <span className="block mt-1 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/45">
          External educational resource · Veratis does not control or guarantee third-party content
        </span>
      </p>
    );
  }

  return (
    <aside className="border border-border rounded-[3px] bg-background px-5 py-5">
      <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
        — External reference
      </p>
      <p className="mt-3 text-[14px] text-ink leading-[1.6]">
        {query
          ? `Additional educational notes on ${query} are maintained by PepPedia, an independent peptide reference resource.`
          : "PepPedia is an independent peptide reference resource maintained outside of VERATIS."}
      </p>
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-ink border border-border px-3 py-2 rounded-[3px] hover:text-primary hover:border-primary/50 transition"
      >
        View on PepPedia <ExternalLink size={12} strokeWidth={1.75} />
      </a>
      <p className="mt-4 text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/45 leading-[1.6]">
        External educational resource · Veratis does not control or guarantee third-party content
      </p>
    </aside>
  );
}