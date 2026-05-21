import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Layout, PageHeader } from "@/components/site/Layout";
import { getCheckoutOrder } from "@/lib/checkout.functions";
import { Check, Mail, Clock, Package, ShieldCheck, ArrowRight, Printer } from "lucide-react";

export const Route = createFileRoute("/checkout/thank-you/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Thank you — VERATIS" },
      { name: "description", content: "Your order has been received. Awaiting Bitcoin payment verification." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { orderNumber } = Route.useParams();
  const fetcher = useServerFn(getCheckoutOrder);
  const { data } = useQuery({
    queryKey: ["thank-you-order", orderNumber],
    queryFn: () => fetcher({ data: { order_number: orderNumber } }),
  });

  const items = (data?.items as any[]) || [];
  const itemsTotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const total = Number(data?.total_usd || 0);
  const shippingCost = Math.max(0, total - itemsTotal);

  return (
    <Layout>
      <PageHeader eyebrow="— Order received" title="Thank you" />

      <section className="px-6 lg:px-12 py-12 max-w-3xl mx-auto space-y-10 print:py-4">
        {/* Confirmation hero */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200">
            <Check size={26} className="text-emerald-700" strokeWidth={1.75} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display tracking-tight text-ink">
              Your order has been placed
            </h1>
            <p className="text-[13px] text-foreground/70 max-w-xl mx-auto leading-relaxed">
              We've received your order and your proof of payment. Our team will verify
              the Bitcoin transaction on-chain and dispatch your specimens within 48 hours
              of confirmation.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-border rounded-[3px] bg-mist/40">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— Reference</span>
            <span className="text-[14px] font-display tracking-tight text-ink">{orderNumber}</span>
          </div>
        </div>

        {/* Receipt */}
        {data && (
          <div className="border border-border rounded-[3px] bg-background">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/65">— Receipt</p>
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
                {new Date(data.created_at as any).toLocaleDateString()}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {items.length > 0 && (
                <ul className="divide-y divide-border">
                  {items.map((i, idx) => (
                    <li key={idx} className="py-3 flex items-start justify-between gap-4 text-[12.5px]">
                      <div className="min-w-0">
                        <p className="text-ink truncate">{i.name}</p>
                        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-foreground/55 mt-0.5">
                          {i.size ? `${i.size} · ` : ""}{i.lot ? `Lot ${i.lot} · ` : ""}Qty {i.quantity}
                        </p>
                      </div>
                      <p className="tabular-nums text-ink shrink-0">
                        ${(Number(i.price) * Number(i.quantity)).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-3 border-t border-border space-y-1.5 text-[12.5px]">
                <Row label="Subtotal" value={`$${itemsTotal.toFixed(2)}`} />
                <Row
                  label="Shipping · standard cold-chain"
                  value={shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                />
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink">Total · USD</span>
                  <span className="text-[15px] tabular-nums text-ink font-display">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer + shipping summary */}
        {data && (
          <div className="grid sm:grid-cols-2 gap-5">
            <SummaryCard title="Contact">
              <p className="text-ink">{data.customer_name}</p>
              <p>{data.customer_email}</p>
            </SummaryCard>
            <SummaryCard title="Shipping to">
              <p className="text-ink">{data.shipping_name}</p>
              <p>{data.shipping_address_1}{data.shipping_address_2 ? `, ${data.shipping_address_2}` : ""}</p>
              <p>{data.shipping_city}, {data.shipping_state} {data.shipping_zip}</p>
              <p>{data.shipping_country}</p>
            </SummaryCard>
          </div>
        )}

        {/* What happens next */}
        <div className="border border-border rounded-[3px] bg-background">
          <div className="px-6 py-4 border-b border-border">
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/65">— What happens next</p>
          </div>
          <ol className="divide-y divide-border">
            <Step
              icon={<Mail size={14} strokeWidth={1.5} />}
              title="Confirmation email"
              body={data?.customer_email
                ? <>A receipt is on its way to <span className="font-mono text-ink">{data.customer_email}</span>.</>
                : "A receipt with your order details is on its way to your inbox."}
            />
            <Step
              icon={<Clock size={14} strokeWidth={1.5} />}
              title="Payment verification"
              body="We confirm your Bitcoin transaction on-chain — typically within 1–3 hours, depending on network congestion."
            />
            <Step
              icon={<Package size={14} strokeWidth={1.5} />}
              title="Cold-chain dispatch"
              body="Your specimens ship within 48 hours of confirmation, insured and temperature-controlled, with tracking sent by email."
            />
          </ol>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 print:hidden">
          <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
            <ShieldCheck size={12} strokeWidth={1.5} /> Save your reference number for future inquiries
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 h-11 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70 hover:text-ink border border-border rounded-[3px] transition-colors"
            >
              <Printer size={13} /> Print receipt
            </button>
            <Link
              to="/checkout/$orderNumber"
              params={{ orderNumber }}
              className="inline-flex items-center gap-2 h-11 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/20 rounded-[3px] hover:bg-ink hover:text-background transition-all"
            >
              View order status <ArrowRight size={13} />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center h-11 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70 hover:text-ink transition-colors"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-foreground/75">
      <span>{label}</span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-[3px] bg-background">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— {title}</p>
      </div>
      <div className="px-5 py-4 text-[12px] text-foreground/75 space-y-0.5">{children}</div>
    </div>
  );
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <li className="px-6 py-4 flex gap-4">
      <div className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-full border border-border bg-mist/40 text-ink/70 shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[12.5px] text-ink">{title}</p>
        <p className="text-[12px] text-foreground/70 leading-relaxed">{body}</p>
      </div>
    </li>
  );
}
