import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { useCatalog } from "@/lib/use-catalog";
import { BatchVerify } from "@/components/site/BatchVerify";
import { batches, labPartner } from "@/data/batches";
import { ArrowRight, ArrowUpRight, ShieldCheck, Mail, Plus, Minus } from "lucide-react";

import heroArchive from "@/assets/hero-archive.jpg";
import pillarRecover from "@/assets/pillar-recover.jpg";
import pillarPerform from "@/assets/pillar-perform.jpg";
import pillarLongevity from "@/assets/pillar-longevity.jpg";
import pillarRegenerate from "@/assets/pillar-regenerate.jpg";
import travertineWall from "@/assets/travertine-wall.jpg";
import sysRestore from "@/assets/sys-restore.jpg";
import sysAscent from "@/assets/sys-ascent.jpg";
import sysVector from "@/assets/sys-vector.jpg";
import sysEclipse from "@/assets/sys-eclipse.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VERATIS. Precision Longevity. Performance. Recovery." },
      { name: "description", content: "Research-grade peptides for performance, recovery, and longevity. Backed by independent ISO 17025 verification and complete lot-level transparency." },
      { property: "og:title", content: "VERATIS. Precision Longevity" },
      { property: "og:description", content: "Research-grade peptides with independent testing and public, lot-level verification." },
      { property: "og:url", content: "https://veratisbio.com" },
      { property: "og:image", content: "https://veratisbio.com/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "VERATIS",
          url: "https://veratisbio.com",
          description:
            "Precision longevity. Research-grade peptides with independent ISO 17025 verification and public, lot-level certificates of analysis.",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useCatalog();
  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);

  const featuredSlugs = ["bpc-157-12mg", "tb-500-fragment-12mg", "ghk-cu-100mg", "mots-c-10mg"];
  const featuredProducts = featuredSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as typeof products;
  const featured = featuredProducts.length === 4 ? featuredProducts : products.slice(0, 4);


  return (
    <Layout>
      {/* SECTION 1 · HERO */}
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-end overflow-hidden bg-ink">
        <img
          src={heroArchive}
          alt="A single amber laboratory vial on a travertine plinth beside an architectural certificate archive at golden hour"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Left-weighted scrim for text legibility while preserving the right-side vial + archive */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/82 via-ink/45 to-ink/5" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/35 to-transparent" />

        <div className="relative mx-auto max-w-7xl w-full px-6 pb-16 md:pb-24 pt-28 sm:pt-32">
          <p className="eyebrow text-background/70">The Standard of Evidence</p>
          <h1 className="mt-6 font-display text-background text-[2.5rem] xs:text-[3rem] sm:text-6xl md:text-[5.5rem] lg:text-[6.25rem] leading-[1.02] sm:leading-[0.98] tracking-[-0.02em] font-light [text-wrap:balance] max-w-5xl">
            Every lot.<br />
            Every time.<br />
            <span className="italic text-background/90">Publicly verifiable.</span>
          </h1>
          <p className="mt-10 max-w-xl text-[15px] md:text-[17px] text-background/80 leading-[1.7] font-light">
            Every Veratis compound is independently tested, archived, and traceable
            to the vial in your hand.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-background text-ink pl-7 pr-6 py-[18px] rounded-full text-[12.5px] font-medium tracking-[0.14em] uppercase hover:bg-background/90 transition shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
            >
              Browse Compounds
              <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/verify"
              className="group inline-flex items-center gap-2.5 border border-background/40 text-background pl-6 pr-5 py-[17px] rounded-full text-[12.5px] font-medium tracking-[0.14em] uppercase hover:border-background hover:bg-background/5 transition backdrop-blur-sm"
            >
              <ShieldCheck size={14} strokeWidth={1.5} />
              Verify A Lot
            </Link>
          </div>

          {/* Single quiet trust line */}
          <div className="mt-14 md:mt-20 pt-6 border-t border-background/15">
            <p className="text-[10.5px] font-medium tracking-[0.28em] uppercase text-background/60">
              Independently Verified <span className="text-background/30 mx-2">•</span> ISO 17025 <span className="text-background/30 mx-2">•</span> Lot Archive
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 · THE VERATIS SYSTEM */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32 pb-10">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <p className="eyebrow">The Veratis System</p>
              <h2 className="mt-5 font-display text-4xl md:text-6xl text-ink leading-[1.02] tracking-[-0.02em] font-light [text-wrap:balance]">
                Eight identities,<br />one <span className="italic">standard of evidence</span>.
              </h2>
            </div>
            <div className="md:col-span-5 md:pl-8">
              <p className="text-[15px] text-muted-foreground leading-[1.8] font-light max-w-md">
                Eight protocol identities. One verification standard. Every compound
                belongs to a defined pathway, and every lot answers to the same
                evidence standard.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { title: "REPAIR",     compound: "BPC-157",     body: "Supports tissue, gut lining, ligament, and tendon recovery pathways.",       img: pillarRecover,    hex: "#3f4a2e", slug: "bpc-157-12mg" },
            { title: "RESTORE",    compound: "TB-500",      body: "Supports recovery pathways and soft-tissue repair.",                          img: sysRestore,       hex: "#2d5a5a", slug: "tb-500-fragment-12mg" },
            { title: "REGENERATE", compound: "GHK-Cu",      body: "Supports copper peptide, skin, hair, and connective tissue pathways.",       img: pillarRegenerate, hex: "#b87333", slug: "ghk-cu-50mg" },
            { title: "ASCENT",     compound: "Ipamorelin",  body: "Supports growth hormone secretagogue pathways.",                              img: sysAscent,        hex: "#1f2d4a", slug: "ipamorelin-10mg" },
            { title: "SHIFT",      compound: "Retatrutide", body: "Supports metabolic signaling and body composition pathways.",                 img: pillarPerform,    hex: "#9a6b4a", slug: "retatrutide-12mg" },
            { title: "VECTOR",     compound: "Tirzepatide", body: "Supports metabolic signaling and weight-management pathways.",                img: sysVector,        hex: "#6b6b3f", slug: "tirzepatide-10mg" },
            { title: "ECLIPSE",    compound: "Melanotan-2", body: "Supports melanocortin and pigmentation pathways.",                            img: sysEclipse,       hex: "#5a4a35", slug: "melanotan-2-10mg" },
            { title: "REJUVENATE", compound: "MOTS-C",      body: "Supports mitochondrial signaling and cellular energy pathways.",              img: pillarLongevity,  hex: "#3a5878", slug: "mots-c-10mg" },
          ].map((p) => (
            <Link
              key={p.title}
              to="/shop/$slug"
              params={{ slug: p.slug }}
              aria-label={`${p.title} — ${p.compound}`}
              style={{ ["--accent" as any]: p.hex }}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-sm bg-ink isolate ring-1 ring-inset ring-background/0 hover:ring-[color:var(--accent)]/40 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] transition-[box-shadow,ring-color] duration-700 ease-out"
            >
              <img
                src={p.img}
                alt={`${p.title}. ${p.compound}.`}
                width={1024}
                height={1365}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025]"
              />
              {/* Consistent, evenly weighted bottom gradient for legibility across every image */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/55 to-ink/10" />
              {/* Subtle protocol-color wash that intensifies on hover */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-soft-light pointer-events-none"
                style={{ background: `linear-gradient(to top, ${p.hex}55, transparent)` }}
              />
              <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-end text-background">
                {/* IDENTITY label */}
                <span className="inline-flex items-center gap-2 text-[9.5px] tracking-[0.32em] uppercase font-medium text-background/70">
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundColor: p.hex, boxShadow: `0 0 0 3px ${p.hex}22` }}
                  />
                  Identity
                </span>
                {/* PROTOCOL NAME — primary focus */}
                <h3 className="mt-3 font-display text-[2rem] md:text-[2.4rem] tracking-[0.02em] font-light leading-[0.95] text-background">
                  {p.title}
                </h3>
                {/* Compound name */}
                <p className="mt-3 font-display italic text-[1rem] md:text-[1.05rem] text-background/90 leading-none tracking-tight">
                  {p.compound}
                </p>
                {/* Accent divider */}
                <div
                  className="mt-4 h-px w-8 group-hover:w-14 transition-all duration-700 ease-out"
                  style={{ backgroundColor: p.hex, opacity: 0.85 }}
                />
                {/* Description */}
                <p className="mt-4 text-[12.5px] text-background/75 leading-[1.6] font-light">
                  {p.body}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3 · WHY VERATIS */}
      <section className="relative bg-mist">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
          <div className="max-w-4xl">
            <p className="eyebrow">Why Veratis</p>
            <h2 className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl text-ink leading-[1.02] tracking-[-0.025em] font-light [text-wrap:balance]">
              Don't trust us.<br />
              <span className="italic text-primary/85">Verify for yourself.</span>
            </h2>
            <p className="mt-8 max-w-xl text-[16px] text-muted-foreground leading-[1.8] font-light">
              Most suppliers ask you to take their word for it. Veratis was built
              around the opposite standard. Every lot is independently tested,
              publicly archived, and traceable to the vial in hand.
            </p>
          </div>

          <div className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-5 gap-px bg-border border border-border rounded-sm overflow-hidden">
            {[
              { k: "Independent COAs", v: "Every lot, signed and dated by a third-party laboratory." },
              { k: "Public Archive", v: "Permanent, append-only record. Never overwritten." },
              { k: "Lot-Level Traceability", v: "From synthesis through assay to your vial." },
              { k: "QR Verification", v: "Scan the carton seal. Retrieve the original in under a second." },
              { k: "ISO 17025 Testing", v: `Assayed by ${labPartner.name}, ${labPartner.iso}.` },
            ].map(({ k, v }) => (
              <div key={k} className="bg-background p-7 md:p-8 flex flex-col">
                <p className="font-display text-[1.05rem] md:text-[1.15rem] text-ink leading-snug tracking-tight">{k}</p>
                <p className="mt-3 text-[12.5px] text-muted-foreground leading-[1.7] font-light flex-1">{v}</p>
                <div className="mt-5 h-px w-6 bg-primary/60" />
              </div>
            ))}
          </div>

          {/* Quiet metric ribbon */}
          <dl className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 border-t border-border pt-10">
            {[
              [`${batches.length}`, "Lots on permanent record"],
              [`${avgPurity}%`, "Mean HPLC purity"],
              ["100%", "Pass rate, year-to-date"],
              ["< 0.5 EU/mg", "Endotoxin ceiling"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-display text-[1.75rem] md:text-[2.5rem] text-ink leading-none tabular-nums tracking-[-0.01em] font-light">{v}</dt>
                <dd className="mt-3 eyebrow">{k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* SECTION 4 · FEATURED PRODUCTS */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="eyebrow">The Library</p>
              <h2 className="mt-5 font-display text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.04] tracking-[-0.02em] font-light [text-wrap:balance]">
                Each compound, <span className="italic">independently verified.</span>
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink border-b border-ink/30 hover:border-ink pb-2 transition self-start md:self-end"
            >
              View the full library <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {featured.map((p) => (
              <ProductCard key={p.slug} p={p} showQuantity showViewCoa stockState="in_stock" />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 · LOT VERIFICATION */}
      <section
        className="relative bg-ink text-background overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(28,22,18,0.92), rgba(28,22,18,0.96)), url(${travertineWall})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36 grid lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow !text-primary/80">Chain of Verification</p>
            <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-[3.75rem] leading-[1.04] tracking-[-0.02em] font-light text-background [text-wrap:balance]">
              The vial in your hand,<br />
              <span className="italic text-background/85">the document on the wall.</span>
            </h2>
            <p className="mt-8 text-[15px] text-background/70 leading-[1.8] font-light max-w-md">
              Enter the lot printed on the label. The archive returns the original
              certificate (purity, identity, endotoxin) signed by an independent
              laboratory at the moment of release.
            </p>

            <ol className="mt-12 space-y-6 max-w-md">
              {[
                ["Lot number", "Stamped on every vial and tamper seal."],
                ["QR code", "Scan the carton. Resolves to the archive."],
                ["Certificate", "Original PDF, signed by the assaying lab."],
                ["Chain of custody", "Synthesis, courier, ISO 17025, release."],
              ].map(([k, v], i) => (
                <li key={k} className="grid grid-cols-[auto_1fr] gap-5 items-start">
                  <span className="font-display tabular-nums text-[1.5rem] text-primary/70 leading-none font-light">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] tracking-[0.18em] uppercase text-background">{k}</p>
                    <p className="mt-2 text-[13.5px] text-background/60 leading-[1.65] font-light">{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-7">
            <BatchVerify />
            <p className="mt-5 eyebrow !text-background/45">
              Live query · permanent archive · 0.8s median
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6 · THE STANDARD */}
      <section className="travertine-surface relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <img
            src={travertineWall}
            alt=""
            aria-hidden
            width={1920}
            height={1024}
            loading="lazy"
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-32 md:py-48 text-center">
          <p className="eyebrow">The Standard</p>
          <h2 className="mt-10 font-display text-[3rem] sm:text-6xl md:text-8xl text-ink leading-[0.98] tracking-[-0.025em] font-light">
            Every lot.<br />
            Every time.<br />
            <span className="italic text-primary">Publicly verifiable.</span>
          </h2>

          <div className="mx-auto mt-10 h-px w-24 bg-ink/30" />

          <p className="mt-10 max-w-2xl mx-auto text-[16px] md:text-[17px] text-foreground/75 leading-[1.85] font-light">
            Every Veratis compound is independently tested, archived, and traceable
            to the vial in your hand. Scan the lot. View the certificate. Verify it
            yourself.
          </p>

          <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 bg-ink text-background pl-7 pr-6 py-[18px] rounded-full text-[12.5px] font-medium tracking-[0.14em] uppercase hover:bg-ink/90 transition"
            >
              Browse Compounds <ArrowRight size={14} />
            </Link>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.16em] uppercase text-ink border-b border-ink/30 hover:border-ink pb-2 transition"
            >
              Verify A Lot
            </Link>
          </div>

          {/* Refined signature mark */}
          <div className="mt-20 flex flex-col items-center gap-3 text-foreground/45">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M19 5 L5 19" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <p className="eyebrow !text-foreground/45">VERATIS · Precision Longevity</p>
          </div>
        </div>
      </section>

      {/* FAQ (preserved) */}
      <FAQSection />

      {/* Email capture (preserved, restyled to warm palette) */}
      <EmailCapture />
    </Layout>
  );
}

function FAQSection() {
  const items = [
    { q: "What is a COA?", a: "A Certificate of Analysis (COA) is a formal document issued by an independent, accredited laboratory that details the test results for a specific lot. It confirms identity, purity, endotoxin levels, and other analytical data measured at the time of release. Every Veratis lot receives its own COA, which is permanently archived and retrievable by the customer who holds that lot number." },
    { q: "Are your peptides legal to purchase?", a: "Yes. Products are sold for laboratory and research use only. They are not intended for human or veterinary consumption." },
    { q: "How fast do orders ship?", a: "Median dispatch is 48 hours. Vials are sealed under nitrogen, vacuum-stoppered, and packed with insulated cold packs." },
    { q: "What happens if my lot fails verification?", a: "Any lot that fails to meet Veratis quality standards is rejected and never released for sale. Only lots that successfully pass identity, purity, and applicable quality testing are made available. If you receive a Veratis product, that lot has already passed our release standards." },
    { q: "How do I verify my vial's certificate?", a: "Enter the lot number printed on your vial or carton into the verification archive. The archive returns the original certificate associated with that specific lot. Researchers may also use the lot information to obtain the corresponding report directly from our independent laboratory partner." },
    { q: "What payment methods do you accept?", a: "We currently accept Bitcoin (BTC), USDC, and USDT. Additional payment options may be added in the future as we continue expanding our payment infrastructure. Current accepted methods are always displayed during checkout." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-mist/50 border-y border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-12 gap-12 md:gap-20">
        <div className="md:col-span-4">
          <p className="eyebrow">Common questions</p>
          <h2 className="mt-5 font-display text-4xl md:text-5xl text-ink leading-[1.05] tracking-[-0.02em] font-light">Quietly answered.</h2>
          <p className="mt-6 text-muted-foreground leading-[1.8] font-light max-w-xs">
            If you don't see your question, <Link to="/contact" className="text-ink underline underline-offset-4 hover:text-primary">write to us</Link>.
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
                    className="w-full py-6 flex items-center justify-between gap-6 text-left group"
                  >
                    <span className="font-display text-[1.125rem] md:text-[1.25rem] text-ink tracking-tight leading-snug">{item.q}</span>
                    <span className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full border border-border text-ink/60 group-hover:border-ink/40 group-hover:text-ink transition">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="pb-7 pr-12 text-[14.5px] text-muted-foreground leading-[1.8] font-light">{item.a}</div>
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
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-28 grid md:grid-cols-12 gap-12 md:gap-16 items-end">
        <div className="md:col-span-7">
          <p className="eyebrow !text-primary/80">Dispatch</p>
          <h2 className="mt-5 font-display text-4xl md:text-5xl text-background leading-[1.05] tracking-[-0.02em] font-light [text-wrap:balance]">
            Quiet correspondence. <span className="italic text-background/85">Monthly.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] text-background/65 leading-[1.8] font-light">
            New lot releases, archive updates, and standards publications. One letter, end of each month. No marketing.
          </p>
        </div>
        <div className="md:col-span-5">
          <form
            onSubmit={(e) => { e.preventDefault(); if (!email) return; setSubmitted(true); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-background/40" strokeWidth={1.5} />
              <input
                aria-label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full h-14 pl-11 pr-4 rounded-full bg-background/[0.06] border border-background/20 text-background placeholder:text-background/35 text-[14px] font-light focus:outline-none focus:border-primary/70 focus:bg-background/[0.08] transition"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center h-14 px-7 rounded-full bg-primary text-primary-foreground text-[12px] tracking-[0.16em] uppercase font-medium hover:bg-primary/90 transition whitespace-nowrap"
            >
              {submitted ? "Received ✓" : "Subscribe"}
            </button>
          </form>
          <p className="mt-4 text-[11.5px] text-background/45 font-light">Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}