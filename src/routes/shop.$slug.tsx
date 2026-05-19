import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { batches, labPartner } from "@/data/batches";
import { LotTag } from "@/components/site/LotTag";
import { VialImage } from "@/components/site/VialImage";

function titleFor(name: string) {
  return name
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*VIAL\s*$/i, " Vial")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function sizeFor(size: string) {
  return size.replace(/\bMG\b/g, "mg").replace(/\s*\/\s*/g, " / ").replace(/\s{2,}/g, " ").trim();
}
import { Check, ShieldCheck, FlaskConical, Truck, FileText, Snowflake, HelpCircle } from "lucide-react";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — VERATIS` },
          { name: "description", content: loaderData.product.short },
          { property: "og:title", content: `${loaderData.product.name} — VERATIS` },
          { property: "og:description", content: loaderData.product.short },
          { property: "og:type", content: "product" },
          { property: "og:url", content: `https://pure-peptide-labs.lovable.app/shop/${loaderData.product.slug}` },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.product.name,
              description: loaderData.product.description,
              image: `https://pure-peptide-labs.lovable.app${loaderData.product.image}`,
              category: loaderData.product.category,
              brand: { "@type": "Brand", name: "VERATIS" },
              offers: {
                "@type": "Offer",
                price: loaderData.product.price,
                priceCurrency: "USD",
                availability:
                  loaderData.product.inStock === false
                    ? "https://schema.org/OutOfStock"
                    : "https://schema.org/InStock",
                url: `https://pure-peptide-labs.lovable.app/shop/${loaderData.product.slug}`,
              },
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-3xl text-ink">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">Back to shop</Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error }) => {
    // Log full error server/console-side; never render raw messages to users.
    console.error(error);
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="text-2xl text-ink">Something went wrong</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We couldn't load this product. Please try again in a moment.
          </p>
          <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">
            Back to shop
          </Link>
        </div>
      </Layout>
    );
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const lot = batches.find((b) => b.slug === p.slug);
  const lotId = lot?.lot ?? p.lot;
  const title = titleFor(p.name);
  const sizeLabel = sizeFor(p.size);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const available = p.inStock !== false;
  const related = products.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4);
  const fallback = products.filter((x) => x.slug !== p.slug).slice(0, 4);
  const relatedList = (related.length >= 3 ? related : fallback).slice(0, 4);
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-6 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/50">
        <Link to="/" className="hover:text-ink transition">Home</Link>
        <span className="mx-2 text-foreground/55">/</span>
        <Link to="/shop" className="hover:text-ink transition">Catalog</Link>
        <span className="mx-2 text-foreground/55">/</span>
        <span className="text-ink">{title}</span>
      </div>

      <section className="mx-auto max-w-7xl px-6 pb-20 grid md:grid-cols-12 gap-12 lg:gap-20">
        {/* Specimen frame with registration ticks + spec footer */}
        <div className="md:col-span-7">
          <div className="relative aspect-square bg-mist rounded-[3px] overflow-hidden border border-border">
            {[
              "top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0",
            ].map((pos) => (
              <span key={pos} className={`absolute ${pos} w-4 h-px bg-ink/30`} aria-hidden />
            ))}
            <div className="absolute inset-0">
              <VialImage
                name={p.name}
                dosage={p.dosage}
                lot={lotId}
                purity={p.purity}
                size="detail"
                alt={`${title} — lyophilized research vial`}
              />
            </div>
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/55">
              <span>Specimen · {title}</span>
              <span className="tabular-nums">LOT {lotId}</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/50">
              <span>{sizeLabel} · Lyophilized · {p.purity} HPLC</span>
              <span>Format A · 1:1</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">{p.category}</p>
            <span className="h-px w-6 bg-foreground/20" />
            <LotTag lot={lotId} status="verified" linked />
          </div>
          <h1 className="mt-5 text-4xl md:text-[3.25rem] text-ink leading-[1.05] tracking-[-0.022em]">{title}</h1>
          <p className="mt-5 text-[15px] text-muted-foreground leading-relaxed">{p.short}</p>

          <div className="mt-9 flex items-baseline gap-3 pb-6 border-b border-border">
            <span className="font-display text-[2.25rem] text-ink tabular-nums leading-none">${p.price}</span>
            <span className="text-[12px] font-mono uppercase tracking-[0.16em] text-foreground/55">/ {sizeLabel}</span>
          </div>

          {/* Specification block — reads like a lab document, not a product card */}
          <dl className="mt-7 border border-border rounded-[3px] divide-y divide-border bg-background">
            {[
              ["Identity", `${title}, confirmed by ESI-MS`],
              ["Purity (HPLC)", `${p.purity}`],
              ["Endotoxin", lot?.endotoxin ?? "< 0.5 EU/mg"],
              ["Water content", lot?.water ?? "< 2.5%"],
              ["Form", "Lyophilized cake, nitrogen-sealed"],
              ["Storage", "–20 °C, protected from light"],
              ["Released", lot?.testedOn ?? "—"],
              ["Best before", lot?.expiresOn ?? "—"],
              ["Lot", lotId],
              ["Assayed by", `${labPartner.name} · ${labPartner.iso}`],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 text-[12.5px] px-5 py-3">
                <dt className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/50 self-center">{k}</dt>
                <dd className="text-ink tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex gap-3">
            <div className="flex items-center border border-border rounded-[3px]">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-4 py-3 text-foreground/70 hover:text-ink transition"
              >
                −
              </button>
              <span className="px-3 text-sm tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="px-4 py-3 text-foreground/70 hover:text-ink transition"
              >
                +
              </button>
            </div>
            <button
              onClick={() => available && addItem(p, qty)}
              disabled={!available}
              className="flex-1 bg-ink text-background rounded-[3px] text-[12px] font-medium uppercase tracking-[0.16em] px-6 py-3.5 hover:bg-ink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {available ? `Add to Cart · $${(p.price * qty).toFixed(0)}` : "Reserved"}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
            <Link to="/verify" className="inline-flex items-center gap-2 text-ink hover:text-primary transition">
              <FileText size={13} /> Retrieve COA for lot {lotId}
            </Link>
            <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.16em] text-foreground/50">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              In stock
            </span>
          </div>

          <ul className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
            {[
              [ShieldCheck, "ISO 17025 verified"],
              [FlaskConical, `${p.purity} HPLC purity`],
              [Truck, "Cold-chain dispatch · 48 hrs"],
              [Check, "Nitrogen-sealed vial"],
            ].map(([Icon, label], i) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <li key={i} className="flex items-center gap-2 text-foreground/75">
                  <I size={14} className="text-ink/70" strokeWidth={1.5} /> {label as string}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Compound notes</p>
          <h2 className="text-2xl md:text-3xl text-ink">About {p.name}</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">{p.description}</p>
          <p className="mt-5 text-xs text-muted-foreground italic">
            For in-vitro laboratory research use only. Not for human or veterinary consumption.
          </p>
        </div>
      </section>

      {/* Details accordion */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <Accordion type="multiple" className="border-t border-border">
          {[
            {
              icon: Snowflake,
              title: "Storage & handling",
              body: "Store sealed vials at –20 °C, protected from light. Once reconstituted, refrigerate at 2–8 °C and use within 28 days. Avoid freeze-thaw cycles. Lyophilized powder is shipped under nitrogen and remains stable at ambient temperatures for up to 14 days in transit.",
            },
            {
              icon: Truck,
              title: "Shipping & fulfillment",
              body: "Orders placed before 2pm ET ship the same business day. All vials ship in insulated mailers with cold packs at no additional cost. Domestic delivery in 2–4 business days via tracked carriers. Discreet packaging — no exterior product markings.",
            },
            {
              icon: FileText,
              title: "Documentation",
              body: "Every vial is labeled with its production lot number. Use that lot number on our lab portal to retrieve identity, purity (HPLC), mass-spec confirmation, endotoxin level, and appearance results — signed by an independent ISO 17025 accredited laboratory.",
            },
            {
              icon: HelpCircle,
              title: "Common questions",
              body: "These products are sold strictly for in-vitro laboratory and research applications. We do not provide dosing guidance, protocols, or any information related to human use. For questions about lot specifications or order status, our team responds within one business day.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <AccordionItem key={title} value={title} className="border-border">
              <AccordionTrigger className="text-left text-base text-ink hover:no-underline py-5">
                <span className="flex items-center gap-3">
                  <Icon size={18} className="text-ink/70" strokeWidth={1.5} />
                  {title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6 pl-9">
                {body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Related products */}
      {relatedList.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Related compounds</p>
                <h2 className="text-2xl md:text-3xl text-ink">In the same research area</h2>
              </div>
              <Link to="/shop" className="text-sm text-foreground/70 hover:text-foreground">
                Shop all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              {relatedList.map((rp) => <ProductCard key={rp.slug} p={rp} />)}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}