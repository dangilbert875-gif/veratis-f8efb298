import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — VERATIS" },
      { name: "description", content: "Shipping rates, transit times, and our straightforward return policy. Currently shipping within the continental United States only." },
      { property: "og:title", content: "Shipping & Returns — VERATIS" },
      { property: "og:description", content: "Cold-chain insulated dispatch within 48 hours within the continental US. Free shipping over $150. 14-day return window on unopened vials." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/shipping-returns" },
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
        <Section title="Where we ship">
          <p>VERATIS currently ships only within the <span className="text-ink">continental United States</span> (the lower 48 states). We do not ship to Alaska, Hawaii, US territories, APO/FPO addresses, or internationally at this time. Expanded coverage will be announced as additional cold-chain corridors are validated.</p>
        </Section>
        <Section title="Shipping rates">
          <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {[
              ["Continental US standard (3–5 days)", "$9.50"],
              ["Continental US express (1–2 days)", "$24"],
              ["Free shipping on continental US orders", "$150+"],
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
          <p>If your package arrives damaged or is lost in transit, email <span className="text-primary">hello@veratisbio.com</span> within 7 days of the expected delivery date and we will resolve it immediately.</p>
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