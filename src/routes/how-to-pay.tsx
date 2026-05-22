import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Bitcoin,
  ShoppingBag,
  Send,
  PackageCheck,
  Lock,
  Eye,
  ShieldCheck,
  Mail,
  Truck,
  Wallet,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/how-to-pay")({
  head: () => ({
    meta: [
      { title: "How To Pay — VERATIS" },
      {
        name: "description",
        content:
          "VERATIS currently accepts Bitcoin (BTC) for all orders. A clear, three-step payment process with full transparency and secure verification.",
      },
      { property: "og:title", content: "How To Pay — VERATIS" },
      {
        property: "og:description",
        content:
          "Bitcoin payment in three steps. Transparent, verifiable, and dispatched within 48 hours of confirmation.",
      },
      { property: "og:url", content: "https://veratisbio.com/how-to-pay" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/how-to-pay" }],
  }),
  component: HowToPayPage,
});

function HowToPayPage() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Payment information"
        title="How to pay."
        lead="VERATIS currently accepts Bitcoin (BTC) for all orders. The process is straightforward, fully verified, and designed for first-time and experienced customers alike."
      />

      {/* Why BTC */}
      <section className="mx-auto max-w-3xl px-6 pt-16 md:pt-20">
        <div className="rounded-2xl border border-border bg-mist/40 p-8 md:p-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border">
              <Bitcoin size={16} className="text-primary" strokeWidth={1.75} />
            </span>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">
              Why Bitcoin
            </p>
          </div>
          <p className="mt-5 text-[15px] md:text-base leading-relaxed text-foreground/85">
            To maintain operational reliability and uninterrupted fulfillment,
            VERATIS currently processes payments via Bitcoin (BTC). This allows
            us to provide fast, verifiable transactions while preserving the
            standards and infrastructure expected from a modern research
            platform. Every payment is matched to a unique order reference and
            confirmed on-chain before fulfillment begins.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">
            The process
          </p>
          <h2 className="text-3xl md:text-4xl text-ink">
            Three steps. Nothing hidden.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Each order moves through a documented sequence: placement,
            settlement, and verified fulfillment. Confirmation arrives by email
            at every stage.
          </p>
        </div>

        <ol className="mt-12 grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            {
              n: "01",
              icon: ShoppingBag,
              title: "Create your order",
              points: [
                "Add products to your cart and proceed to checkout.",
                "Enter shipping details — packaging is plain and unmarked.",
                "Select Bitcoin (BTC) as your payment method to receive an order summary and a unique payment reference.",
              ],
            },
            {
              n: "02",
              icon: Send,
              title: "Send Bitcoin (BTC)",
              points: [
                "Send the exact BTC amount shown at checkout to the address provided.",
                "The amount and address are locked to your order for fifteen minutes.",
                "Most transactions confirm within 10–30 minutes on the Bitcoin network.",
              ],
            },
            {
              n: "03",
              icon: PackageCheck,
              title: "Verification & fulfillment",
              points: [
                "Our team verifies the on-chain payment against your order reference.",
                "You receive a confirmation email the moment payment clears.",
                "Orders are dispatched within 48 hours with tracked, insured shipping.",
              ],
            },
          ].map(({ n, icon: Icon, title, points }) => (
            <li key={n} className="bg-background p-8 md:p-10 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground tabular-nums">
                  Step {n}
                </span>
                <Icon size={18} className="text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-foreground/80 leading-relaxed">
                {points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-2 h-px w-3 bg-ink/40 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Security & Transparency */}
      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">
              Payment security & transparency
            </p>
            <h2 className="text-3xl md:text-4xl text-ink">
              Built for verification, not friction.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every payment is matched to a unique reference and confirmed on
              the Bitcoin network before fulfillment. Customer information is
              handled with the same discretion as the rest of our operation.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Lock,
                title: "Encrypted checkout",
                text: "All checkout traffic is served over TLS 1.3. Payment references are signed and single-use.",
              },
              {
                icon: Eye,
                title: "On-chain verification",
                text: "Every transaction is independently confirmed against the public Bitcoin ledger before release.",
              },
              {
                icon: ShieldCheck,
                title: "Order integrity",
                text: "Payment, lot assignment, and shipment are logged against a single immutable order reference.",
              },
              {
                icon: Wallet,
                title: "Private customer data",
                text: "We store the minimum required to ship your order. No payment cards. No third-party trackers.",
              },
              {
                icon: Truck,
                title: "Tracked fulfillment",
                text: "Each order is dispatched with insured, tracked shipping and confirmation at every handoff.",
              },
              {
                icon: Mail,
                title: "Clear communication",
                text: "You receive a confirmation when payment clears, when we ship, and when delivery is confirmed.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-background p-7"
              >
                <Icon size={18} className="text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 text-base text-ink font-display tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New to Bitcoin */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3">
              New to Bitcoin
            </p>
            <h2 className="text-3xl md:text-4xl text-ink">
              First time? It takes about ten minutes.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              You don't need prior experience with cryptocurrency. The process
              is the same as sending money from one app to another — open an
              account, fund it, and send the amount shown at checkout to the
              address we provide.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                name: "Cash App",
                text: "Available in the US and UK. Buy BTC inside the app and send directly to the payment address provided at checkout.",
              },
              {
                name: "Coinbase",
                text: "Available in 100+ countries. Create an account, fund it via bank transfer or card, then send BTC to the address shown at checkout.",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-border bg-background p-6 flex items-start gap-5"
              >
                <span className="mt-1 h-9 w-9 rounded-full bg-mist border border-border inline-flex items-center justify-center shrink-0">
                  <Bitcoin
                    size={15}
                    className="text-primary"
                    strokeWidth={1.75}
                  />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">{p.name}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {p.text}
                  </p>
                </div>
              </div>
            ))}
            <p className="text-[11px] leading-relaxed text-muted-foreground/80 pt-2">
              VERATIS is not affiliated with the platforms listed above. They
              are referenced only as widely available, beginner-friendly options
              for obtaining BTC.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-3 text-center">
            Payment FAQ
          </p>
          <h2 className="text-3xl md:text-4xl text-ink text-center">
            Common questions.
          </h2>

          <Accordion type="single" collapsible className="mt-12">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-[15px] text-ink hover:no-underline py-5">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              Still have a question about payment?
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 bg-ink text-background px-6 py-3.5 rounded-md text-sm font-medium hover:bg-ink/90 transition"
            >
              Contact our team <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

