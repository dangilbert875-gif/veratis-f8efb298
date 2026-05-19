import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { products } from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Check, ShieldCheck, FlaskConical, Truck, FileText, Snowflake, HelpCircle } from "lucide-react";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Pure Peptide` },
          { name: "description", content: loaderData.product.short },
          { property: "og:image", content: loaderData.product.image },
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
  errorComponent: ({ error }) => (
    <Layout>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-2xl text-ink">{error.message}</h1>
      </div>
    </Layout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const related = products.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4);
  const fallback = products.filter((x) => x.slug !== p.slug).slice(0, 4);
  const relatedList = (related.length >= 3 ? related : fallback).slice(0, 4);
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-foreground">Shop</Link> /{" "}
        <span className="text-foreground">{p.name}</span>
      </div>
      <section className="mx-auto max-w-7xl px-6 pb-20 grid md:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <div className="aspect-square bg-mist rounded-xl overflow-hidden border border-border">
            <img src={p.image} alt={p.name} width={1024} height={1024} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[p.image, p.image, p.image, p.image].map((src, i) => (
              <div key={i} className="aspect-square bg-mist rounded-md border border-border overflow-hidden opacity-70">
                <img src={src} alt="" width={256} height={256} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">{p.category}</p>
          <h1 className="mt-3 text-4xl md:text-5xl text-ink">{p.name}</h1>
          <p className="mt-4 text-muted-foreground">{p.short}</p>
          <div className="mt-7 flex items-baseline gap-3">
            <span className="text-3xl text-ink tabular-nums">${p.price}</span>
            <span className="text-sm text-muted-foreground">/ {p.size} vial</span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> In stock — ships within 48 hrs
          </div>
          <div className="mt-7 border border-border rounded-lg divide-y divide-border">
            {[
              ["Purity", `${p.purity} (HPLC)`],
              ["Form", "Lyophilized powder"],
              ["Storage", "–20 °C, sealed under nitrogen"],
              ["Lot", "PP-2426"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm px-4 py-3">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-ink">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex gap-3">
            <div className="flex items-center border border-border rounded-md">
              <button className="px-4 py-3 text-foreground/70 hover:text-foreground">−</button>
              <span className="px-3 text-sm tabular-nums">1</span>
              <button className="px-4 py-3 text-foreground/70 hover:text-foreground">+</button>
            </div>
            <button className="flex-1 bg-ink text-background rounded-md text-sm font-medium px-6 py-3.5 hover:bg-ink/90 transition">
              Add to cart — ${p.price}
            </button>
          </div>
          <Link to="/lab-testing" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <FileText size={14} /> Download COA for lot PP-2426
          </Link>
          <ul className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {[
              [ShieldCheck, "ISO 17025 tested"],
              [FlaskConical, `${p.purity} verified purity`],
              [Truck, "Cold-chain shipping"],
              [Check, "Sealed lyophilized vial"],
            ].map(([Icon, label], i) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <li key={i} className="flex items-center gap-2 text-foreground/80">
                  <I size={16} className="text-primary" /> {label as string}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-2xl text-ink">About this peptide</h2>
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
                  <Icon size={18} className="text-primary" strokeWidth={1.5} />
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
                <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">Related</p>
                <h2 className="text-2xl md:text-3xl text-ink">You may also be researching</h2>
              </div>
              <Link to="/shop" className="text-sm text-foreground/70 hover:text-foreground">
                Shop all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {relatedList.map((rp) => <ProductCard key={rp.slug} p={rp} />)}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}