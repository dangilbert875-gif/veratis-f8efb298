import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/lab-testing")({
  head: () => ({
    meta: [
      { title: "Lab Testing & COA — VERATIS" },
      { name: "description", content: "Every batch is HPLC and mass-spec verified by an independent ISO 17025 lab. Browse certificates of analysis." },
    ],
  }),
  component: Page,
});

const coas = [
  ["PP-2426", "BPC-157", "5 mg", "99.4%", "2026-04-12"],
  ["PP-2419", "TB-500", "5 mg", "99.1%", "2026-04-05"],
  ["PP-2411", "GHK-Cu", "50 mg", "99.6%", "2026-03-28"],
  ["PP-2403", "Epitalon", "10 mg", "99.2%", "2026-03-20"],
  ["PP-2398", "Ipamorelin", "5 mg", "99.5%", "2026-03-14"],
  ["PP-2391", "Semax", "30 mg", "99.0%", "2026-03-07"],
  ["PP-2384", "Selank", "10 mg", "99.3%", "2026-02-28"],
  ["PP-2377", "Melanotan II", "10 mg", "99.1%", "2026-02-21"],
];

function Page() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Lab testing"
        title="Open files. Every lot."
        lead="Each batch is independently tested by an ISO 17025 accredited laboratory. Browse the most recent certificates of analysis below."
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            ["HPLC", "High-performance liquid chromatography measures purity as a percentage of the total peak area."],
            ["Mass spec", "Mass spectrometry confirms the molecular weight and primary sequence of every lot."],
            ["Endotoxin", "Endotoxin levels are reported in EU/mg and tested against USP <85> specifications."],
          ].map(([k, v]) => (
            <div key={k} className="border border-border rounded-lg p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-primary">{k}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_1fr_auto] text-[11px] uppercase tracking-[0.18em] text-muted-foreground bg-mist px-5 py-3 border-b border-border">
            <span>Lot</span><span>Product</span><span>Size</span><span>Purity</span><span>Tested</span><span></span>
          </div>
          {coas.map((row) => (
            <div key={row[0]} className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_1fr_auto] items-center px-5 py-4 text-sm border-b border-border last:border-0 hover:bg-mist/50 transition">
              <span className="text-ink tabular-nums">{row[0]}</span>
              <span className="text-ink">{row[1]}</span>
              <span className="text-muted-foreground">{row[2]}</span>
              <span className="text-primary tabular-nums">{row[3]}</span>
              <span className="text-muted-foreground tabular-nums">{row[4]}</span>
              <button className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary border border-border px-3 py-1.5 rounded-md">
                <Download size={12} /> COA
              </button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground inline-flex items-center gap-2">
          <FileText size={12} /> All COAs are PDF documents issued by our independent laboratory partner.
        </p>
      </section>
    </Layout>
  );
}