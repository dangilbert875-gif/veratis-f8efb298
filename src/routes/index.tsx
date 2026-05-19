import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/data/products";
import heroVial from "@/assets/hero-vial.jpg";
import { FlaskConical, ShieldCheck, Lock, ArrowRight, Microscope, PackageCheck, ClipboardCheck, Snowflake, BadgeCheck, Check, Archive } from "lucide-react";
import { BatchVerify } from "@/components/site/BatchVerify";
import { LotTag, ArchiveIndexStrip } from "@/components/site/LotTag";
import { batches, labPartner } from "@/data/batches";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VERATIS — Research-Grade Peptides, Third-Party Tested" },
      { name: "description", content: "Premium research peptides with verified purity, third-party COAs, and discreet fast shipping." },
    ],
  }),
  component: Home,
});

function Home() {
  const recentLots = batches.slice(0, 8).map((b) => b.lot);
  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28 pb-24 md:pb-36 grid md:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="md:col-span-7">
            <LotTag lot="PP-2426" status="verified" linked />
            <h1 className="mt-7 text-5xl md:text-[5.25rem] text-ink leading-[1.02] tracking-[-0.02em]">
              Third-party tested<br />
              research peptides.
            </h1>
            <p className="mt-8 max-w-xl text-[1.0625rem] text-muted-foreground leading-[1.7]">
              Every batch undergoes independent HPLC and mass-spec analysis.
              Full certificates of analysis are published for every lot — signed, dated, public.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 bg-ink text-background pl-6 pr-5 py-4 rounded-md text-[13px] font-medium tracking-wide hover:bg-ink/90 hover:-translate-y-px transition shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(15,23,42,0.35)]"
              >
                Shop peptides
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/lab-testing"
                className="group inline-flex items-center gap-2 border border-border bg-background px-6 py-4 rounded-md text-[13px] font-medium tracking-wide text-ink hover:border-ink/30 hover:bg-mist transition"
              >
                <ShieldCheck size={15} className="text-primary" strokeWidth={2} />
                View lab results
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
              {[
                { icon: BadgeCheck, label: "ISO 17025 verified" },
                { icon: FlaskConical, label: "Batch-level COAs" },
                { icon: Snowflake, label: "Cold-chain shipping" },
                { icon: Lock, label: "Secure checkout" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Icon size={13} className="text-ink/70" strokeWidth={1.75} />
                  {label}
                </li>
              ))}
            </ul>
            <dl className="mt-14 grid grid-cols-3 max-w-lg divide-x divide-border border-t border-border pt-8">
              {[
                ["99.4%", "Average HPLC purity"],
                ["ISO 17025", "Certified testing"],
                ["48 hrs", "Ships within"],
              ].map(([v, k], i) => (
                <div key={k} className={i === 0 ? "pr-6" : "px-6"}>
                  <dt className="text-[1.75rem] text-ink font-display leading-none tabular-nums">{v}</dt>
                  <dd className="text-[11px] text-muted-foreground mt-2.5 uppercase tracking-[0.16em]">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] bg-mist rounded-2xl overflow-hidden border border-border shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
              <img src={heroVial} alt="VERATIS BPC-157 lyophilized vial, Lot PP-2426" width={1024} height={1280} className="w-full h-full object-cover" />
            </div>
            {/* Lot certificate card */}
            <div className="absolute -bottom-8 -left-6 md:-left-10 bg-background border border-border rounded-xl p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] hidden md:block w-[290px]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Certificate of analysis</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                  <BadgeCheck size={12} strokeWidth={2} /> Lab verified
                </span>
              </div>
              <p className="mt-2.5 font-display text-[15px] text-ink leading-tight">BPC-157 · 5 mg lyophilized</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">Lot PP-2426 · Tested 04 May 2026</p>
              <dl className="mt-4 space-y-2 text-[12px]">
                {[
                  ["Purity (HPLC)", "99.42%"],
                  ["Identity (MS)", "Confirmed"],
                  ["Endotoxin", "< 0.5 EU/mg"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-ink tabular-nums inline-flex items-center gap-1">
                      <Check size={11} className="text-primary" strokeWidth={2.5} />
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        <ArchiveIndexStrip lots={recentLots} />
      </section>

      {/* Why VERATIS Exists — brand philosophy */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Why VERATIS exists</p>
            <h2 className="text-3xl md:text-[2.5rem] text-ink leading-[1.1] tracking-[-0.02em]">
              The industry's quietest standard.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[1.0625rem] text-foreground/80 leading-[1.75]">
              Most peptide suppliers recycle a single certificate across dozens of lots, redact the laboratory name, or publish nothing at all. We were chemists before we were a company, and we found that unacceptable.
            </p>
            <p className="mt-5 text-[1.0625rem] text-foreground/80 leading-[1.75]">
              VERATIS exists to operate on the opposite premise — that the document a researcher receives must correspond, exactly, to the vial in their hand. Every lot. Every time. Verifiable by anyone.
            </p>
            <ul className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                ["Public batch documentation", "Every lot's COA is posted to the archive at the moment of release."],
                ["Independent verification", "Sealed vials are couriered blind to an ISO 17025 accredited laboratory."],
                ["Documented purity standards", "≥ 98% purity, < 1.0 EU/mg endotoxin — published, not implied."],
                ["Never recycled, never redacted", "Each certificate is signed, dated, and tied to a single production lot."],
              ].map(([k, v]) => (
                <li key={k} className="border-l border-ink/30 pl-4">
                  <p className="text-[13px] text-ink font-medium">{k}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Featured</p>
            <h2 className="text-3xl md:text-4xl text-ink">Best-selling peptides</h2>
          </div>
          <Link to="/shop" className="text-sm text-foreground/70 hover:text-foreground inline-flex items-center gap-1">
            Shop all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {products.slice(0, 4).map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* Our Testing Process */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Our testing process</p>
          <h2 className="text-3xl md:text-4xl text-ink">Four checkpoints. One verdict.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Every lot moves through the same sequence before it leaves our facility. If a single step fails specification, the batch is rejected — never blended, never released.
          </p>
        </div>
        <ol className="mt-14 grid md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          {[
            { icon: Microscope, step: "01", title: "Synthesis", text: "Solid-phase synthesis in a cGMP facility with sequence confirmation by mass spectrometry." },
            { icon: FlaskConical, step: "02", title: "Independent assay", text: "Each lot is shipped blind to an ISO 17025 accredited laboratory for HPLC and MS analysis." },
            { icon: ClipboardCheck, step: "03", title: "COA review", text: "Identity, purity, and endotoxin limits are reviewed against published specs before release." },
            { icon: PackageCheck, step: "04", title: "Cold-chain pack", text: "Vials are sealed under nitrogen, vacuum-stoppered, and dispatched with insulated cold packs." },
          ].map(({ icon: Icon, step, title, text }) => (
            <li key={step} className="bg-background p-8 relative">
              <span className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-foreground/45">{step}</span>
              <Icon size={22} className="text-ink/80 mt-4" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* COA Preview */}
      <section className="border-y border-border bg-ink text-background">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-36 grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="md:col-span-5 md:pr-4">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-primary mb-4">— Signature system</p>
            <h2 className="text-3xl md:text-[2.5rem] text-background leading-[1.1] tracking-[-0.02em]">
              Authenticate any vial,<br />in under five seconds.
            </h2>
            <p className="mt-6 text-background/70 leading-[1.75] max-w-md">
              Enter the lot printed on the label. The archive returns the original certificate — purity, identity, endotoxin, water content — signed by an independent laboratory at the moment of release.
            </p>
            <ul className="mt-8 space-y-3.5 text-[13px] text-background/80">
              {[
                "Live query against our laboratory archive",
                "Permanent record — never recycled between batches",
                "Same lookup that powers our outer carton QR codes",
              ].map((t) => (
                <li key={t} className="inline-flex items-start gap-2.5">
                  <Check size={14} className="text-primary mt-0.5 shrink-0" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Link to="/coa-archive" className="inline-flex items-center gap-2 border border-background/25 text-background px-5 py-3 rounded-md text-[13px] font-medium hover:bg-background/5 transition">
                <Archive size={14} /> Browse full archive <ArrowRight size={13} />
              </Link>
            </div>
            <div className="mt-10 pt-6 border-t border-background/10 grid grid-cols-3 gap-x-4 text-[10.5px] font-mono uppercase tracking-[0.16em] text-background/40">
              <div>
                <p className="text-background tabular-nums text-[20px] font-display tracking-tight">{batches.length}</p>
                <p className="mt-1">Lots archived</p>
              </div>
              <div>
                <p className="text-background tabular-nums text-[20px] font-display tracking-tight">{avgPurity}%</p>
                <p className="mt-1">Mean purity</p>
              </div>
              <div>
                <p className="text-background tabular-nums text-[20px] font-display tracking-tight">100%</p>
                <p className="mt-1">YTD pass rate</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <BatchVerify />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Research areas</p>
            <h2 className="text-3xl md:text-4xl text-ink">By research category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              className="group relative bg-mist border border-border rounded-lg p-8 hover:border-ink/40 transition"
            >
              <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55 tabular-nums">
                {String(c.count).padStart(2, "0")} compounds
              </p>
              <h3 className="mt-2 text-2xl text-ink">{c.name}</h3>
              <ArrowRight size={18} className="absolute bottom-6 right-6 text-foreground/40 group-hover:text-ink group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>
      </section>

      {/* Operational metrics — replaces testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20">
          <div className="md:col-span-5">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Operational record</p>
            <h2 className="text-3xl md:text-[2.5rem] text-ink leading-[1.1] tracking-[-0.02em]">
              Measured in lots,<br />not in slogans.
            </h2>
            <p className="mt-6 text-muted-foreground leading-[1.75] max-w-md">
              The clearest signal of a serious peptide operation is its archive. Below is ours — every figure derived from production data, independently assayed, publicly retrievable.
            </p>
            <Link to="/coa-archive" className="mt-7 inline-flex items-center gap-2 text-[13px] text-ink border border-border rounded-md px-5 py-3 hover:border-ink/40 transition">
              <Archive size={14} /> Browse the archive
            </Link>
          </div>
          <div className="md:col-span-7">
            <dl className="grid grid-cols-2 border-t border-border">
              {[
                [`${batches.length}`, "Lots on permanent record"],
                [`${avgPurity}%`, "Mean HPLC purity, all lots"],
                ["100%", "Pass rate year-to-date"],
                ["≥ 98%", "Minimum release specification"],
                ["< 0.5 EU/mg", "Endotoxin ceiling"],
                ["48 hrs", "Median dispatch time"],
                [labPartner.iso, "Lab partner accreditation"],
                [labPartner.city, "Independent assay location"],
              ].map(([v, k], i) => (
                <div
                  key={k}
                  className={[
                    "py-7 px-1",
                    i % 2 === 0 ? "pr-6 border-r border-border" : "pl-6",
                    i >= 2 ? "border-t border-border" : "",
                  ].join(" ")}
                >
                  <dt className="font-display text-[1.75rem] md:text-[2rem] text-ink leading-none tabular-nums tracking-[-0.01em]">{v}</dt>
                  <dd className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

    </Layout>
  );
}
