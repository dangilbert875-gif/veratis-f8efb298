import { Check, X } from "lucide-react";

const rows: { topic: string; typical: string; veratis: string }[] = [
  { topic: "Certificate of analysis", typical: "One recycled COA across many lots", veratis: "Batch-specific COA per lot, signed and dated" },
  { topic: "Testing laboratory",      typical: "Unnamed or in-house",                veratis: "Independent ISO/IEC 17025:2017 accredited lab" },
  { topic: "Archive permanence",      typical: "COA disappears on relabel",         veratis: "Permanent record, append-only, public lookup" },
  { topic: "Lot traceability",        typical: "No lot on vial or carton",          veratis: "Serialized lot on vial, carton, and tamper seal" },
  { topic: "Endotoxin",               typical: "Not reported",                      veratis: "Published per lot. LAL kinetic chromogenic" },
  { topic: "Release procedure",       typical: "Single sign-off, undocumented",     veratis: "Two-analyst sign-off against published spec" },
];

export function WhyVeratis() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-end mb-12">
        <div className="md:col-span-5">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">Why VERATIS</p>
          <h2 className="text-3xl md:text-[2.5rem] text-ink leading-[1.1] tracking-[-0.02em]">
            What the industry does.<br />
            What we do instead.
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-[14.5px] text-muted-foreground leading-[1.75]">
            A side-by-side comparison against common practice in the research-peptide market. not against any specific competitor. Every claim on our side is documented elsewhere on this site.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-[3px] overflow-hidden bg-background">
        <div className="hidden md:grid grid-cols-[1.1fr_1.2fr_1.3fr] text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55 bg-mist/50 px-6 py-3.5 border-b border-border">
          <span>Attribute</span>
          <span>Typical research peptide vendor</span>
          <span>VERATIS</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.topic}
            className={[
              "grid grid-cols-1 md:grid-cols-[1.1fr_1.2fr_1.3fr] gap-y-2 md:gap-y-0 md:items-center px-6 py-5 text-[13.5px]",
              i !== rows.length - 1 ? "border-b border-border/70" : "",
            ].join(" ")}
          >
            <p className="text-[10.5px] md:text-[12px] font-mono md:font-sans uppercase md:normal-case md:tracking-normal tracking-[0.18em] text-foreground/55 md:text-ink">
              {r.topic}
            </p>
            <p className="text-muted-foreground inline-flex items-start gap-2">
              <X size={13} className="text-foreground/35 mt-1 shrink-0" strokeWidth={1.75} />
              <span>{r.typical}</span>
            </p>
            <p className="text-ink inline-flex items-start gap-2">
              <Check size={13} className="text-primary mt-1 shrink-0" strokeWidth={2.25} />
              <span>{r.veratis}</span>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[11px] font-mono uppercase tracking-[0.16em] text-foreground/45">
        Comparison reflects common market practice · not a claim against any individual vendor
      </p>
    </section>
  );
}