const faqs: [string, string][] = [
  [
    "Why do you only accept Bitcoin?",
    "Bitcoin allows VERATIS to provide reliable, uninterrupted fulfillment across every market we serve. Settlement is fast, verifiable on a public ledger, and not subject to the processor-level disruptions that affect many research suppliers. We continue to evaluate additional payment methods and will add them when they meet our reliability standard.",
  ],
  [
    "How long do payments take to confirm?",
    "Most Bitcoin transactions confirm within 10 to 30 minutes once broadcast to the network. As soon as your payment receives the required confirmations, you'll receive a confirmation email and your order moves into fulfillment.",
  ],
  [
    "What happens if I send the wrong amount?",
    "If the amount received is below the order total, we'll email you with the remaining balance and a fresh confirmation window. If it's above, the surplus is automatically credited toward your next order or refunded on request — your choice.",
  ],
  [
    "When will my order ship?",
    "Orders are dispatched within 48 hours of confirmed payment. Orders confirmed before 2pm ET typically ship the same business day with tracked, insured delivery.",
  ],
  [
    "Is checkout secure?",
    "Yes. Checkout is served over TLS 1.3 with single-use, signed payment references. We store only the customer details required to ship your order and never handle payment-card data.",
  ],
  [
    "Do I need a Bitcoin wallet beforehand?",
    "Not necessarily. Apps like Cash App and Coinbase combine an account, wallet, and exchange in one place, which is enough for most first-time customers. Experienced users can pay directly from any self-custody wallet.",
  ],
];
