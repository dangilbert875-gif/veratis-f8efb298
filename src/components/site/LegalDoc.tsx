import type { ReactNode } from "react";
import { Layout } from "./Layout";

type Meta = {
  reference: string;
  revision: string;
  updated: string;
  classification?: string;
};

/**
 * Editorial documentation shell used for all Veratis standards / legal pages.
 * Reads like a controlled document: reference number, revision, updated date,
 * structured sections with monospace metadata.
 */
export function LegalDoc({
  eyebrow,
  title,
  lead,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  meta: Meta;
  children: ReactNode;
}) {
  return (
    <Layout>
      <header className="border-b border-border bg-mist/40">
        <div className="mx-auto max-w-5xl px-6 pt-20 md:pt-24 pb-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
            <span className="text-primary">{eyebrow}</span>
            <span className="text-foreground/30">·</span>
            <span>Operational standard</span>
            <span className="text-foreground/30">·</span>
            <span className="tabular-nums">Doc {meta.reference}</span>
          </div>
          <h1 className="mt-5 font-display text-3xl md:text-[3rem] leading-[1.06] tracking-[-0.022em] text-ink max-w-3xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-5 text-[15.5px] md:text-[16px] text-muted-foreground leading-[1.75] max-w-2xl">
              {lead}
            </p>
          )}

          <dl className="mt-10 pt-6 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
            <MetaCell label="Reference" value={meta.reference} />
            <MetaCell label="Revision" value={meta.revision} />
            <MetaCell label="Updated" value={meta.updated} />
            <MetaCell label="Classification" value={meta.classification ?? "Public · Standards"} />
          </dl>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-y-14 gap-x-12">
          {children}
        </div>

        <footer className="mt-20 pt-8 border-t border-border space-y-3">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/55">
            End of document · {meta.reference} · Revision {meta.revision} · {meta.updated}
          </p>
          <p className="text-[11px] text-muted-foreground leading-[1.7] max-w-3xl">
            For research use only. Products are intended for in-vitro laboratory and
            research applications and are not intended to diagnose, treat, cure, or
            prevent any disease. Not for human or veterinary consumption.
          </p>
        </footer>
      </article>
    </Layout>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-foreground/45">{label}</dt>
      <dd className="mt-1.5 text-ink tracking-[0.12em] tabular-nums normal-case">{value}</dd>
    </div>
  );
}

/**
 * Numbered editorial section. Use as a direct child of LegalDoc.
 */
export function DocSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="md:pt-2">
        <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
          § {number}
        </p>
        <h2 className="mt-2 font-display text-[20px] md:text-[22px] leading-[1.2] tracking-[-0.015em] text-ink">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-[15.5px] leading-[1.78] text-foreground/85 border-t border-border md:border-t-0 pt-5 md:pt-0">
        {children}
      </div>
    </>
  );
}

/**
 * Inline definition row — for tables of terms or specs inside a section.
 */
export function DocList({ items }: { items: [string, string][] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map(([k, v]) => (
        <li key={k} className="grid grid-cols-[140px_1fr] gap-4 py-3 text-[13.5px]">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55 self-center">
            {k}
          </span>
          <span className="text-ink">{v}</span>
        </li>
      ))}
    </ul>
  );
}