import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { categories } from "@/data/products";
import { useCatalog } from "@/lib/use-catalog";
import heroVial from "@/assets/hero-vial.jpg";
import { FlaskConical, ShieldCheck, Lock, ArrowRight, Microscope, PackageCheck, ClipboardCheck, Snowflake, BadgeCheck, Check, Archive, Bandage, Leaf, TrendingUp, Atom, Sun, Zap, Flame, Plus, Minus, Quote, Mail } from "lucide-react";
import { useState } from "react";
import { BatchVerify } from "@/components/site/BatchVerify";
import { LotTag, ArchiveIndexStrip } from "@/components/site/LotTag";
import { batches, labPartner } from "@/data/batches";
import { ArchiveActivity } from "@/components/site/ArchiveActivity";
import { WhyVeratis } from "@/components/site/WhyVeratis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VERATIS — Research-Grade Peptides, Third-Party Tested" },
      { name: "description", content: "Premium research peptides with verified purity, third-party COAs, and discreet fast shipping." },
      { property: "og:title", content: "VERATIS — Research-Grade Peptides, Third-Party Tested" },
      { property: "og:description", content: "Independently HPLC and mass-spec verified peptides. Public certificates of analysis for every lot." },
      { property: "og:url", content: "https://veratisbio.com" },
    ],
    links: [
      { rel: "canonical", href: "https://veratisbio.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "VERATIS",
          url: "https://veratisbio.com",
          description:
            "Research-grade peptides with independent ISO 17025 HPLC and mass-spec verification and public certificates of analysis.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VERATIS",
          url: "https://veratisbio.com",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const recentLots = batches.slice(0, 8).map((b) => b.lot);
  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);
  const { products } = useCatalog();
  const bpcProduct = products.find((p) => p.slug === "bpc-157-12mg");
  const bpcImage =
    bpcProduct?.image && !bpcProduct.image.endsWith("vial-master.jpg")
      ? bpcProduct.image
      : heroVial;

  // Featured product configuration — slug → badge / stock / tagline
  const featuredConfig: Record<string, { badge?: { label: string; tone?: "amber" | "gray" | "green" }; stockText?: string; stockTone?: "default" | "amber"; tagline?: string }> = {
    "bpc-157-12mg": {
      badge: { label: "Most ordered", tone: "amber" },
      stockText: "12 vials remaining",
      tagline: "Pentadecapeptide studied for tissue recovery and gastric protection.",
    },
    "tb-500-fragment-12mg": {
      badge: { label: "Popular", tone: "gray" },
      stockText: "18 vials remaining",
      tagline: "Thymosin Beta-4 fragment for soft tissue and muscle research.",
    },
    "ghk-cu-100mg": {
      badge: { label: "Best value", tone: "green" },
      stockText: "Low stock · 6 remaining",
      stockTone: "amber",
      tagline: "Copper tripeptide for skin and regenerative research.",
    },
    "mots-c-10mg": {
      stockText: "In stock",
      tagline: "Mitochondrial-derived peptide for metabolic research.",
    },
  };
  const featuredSlugs = ["bpc-157-12mg", "tb-500-fragment-12mg", "ghk-cu-100mg", "mots-c-10mg"];
  const featuredProducts = featuredSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean)
    .slice(0, 4) as typeof products;
  // Fallback if any are missing
  const featured = featuredProducts.length === 4 ? featuredProducts : products.slice(0, 4);

  // Icon map for category tiles
  const categoryIcons: Record<string, typeof Bandage> = {
    "Tissue Recovery": Bandage,
    "Regenerative": Leaf,
    "Growth Hormone": TrendingUp,
    "Hormonal": Atom,
    "Pigmentation": Sun,
    "Mitochondrial": Zap,
    "Metabolic": Flame,
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-8 md:pt-14 pb-16 md:pb-36 grid md:grid-cols-12 gap-12 md:gap-16 lg:gap-20 items-center">
          <div className="md:col-span-7">
            <LotTag lot="PP-2426" status="verified" linked />
            <h1 className="mt-6 md:mt-7 text-[2rem] sm:text-4xl md:text-[3.5rem] text-ink leading-[1.08] md:leading-[1.05] tracking-[-0.02em] text-left font-extrabold [text-wrap:balance]">
              Third-party tested,<br />
              research-grade peptides.
            </h1>
            <p className="mt-6 md:mt-8 max-w-xl text-[15px] sm:text-[1.0625rem] text-muted-foreground leading-[1.65] md:leading-[1.7]">
              Every batch undergoes independent HPLC and mass-spec analysis.
              Full certificates of analysis are published for every lot — signed, dated, public.
            </p>
            <div className="mt-8 md:mt-10 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 bg-ink text-background pl-6 pr-5 py-4 rounded-md text-[13px] font-medium tracking-wide hover:bg-ink/90 hover:-translate-y-px transition shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(15,23,42,0.35)]"
              >
                Shop peptides
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/coa-archive"
                className="group inline-flex items-center gap-2 border border-ink/30 bg-transparent px-6 py-4 rounded-md text-[13px] font-medium tracking-wide text-ink hover:border-ink/60 hover:bg-ink/[0.03] transition"
              >
                <ShieldCheck size={15} className="text-primary" strokeWidth={2} />
                View COA archive
              </Link>
            </div>
            <Link
              to="/verification"
              className="mt-4 inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.18em] text-foreground/70 hover:text-ink transition"
            >
              How we verify every lot <ArrowRight size={12} />
            </Link>
            <p className="mt-4 text-[12.5px] text-muted-foreground tabular-nums">
              From $25 per vial <span className="text-foreground/30 mx-1">·</span> Free shipping over $150
            </p>
            <ul className="mt-7 md:mt-8 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-[11.5px] sm:text-[12px] text-muted-foreground">
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
            <dl className="mt-10 md:mt-14 grid grid-cols-3 gap-0 max-w-lg divide-x divide-border border-t border-border pt-6 md:pt-8">
              {[
                ["99.4%", "Average HPLC purity"],
                ["ISO 17025", "Certified testing"],
                ["48 hrs", "Ships within"],
              ].map(([v, k], i) => (
                <div key={k} className={i === 0 ? "pr-2 sm:pr-6" : "px-2 sm:px-6"}>
                  <dt className="text-[0.95rem] sm:text-[1.5rem] md:text-[1.75rem] text-ink font-display leading-tight tabular-nums whitespace-nowrap [text-wrap:balance]">{v}</dt>
                  <dd className="text-[9px] sm:text-[10.5px] md:text-[11px] text-muted-foreground mt-2 sm:mt-2.5 uppercase tracking-[0.12em] sm:tracking-[0.16em] leading-snug">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] bg-mist rounded-2xl overflow-hidden border border-border shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
              <img src={bpcImage} alt="VERATIS BPC-157 12 mg lyophilized vial, Lot PP-2426" width={1024} height={1280} className="w-full h-full object-cover" />
            </div>
            {/* Lot certificate card */}
            <div className="absolute -bottom-8 -left-6 md:-left-10 bg-background border border-border rounded-xl p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] hidden md:block w-[290px]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Certificate of analysis</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                  <BadgeCheck size={12} strokeWidth={2} /> Lab verified
                </span>
              </div>
              <p className="mt-2.5 font-display text-[15px] text-ink leading-tight">BPC-157 · 12 mg lyophilized</p>
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
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="flex items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Featured</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight leading-tight [text-wrap:balance]">Best-selling peptides</h2>
          </div>
          <Link to="/shop" className="text-[12px] sm:text-sm text-foreground/70 hover:text-foreground inline-flex items-center gap-1 whitespace-nowrap pb-1">
            Shop all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-x-6 sm:gap-x-6 gap-y-14 sm:gap-y-12">
          {featured.map((p) => {
            const cfg = featuredConfig[p.slug] ?? {};
            return (
              <ProductCard
                key={p.slug}
                p={p}
                badge={cfg.badge}
                stockText={cfg.stockText}
                stockTone={cfg.stockTone}
                tagline={cfg.tagline}
              />
            );
          })}
        </div>
      </section>

      <ArchiveActivity />

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
              <span className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-foreground/65">{step}</span>
              <Icon size={22} className="text-ink/80 mt-4" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Testimonials — trusted by researchers */}
      <section className="border-y border-border bg-mist/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Field response</p>
            <h2 className="text-3xl md:text-4xl text-ink tracking-tight">Trusted by researchers.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              What independent investigators say about our archive.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "The archive is the first peptide vendor system I've seen that I'd actually trust enough to cite in methodology.",
                attr: "Postdoctoral researcher, biomedical engineering",
              },
              {
                quote: "Verification under one second. Lot match every time. This is how every vendor should operate.",
                attr: "Independent compound chemist",
              },
              {
                quote: "Switched from three other suppliers. The COA workflow alone saves me hours per month.",
                attr: "Lab director, contract research organization",
              },
            ].map((t, i) => (
              <figure key={i} className="bg-background border border-border rounded-[3px] p-7 flex flex-col">
                <Quote size={18} className="text-primary/70 mb-4" strokeWidth={1.5} />
                <blockquote className="text-[15px] text-ink/90 leading-[1.65] italic font-display tracking-[-0.005em] [text-wrap:balance] flex-1">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-border/70 text-[11px] font-mono uppercase tracking-[0.16em] text-foreground/55">
                  — {t.attr}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-[11px] text-muted-foreground italic">
            Testimonials from verified purchasers. Identifying information withheld on request.
          </p>
        </div>
      </section>

      {/* COA Preview */}
      <section className="border-y border-border bg-ink text-background">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-36 grid md:grid-cols-12 gap-10 md:gap-12 lg:gap-20 items-start">
          <div className="md:col-span-5 md:pr-4">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-primary mb-4">— Signature system</p>
            <h2 className="text-[1.75rem] sm:text-3xl md:text-[2.5rem] text-background leading-[1.12] md:leading-[1.1] tracking-[-0.02em] [text-wrap:balance]">
              Authenticate any vial, in under five seconds.
            </h2>
            <p className="mt-5 md:mt-6 text-[14px] sm:text-[15px] text-background/70 leading-[1.7] md:leading-[1.75] max-w-md">
              Enter the lot printed on the label. The archive returns the original certificate — purity, identity, endotoxin — signed by an independent laboratory at the moment of release.
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
            <div className="mt-10 pt-6 border-t border-background/10 grid grid-cols-3 gap-x-3 sm:gap-x-4 text-[9.5px] sm:text-[10.5px] font-mono uppercase tracking-[0.14em] sm:tracking-[0.16em] text-background/40">
              <div>
                <p className="text-background tabular-nums text-[17px] sm:text-[20px] font-display tracking-tight leading-none">{batches.length}</p>
                <p className="mt-1">Lots archived</p>
              </div>
              <div>
                <p className="text-background tabular-nums text-[17px] sm:text-[20px] font-display tracking-tight leading-none">{avgPurity}%</p>
                <p className="mt-1">Mean purity</p>
              </div>
              <div>
                <p className="text-background tabular-nums text-[17px] sm:text-[20px] font-display tracking-tight leading-none">100%</p>
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
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Research areas</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight leading-tight">By research category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((c) => {
            const Icon = categoryIcons[c.name] ?? FlaskConical;
            return (
              <Link
                key={c.slug}
                to="/shop"
                className="group relative bg-background border border-border rounded-[3px] p-5 sm:p-8 min-h-[150px] sm:min-h-[190px] flex flex-col hover:border-ink/50 hover:shadow-[0_8px_24px_-16px_rgba(15,23,42,0.2)] transition"
              >
                <Icon size={26} className="text-ink/75 mb-4" strokeWidth={1.25} />
                <h3 className="font-display text-[1.0625rem] sm:text-[1.375rem] text-ink leading-[1.15] tracking-tight [text-wrap:balance] hyphens-auto break-words">
                  {c.name}
                </h3>
                <p className="mt-auto pt-4 text-[9.5px] sm:text-[10.5px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-foreground/55 tabular-nums">
                  {String(c.count).padStart(2, "0")} compounds
                </p>
                <ArrowRight size={14} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-foreground/35 group-hover:text-ink group-hover:translate-x-0.5 transition" />
              </Link>
            );
          })}
        </div>
      </section>

      <WhyVeratis />

      {/* Operational metrics — replaces testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-20">
          <div className="md:col-span-5">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Operational record</p>
            <h2 className="text-[1.75rem] sm:text-3xl md:text-[2.5rem] text-ink leading-[1.12] md:leading-[1.1] tracking-[-0.02em] [text-wrap:balance]">
              Measured in lots, not in slogans.
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
                    "py-5 sm:py-7 px-1 min-w-0",
                    i % 2 === 0 ? "pr-3 sm:pr-6 border-r border-border" : "pl-3 sm:pl-6",
                    i >= 2 ? "border-t border-border" : "",
                  ].join(" ")}
                >
                  <dt className="font-display text-[1.125rem] sm:text-[1.5rem] md:text-[2rem] text-ink leading-tight tabular-nums tracking-[-0.01em] [text-wrap:balance]">{v}</dt>
                  <dd className="mt-2 sm:mt-3 text-[9.5px] sm:text-[10.5px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-foreground/55 leading-snug">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Email capture */}
      <EmailCapture />

    </Layout>
  );
}

