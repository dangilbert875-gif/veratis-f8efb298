import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { labPartner } from "@/data/batches";
import { FlaskConical, Microscope, ShieldCheck, Snowflake, ClipboardCheck, Archive, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/standards")({
  head: () => ({
    meta: [
      { title: "Testing Standards — VERATIS" },
      { name: "description", content: "Our analytical methods, storage protocols, and batch-archival process. HPLC, ESI-MS, endotoxin, cold-chain — documented end to end." },
      { property: "og:title", content: "Testing Standards — VERATIS" },
      { property: "og:description", content: "Our analytical methods, storage protocols, and batch-archival process — documented end to end." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Standards"
        title="The methodology behind every vial."
        lead="The same spec sheet, batch after batch. This page is the long version of what every lot must clear before it ever reaches a customer."
      />

      {/* Spec table */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Release specifications</p>
        <h2 className="text-2xl md:text-3xl text-ink mb-8">Published limits, every lot.</h2>
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_1.4fr] text-[11px] uppercase tracking-[0.18em] text-muted-foreground bg-mist px-5 py-3 border-b border-border">
            <span>Attribute</span><span>Limit</span><span>Method</span>
          </div>
          {[
            ["Identity",        "Match reference",  "ESI mass spectrometry"],
            ["Purity",          "≥ 98.0%",          "RP-HPLC, 214 nm"],
            ["Related substances", "≤ 1.0% (single)", "RP-HPLC peak integration"],
            ["Water content",   "≤ 5.0%",           "Karl Fischer titration"],
            ["Endotoxin",       "≤ 1.0 EU/mg",      "LAL chromogenic, USP <85>"],
            ["Appearance",      "White lyophilized cake / free of particulates", "Visual inspection"],
            ["Residual solvents", "Within ICH Q3C limits", "GC headspace"],
          ].map(([attr, lim, method]) => (
            <div key={attr} className="grid grid-cols-[1.2fr_1fr_1.4fr] items-center px-5 py-3.5 text-sm border-b border-border last:border-0">
              <span className="text-ink">{attr}</span>
              <span className="text-ink tabular-nums">{lim}</span>
              <span className="text-muted-foreground">{method}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Independent verification performed by {labPartner.name} · {labPartner.iso} · {labPartner.accreditation}.
        </p>
      </section>

      {/* Pipeline / timeline */}
      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">From synthesis to archive</p>
          <h2 className="text-2xl md:text-3xl text-ink mb-12 max-w-2xl">Each lot follows the same eight-step pipeline.</h2>
          <ol className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { icon: FlaskConical, n: "01", t: "Synthesis", d: "Solid-phase peptide synthesis in a cGMP-compliant facility. Each cleavage cycle is logged against the master batch record." },
              { icon: Microscope,    n: "02", t: "In-process MS", d: "Crude product is analysed by ESI-MS for sequence confirmation before purification proceeds." },
              { icon: FlaskConical, n: "03", t: "Purification", d: "Preparative RP-HPLC, with fraction collection gated on UV absorbance and mass profile." },
              { icon: Snowflake,     n: "04", t: "Lyophilization", d: "Material is frozen below −40 °C and dried under vacuum to ≤ 5% residual moisture." },
              { icon: ShieldCheck,   n: "05", t: "Fill & seal", d: "Vials are filled under HEPA-filtered laminar flow, stoppered, and crimped under inert nitrogen." },
              { icon: ClipboardCheck, n: "06", t: "Independent assay", d: `Sealed vials are couriered blind to ${labPartner.name} for HPLC, MS, endotoxin, and Karl Fischer.` },
              { icon: ShieldCheck,   n: "07", t: "Release review", d: "Two analysts must independently sign the COA against the published spec before any lot is released." },
              { icon: Archive,       n: "08", t: "Permanent archive", d: "Each COA is published to the public archive at the time of release. Records are never overwritten." },
            ].map(({ icon: Icon, n, t, d }) => (
              <li key={n} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border border-border bg-background grid place-items-center">
                    <Icon size={16} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="mt-2 text-[10px] tabular-nums tracking-[0.2em] text-muted-foreground">{n}</span>
                </div>
                <div className="pt-0.5">
                  <h3 className="text-lg text-ink">{t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Storage / cold chain */}
      <section className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Storage & cold chain</p>
          <h2 className="text-2xl md:text-3xl text-ink">Stable from our freezer to your bench.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Lyophilized vials are held at −20 °C in our facility, then shipped in vacuum-insulated mailers with phase-change cold packs sized to the destination transit window. Stability is documented at 30, 60, and 90 days under ambient excursion.
          </p>
        </div>
        <ul className="space-y-4 text-sm border-l border-border pl-6">
          {[
            ["Long-term storage", "Lyophilized, −20 °C, sealed under nitrogen"],
            ["In-transit", "Insulated mailer, phase-change cold pack"],
            ["Reconstituted", "Bacteriostatic water, 2–8 °C, 28-day stability"],
            ["Excursion tested", "30 / 60 / 90 days at 25 °C ambient"],
          ].map(([k, v]) => (
            <li key={k}>
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink/80">{k}</p>
              <p className="mt-1 text-muted-foreground">{v}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-ink text-background">
        <div className="mx-auto max-w-5xl px-6 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl text-background">Verify a lot now.</h2>
            <p className="mt-2 text-background/70 text-sm">Enter any lot number printed on your vial.</p>
          </div>
          <Link to="/verify" className="inline-flex items-center gap-2 bg-background text-ink px-6 py-3.5 rounded-md text-sm font-medium hover:bg-background/90 transition self-start md:self-auto">
            Open verification tool <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
