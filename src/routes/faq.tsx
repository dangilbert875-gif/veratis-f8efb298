import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Plus, Minus } from "lucide-react";

const sections = [
  {
    title: "Products & testing",
    items: [
      ["Are your peptides for human use?", "No. All VERATIS products are intended strictly for in-vitro laboratory and research use. They are not for human or veterinary consumption."],
      ["How is purity verified?", "Every batch is tested by an independent ISO 17025 accredited laboratory using HPLC and mass spectrometry. Each lot receives a unique COA that you can download from the product page."],
      ["Where are your peptides manufactured?", "Our peptides are synthesized in cGMP facilities in the United States and Europe, then validated by our partner labs before release."],
      ["What is the shelf life?", "Lyophilized vials stored at −20 °C are typically stable for 24 months. Once reconstituted, follow standard cold-storage protocols for short-term stability."],
    ] as [string, string][],
  },
  {
    title: "Shipping",
    items: [
      ["When will my order ship?", "Orders placed before 2pm ET ship the same business day. All orders are dispatched within 48 hours."],
      ["Do you ship internationally?", "We currently ship to the US, Canada, UK, EU, and Australia. International orders include tracked, insured delivery."],
      ["How is packaging protected?", "Every order ships in an insulated mailer with cold packs sized for the transit window. Packaging is plain and unmarked."],
    ] as [string, string][],
  },
  {
    title: "Returns & support",
    items: [
      ["What is your return policy?", "Unopened vials can be returned within 14 days. If a lot fails our published specifications, we replace or refund — no questions asked."],
      ["Can I order in bulk?", "Yes. Contact our team for wholesale and academic pricing. We typically respond within one business day."],
    ] as [string, string][],
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — VERATIS" },
      { name: "description", content: "Answers about purity testing, shipping, storage, and intended use of our research peptides." },
      { property: "og:title", content: "FAQ — VERATIS" },
      { property: "og:description", content: "Common questions on purity verification, cold-chain shipping, storage, and intended laboratory use." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/faq" },
    ],
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