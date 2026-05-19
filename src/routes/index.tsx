import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/data/products";
import heroVial from "@/assets/hero-vial.jpg";
import lab from "@/assets/lab.jpg";
import { FlaskConical, ShieldCheck, Truck, Lock, ArrowRight, Plus, Minus, FileText, Microscope, PackageCheck, ClipboardCheck, Snowflake, BadgeCheck, Check, Archive } from "lucide-react";
import { BatchVerify } from "@/components/site/BatchVerify";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pure Peptide — Research-Grade Peptides, Third-Party Tested" },
      { name: "description", content: "Premium research peptides with verified purity, third-party COAs, and discreet fast shipping." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28 pb-24 md:pb-36 grid md:grid-cols-12 gap-16 lg:gap-20 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Independently verified · Lot PP-2426
            </div>
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
                  <Icon size={13} className="text-primary" strokeWidth={1.75} />
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
              <img src={heroVial} alt="Pure Peptide BPC-157 lyophilized vial, Lot PP-2426" width={1024} height={1280} className="w-full h-full object-cover" />
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
        <div className="border-y border-border bg-mist/50">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Featured in</span>
            <span>Journal of Peptide Science</span>
            <span>Lab Insights</span>
            <span>Bench Quarterly</span>
            <span>Research Monthly</span>
          </div>
        </div>
      </section>

      {/* Why Pure Peptide Exists — brand philosophy */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Why Pure Peptide exists</p>
            <h2 className="text-3xl md:text-[2.5rem] text-ink leading-[1.1] tracking-[-0.02em]">
              The industry's quietest standard.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[1.0625rem] text-foreground/80 leading-[1.75]">
              Most peptide suppliers recycle a single certificate across dozens of lots, redact the laboratory name, or publish nothing at all. We were chemists before we were a company, and we found that unacceptable.
            </p>
            <p className="mt-5 text-[1.0625rem] text-foreground/80 leading-[1.75]">
              Pure Peptide exists to operate on the opposite premise — that the document a researcher receives must correspond, exactly, to the vial in their hand. Every lot. Every time. Verifiable by anyone.
            </p>
            <ul className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                ["Public batch documentation", "Every lot's COA is posted to the archive at the moment of release."],
                ["Independent verification", "Sealed vials are couriered blind to an ISO 17025 accredited laboratory."],
                ["Documented purity standards", "≥ 98% purity, < 1.0 EU/mg endotoxin — published, not implied."],
                ["Never recycled, never redacted", "Each certificate is signed, dated, and tied to a single production lot."],
              ].map(([k, v]) => (
                <li key={k} className="border-l-2 border-primary/70 pl-4">
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
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Featured</p>
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

      {/* Why */}
      <section className="border-y border-border bg-mist/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Why Pure Peptide</p>
          <h2 className="text-3xl md:text-4xl text-ink max-w-2xl">A standard, not a marketing line.</h2>
          <div className="grid md:grid-cols-4 gap-px bg-border mt-12 rounded-lg overflow-hidden border border-border">
            {[
              { icon: FlaskConical, title: "Third-party tested", text: "ISO 17025 accredited laboratory, every batch." },
              { icon: ShieldCheck, title: "Verified purity", text: "HPLC + mass spec. Average 99%+ across catalog." },
              { icon: Truck, title: "Cold-chain shipping", text: "Insulated, tracked, dispatched within 48 hours." },
              { icon: Lock, title: "Secure checkout", text: "Encrypted payments, discreet packaging, no markers." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background p-8">
                <Icon size={22} className="text-primary" strokeWidth={1.5} />
                <h3 className="mt-5 text-lg text-ink">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Testing Process */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Our testing process</p>
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
              <span className="text-xs tabular-nums tracking-[0.2em] text-muted-foreground">{step}</span>
              <Icon size={22} className="text-primary mt-4" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* COA Preview */}
      <section className="border-y border-border bg-ink text-background">
        <div className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Signature feature</p>
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
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/coa-archive" className="inline-flex items-center gap-2 border border-background/25 text-background px-5 py-3 rounded-md text-[13px] font-medium hover:bg-background/5 transition">
                <Archive size={14} /> Browse full archive
              </Link>
              <Link to="/standards" className="inline-flex items-center gap-2 text-background/80 hover:text-background px-2 py-3 text-[13px] font-medium transition">
                Testing standards <ArrowRight size={13} />
              </Link>
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
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Browse</p>
            <h2 className="text-3xl md:text-4xl text-ink">Shop by category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              className="group relative bg-mist border border-border rounded-lg p-8 hover:border-primary/60 transition"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{c.count} products</p>
              <h3 className="mt-2 text-2xl text-ink">{c.name}</h3>
              <ArrowRight size={18} className="absolute bottom-6 right-6 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>
      </section>

      {/* Educational */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div className="aspect-[5/4] rounded-xl overflow-hidden border border-border">
            <img src={lab} alt="Independent laboratory" loading="lazy" width={1536} height={1024} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Education</p>
            <h2 className="text-3xl md:text-4xl text-ink">From synthesis to your bench.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              We control three things obsessively: peptide identity, purity, and stability. Below is the short version of how we deliver that, every time.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                ["Quality", "Solid-phase peptide synthesis in cGMP facilities, sequence confirmed by mass spectrometry before any release."],
                ["Storage", "Lyophilized under nitrogen, kept at –20 °C, shipped insulated. Stability tested at 30, 60, and 90 days."],
                ["Testing", "Every lot is HPLC and MS verified by an independent ISO 17025 laboratory. COAs published per batch."],
              ].map(([k, v]) => (
                <li key={k} className="border-l-2 border-primary pl-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-ink/80">{k}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Reviews</p>
        <h2 className="text-3xl md:text-4xl text-ink max-w-2xl">Trusted by researchers and clinicians.</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { q: "The COAs match what I measure in-house. That's all I ask for in a supplier — and it's surprisingly rare.", a: "Dr. M. Reyes", r: "Research Chemist" },
            { q: "Packaging is impeccable. Cold packs still cold on day two. Lots arrive intact and identical batch-to-batch.", a: "L. Andersen", r: "Lab Manager" },
            { q: "Documentation is the difference. Pure Peptide ships paperwork I can actually file against my own audits.", a: "J. Park, PhD", r: "Biotech Research" },
          ].map((t) => (
            <figure key={t.a} className="border border-border rounded-lg p-7 bg-background">
              <div className="flex gap-1 text-primary mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <blockquote className="text-base text-ink leading-relaxed">"{t.q}"</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="text-ink">{t.a}</span>
                <span className="text-muted-foreground"> · {t.r}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3 text-center">FAQ</p>
          <h2 className="text-3xl md:text-4xl text-ink text-center">Common questions</h2>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base text-ink hover:no-underline py-5 [&>svg]:hidden group">
                  <span className="flex-1">{f.q}</span>
                  <Plus size={18} className="text-muted-foreground group-data-[state=open]:hidden" />
                  <Minus size={18} className="text-muted-foreground hidden group-data-[state=open]:block" />
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-10">
            <Link to="/faq" className="text-sm text-primary hover:underline">See all questions →</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

const faqs = [
  { q: "Are your peptides for human use?", a: "No. All products sold by Pure Peptide are intended strictly for in-vitro laboratory and research use." },
  { q: "How are products tested?", a: "Every batch is tested by an independent ISO 17025 accredited laboratory using HPLC and mass spectrometry. The COA is linked to the exact lot you receive." },
  { q: "How quickly do orders ship?", a: "Orders place before 2pm ET ship the same business day. Most orders are dispatched within 48 hours, with cold-pack insulation included automatically." },
  { q: "What is your return policy?", a: "Unopened vials may be returned within 14 days. If a lot fails our published specifications, we replace or refund — no questions asked." },
];
