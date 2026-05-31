import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Plus, Minus } from "lucide-react";

const sections = [
  {
    title: "Products & testing",
    items: [
      ["Are your peptides for human use?", "Yes. Products are sold for laboratory and research use only. They are not intended for human or veterinary consumption."],
      ["How is purity verified?", "Every batch is tested by an independent ISO 17025 accredited laboratory using HPLC and mass spectrometry. Each lot receives a unique COA that you can download from the product page."],
      ["Where are your peptides manufactured?", "Our peptides are synthesized in cGMP facilities in the United States and Europe, then validated by our partner labs before release."],
      ["What is the shelf life?", "Lyophilized vials stored at −20 °C are typically stable for 24 months. Once reconstituted, follow standard cold-storage protocols for short-term stability."],
      ["How long are lot retention samples kept?", "We retain sealed reference samples from every released lot for the full labeled shelf life. typically 24 months from release. under the same storage conditions as the shipped product. Retention samples can be pulled and re-assayed on request."],
      ["Can I request a specific lot or a fresh COA?", "Yes. If your protocol requires a particular lot, email support@veratisbio.com with the SKU and we'll confirm availability. We can also re-issue a COA in your researcher or institution name on request."],
    ] as [string, string][],
  },
  {
    title: "Shipping & cold chain",
    items: [
      ["When will my order ship?", "Orders placed before 2pm ET ship the same business day. All orders are dispatched within 48 hours."],
      ["How is the cold chain maintained?", "Lyophilized peptides are stable in transit, but every order ships in an insulated mailer with gel ice sized for the transit window. Most US deliveries arrive in 2–4 business days. The lyophilized cake itself remains stable at ambient temperatures for up to 14 days; the cold pack is a margin of safety, not a requirement."],
      ["What do I do if a vial arrives compromised?", "Photograph the vial and the shipping box immediately on arrival, then email support@veratisbio.com with your order number and the photos within 48 hours of delivery. We will reship from the same lot at no charge, or refund. your choice. Do not reconstitute or use a vial you suspect is compromised."],
      ["Do you ship internationally?", "Not at this time. We currently ship only within the continental United States (lower 48). We do not ship to Alaska, Hawaii, US territories, or internationally."],
      ["Why no international shipping?", "Research-peptide imports trigger customs review in most jurisdictions, and we will not put a customer through that process. We are evaluating compliant fulfillment partners in the EU and UK; sign up via the contact page to be notified."],
      ["How is packaging protected?", "Every order ships in an insulated mailer with cold packs sized for the transit window. Packaging is plain and unmarked."],
      ["What's the typical turnaround?", "Orders placed before 2pm ET ship the same business day; orders after that ship the next business day. End-to-end most US customers receive their order in 3–5 business days from order placement."],
    ] as [string, string][],
  },
  {
    title: "Payment, returns & support",
    items: [
      ["What payment methods do you accept?", "We accept Bitcoin (BTC) at checkout, with the conversion rate locked at the time of order using the Coinbase spot price. Card processing (Visa, Mastercard, AMEX) is being rolled out. see /how-to-pay for current status."],
      ["What is your return policy?", "Unopened vials can be returned within 14 days. If a lot fails our published specifications, we replace or refund. no questions asked."],
      ["When are reshipments issued?", "If a vial arrives broken, leaked, or with a compromised seal, we reship from the same lot at no charge within one business day of receiving your photos. If the lot is sold out, you can choose a refund or a substitute from the same compound family."],
      ["Can I order in bulk?", "Yes. Contact our team for wholesale and academic pricing. We typically respond within one business day."],
    ] as [string, string][],
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ. VERATIS" },
      { name: "description", content: "Answers about purity testing, shipping, storage, and intended use of our research peptides." },
      { property: "og:title", content: "FAQ. VERATIS" },
      { property: "og:description", content: "Common questions on purity verification, cold-chain shipping, storage, and intended laboratory use." },
      { property: "og:url", content: "https://veratisbio.com/faq" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: sections.flatMap((s) =>
            s.items.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          ),
        }),
      },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  return (
    <Layout>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked."
        lead="Can't find what you're looking for? Reach the team directly and we'll respond within one business day."
      />
      <section className="mx-auto max-w-3xl px-6 py-20 space-y-14">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-xs uppercase tracking-[0.22em] text-primary mb-5">{s.title}</h2>
            <Accordion type="single" collapsible>
              {s.items.map(([q, a], i) => (
                <AccordionItem key={i} value={`${s.title}-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-base text-ink hover:no-underline py-5 [&>svg]:hidden group">
                    <span className="flex-1">{q}</span>
                    <Plus size={18} className="text-muted-foreground group-data-[state=open]:hidden" />
                    <Minus size={18} className="text-muted-foreground hidden group-data-[state=open]:block" />
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </Layout>
  );
}