import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Pure Peptide" },
      { name: "description", content: "Shipping rates, transit times, and our straightforward return policy." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <PageHeader eyebrow="Policies" title="Shipping & returns." />
      <article className="mx-auto max-w-3xl px-6 py-20 space-y-12 text-foreground/85">
        <Section title="Processing & dispatch">
          <p>Orders placed before 2pm ET ship the same business day. All orders are dispatched within 48 hours from our temperature-controlled facility.</p>
        </Section>
        <Section title="Shipping rates">
          <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {[
              ["Domestic standard (3–5 days)", "$9.50"],
              ["Domestic express (1–2 days)", "$24"],
              ["Free shipping on US orders", "$150+"],
              ["International tracked", "From $32"],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between text-sm px-4 py-3 bg-background">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-ink tabular-nums">{v}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Cold-chain protection">
          <p>Every order ships in an insulated mailer with cold packs sized for the transit window. Packaging is plain and unmarked. Lyophilized vials remain stable through standard ground transit windows.</p>
        </Section>
        <Section title="Returns">
          <p>Unopened vials may be returned within 14 days of delivery for a full refund (less shipping). If any product fails our published specifications, contact us within 30 days for a replacement or refund — including return shipping.</p>
        </Section>
        <Section title="Damaged or lost shipments">
          <p>If your package arrives damaged or is lost in transit, email <span className="text-primary">support@purepeptide.co</span> within 7 days of the expected delivery date and we will resolve it immediately.</p>
        </Section>
        <p className="text-xs text-muted-foreground italic pt-6 border-t border-border">
          Products are intended for research purposes only and are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </article>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl text-ink mb-4">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}