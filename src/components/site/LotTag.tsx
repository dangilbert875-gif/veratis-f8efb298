import { Link } from "@tanstack/react-router";

type Props = {
  lot: string;
  status?: "verified" | "released" | "archived";
  className?: string;
  /** Renders as a Link to /verify with the lot pre-filled when true. */
  linked?: boolean;
};

/**
 * Serialized lot identifier. the brand's operational fingerprint.
 * Monospace, hairline border, optional status dot. Use anywhere a
 * batch is referenced in copy (hero, product cards, archive strips).
 */
export function LotTag({ lot, status, className = "", linked = false }: Props) {
  const dot =
    status === "verified" ? "bg-primary"
    : status === "released" ? "bg-ink/70"
    : status === "archived" ? "bg-foreground/60"
    : "";

  const content = (
    <span
      className={[
        "inline-flex items-center gap-1.5 px-2 h-[22px] rounded-[3px]",
        "border border-ink/15 bg-background/60 backdrop-blur",
        "font-mono text-[10.5px] tracking-[0.08em] tabular-nums text-ink/85",
        "transition-colors duration-200",
        linked ? "hover:border-ink/35 hover:text-ink" : "",
        className,
      ].join(" ")}
    >
      {dot && <span className={`inline-block h-1 w-1 rounded-full ${dot}`} aria-hidden />}
      <span className="text-foreground/65">LOT</span>
      <span>{lot}</span>
    </span>
  );

  if (!linked) return content;
  return (
    <Link to="/verify" aria-label={`Verify lot ${lot}`}>
      {content}
    </Link>
  );
}

/**
 * Ambient operational realism. a thin marquee-like strip of recent
 * lot codes. Static (no animation by design. restraint > motion).
 */
export function ArchiveIndexStrip({
  lots,
  className = "",
}: {
  lots: string[];
  className?: string;
}) {
  return (
    <div
      className={[
        "w-full overflow-hidden border-y border-border/70 bg-background",
        className,
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6 h-9 flex items-center gap-6 text-[10.5px] font-mono tabular-nums tracking-[0.14em] text-foreground/65">
        <span className="uppercase text-foreground/55 shrink-0">Archive index</span>
        <span className="flex-1 truncate">
          {lots.map((l, i) => (
            <span key={l}>
              {i > 0 && <span className="text-foreground/20 mx-2">·</span>}
              <span className="text-foreground/65">{l}</span>
            </span>
          ))}
        </span>
        <span className="hidden md:inline shrink-0 uppercase text-foreground/40">
          Continuously updated
        </span>
      </div>
    </div>
  );
}