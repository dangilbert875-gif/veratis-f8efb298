import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories } from "@/data/products";
import heroVial from "@/assets/hero-vial.jpg";
import lab from "@/assets/lab.jpg";
import { FlaskConical, ShieldCheck, Truck, Lock, ArrowRight, Plus, Minus } from "lucide-react";
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
        <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-20 md:pb-28 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-6">
              Independently verified · Batch #PP-2426
            </p>
            <h1 className="text-5xl md:text-7xl text-ink leading-[1.02]">
              Research peptides,<br />
              measured to <em className="not-italic text-primary">parts-per-million</em>.
            </h1>
            <p className="mt-7 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Every batch is HPLC and mass-spec analyzed by an independent ISO 17025 lab. Certificates of analysis are published with each lot — never hidden, never recycled.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-ink text-background px-6 py-3.5 rounded-md text-sm font-medium hover:bg-ink/90 transition"
              >
                Shop Peptides <ArrowRight size={16} />
              </Link>
              <Link
                to="/lab-testing"
                className="inline-flex items-center gap-2 border border-border bg-background px-6 py-3.5 rounded-md text-sm font-medium hover:bg-mist transition"
              >
                View Lab Results
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 max-w-md gap-6 border-t border-border pt-8">
              {[
                ["99.4%", "Avg. purity"],
                ["ISO 17025", "Lab partner"],
                ["48 hr", "Order to ship"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="text-2xl text-ink font-display">{v}</dt>
                  <dd className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{k}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] bg-mist rounded-xl overflow-hidden border border-border">
              <img src={heroVial} alt="Pure Peptide vial" width={1536} height={1280} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-background border border-border rounded-lg p-4 shadow-sm hidden md:block max-w-[220px]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Lot certificate</p>
              <p className="mt-1 text-sm text-ink">BPC-157 · 5 mg</p>
              <p className="mt-2 text-xs text-muted-foreground">HPLC 99.4% · MS verified · Endotoxin &lt; 0.5 EU/mg</p>
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