function FAQSection() {
  const items = [
    {
      q: "Are your peptides legal to purchase?",
      a: "Yes — for laboratory and research use only. All products ship with a \"Research Use Only\" designation and are not intended for human or veterinary consumption. By purchasing, you confirm you are a qualified researcher.",
    },
    {
      q: "How fast do orders ship?",
      a: "Median dispatch is 48 hours. Vials are sealed under nitrogen, vacuum-stoppered, and packed with insulated cold packs. Domestic delivery typically arrives within 3–5 business days.",
    },
    {
      q: "What happens if my lot fails verification?",
      a: "It won't — every lot is independently assayed before release and rejected if any specification fails. In the unlikely event of a discrepancy, we issue a full refund or replacement immediately.",
    },
    {
      q: "How do I verify my vial's certificate?",
      a: "Enter the lot number printed on the vial or outer carton into our verification tool. The archive returns the original COA in under one second — purity, identity, endotoxin, signed and dated.",
    },
    {
      q: "What payment methods do you accept?",
      a: "All major credit cards via encrypted checkout. For cryptocurrency or bulk research orders, contact us directly.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-y border-border bg-mist/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-4">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— FAQ</p>
          <h2 className="text-3xl md:text-4xl text-ink tracking-tight leading-[1.1]">Common questions.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-xs">
            If you don't see your question, <Link to="/contact" className="text-ink underline underline-offset-4 hover:text-primary">contact us</Link>.
          </p>
        </div>
        <div className="md:col-span-8">
          <ul className="border-t border-border">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={i} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full min-h-[64px] py-5 flex items-center justify-between gap-6 text-left group"
                  >
                    <span className="font-display text-[1.0625rem] sm:text-[1.125rem] text-ink tracking-tight leading-snug">
                      {item.q}
                    </span>
                    <span className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full border border-border text-ink/60 group-hover:border-ink/40 group-hover:text-ink transition">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="pb-6 pr-12 text-[14.5px] text-muted-foreground leading-[1.75]">
                      {item.a}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <section className="bg-ink text-background">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="md:col-span-6">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-primary mb-4">— Lot release notifications</p>
          <h2 className="font-display text-[1.875rem] sm:text-3xl md:text-[2.25rem] text-background leading-[1.12] tracking-[-0.02em] [text-wrap:balance]">
            Notified when new lots release.
          </h2>
          <p className="mt-5 text-[14.5px] text-background/65 leading-[1.75] max-w-md">
            Approximately one email per month. New lot announcements, archive updates, and standards publications. No marketing.
          </p>
        </div>
        <div className="md:col-span-6 md:pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setSubmitted(true);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-background/40" strokeWidth={1.5} />
              <input
                aria-label="Email address for newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@lab.edu"
                className="w-full h-12 pl-11 pr-4 rounded-[3px] bg-background/[0.06] border border-background/20 text-background placeholder:text-background/35 text-[14px] focus:outline-none focus:border-primary/70 focus:bg-background/[0.08] transition"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center h-12 px-6 rounded-[3px] bg-primary text-primary-foreground text-[12.5px] font-medium tracking-wide hover:bg-primary/90 active:scale-[0.99] transition whitespace-nowrap"
            >
              {submitted ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
          <p className="mt-3 text-[11.5px] text-background/45">
            We never share your email. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
