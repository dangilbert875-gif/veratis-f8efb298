import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Layout, PageHeader } from "@/components/site/Layout";
import { getCheckoutOrder } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/$orderNumber")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ t: z.string().min(8).max(128).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Order confirmation. VERATIS" },
      { name: "description", content: "Your order has been received and payment is being verified." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { orderNumber } = Route.useParams();
  const { t } = Route.useSearch();
  const fetcher = useServerFn(getCheckoutOrder);
  const { data, isLoading, error } = useQuery({
    queryKey: ["checkout-order", orderNumber],
    queryFn: () => fetcher({ data: { order_number: orderNumber, access_token: t ?? "" } }),
    enabled: Boolean(t),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <Layout hideFooter>
        <PageHeader eyebrow="Order" title="Loading order…" />
      </Layout>
    );
  }
  if (error || !data) {
    return (
      <Layout hideFooter>
        <PageHeader eyebrow="Order" title="Order not found" />
        <section className="px-6 lg:px-12 py-16 max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            We couldn't locate order <span className="font-mono">{orderNumber}</span>.
          </p>
          <Link to="/shop" className="mt-6 inline-block text-[11px] uppercase tracking-[0.18em] text-ink border-b border-ink/40">
            Back to catalog
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <PageHeader eyebrow="Order placed" title="Thank you" />

      <section className="px-6 lg:px-12 py-12 max-w-4xl mx-auto space-y-8">
        <div className="border border-border rounded-[3px] bg-mist/30 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">Reference</p>
            <p className="mt-1 text-2xl font-display tracking-tight text-ink">{data.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">Amount paid</p>
            <p className="mt-1 text-2xl font-display tracking-tight text-ink tabular-nums">
              ${Number(data.total_usd).toFixed(2)} <span className="text-[12px] font-mono text-foreground/55 uppercase tracking-[0.18em]">USD</span>
            </p>
          </div>
        </div>

        {/* Confirmation message */}
        <div className="border border-border rounded-[3px] bg-background">
          <div className="px-6 py-5 space-y-3">
            <p className="text-[12.5px] text-foreground/80 leading-relaxed">
              Thank you for your order.{" "}
              {(data as any).payment_method === "venmo"
                ? "We've received your Venmo payment submission and will verify it shortly."
                : "We've received your payment and are verifying it on-chain now."}{" "}
              You'll receive a confirmation email at{" "}
              <span className="font-mono text-ink">{data.customer_email}</span>{" "}
              within 48 hours once your order ships.
            </p>
            <p className="text-[12px] text-foreground/60 leading-relaxed">
              Please take a screenshot of this page for your records.
            </p>
          </div>
        </div>

        {/* Order details */}
        <div className="grid sm:grid-cols-2 gap-5">
          <DetailCard title="Shipping to">
            <p className="text-ink">{data.shipping_name}</p>
            <p>{data.shipping_address_1}{data.shipping_address_2 ? `, ${data.shipping_address_2}` : ""}</p>
            <p>{data.shipping_city}, {data.shipping_state} {data.shipping_zip}</p>
            <p>{data.shipping_country}</p>
            {data.shipping_method && (
              <p className="mt-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
               . {data.shipping_method === "express" ? "Express overnight" : "Standard cold-chain"}
              </p>
            )}
          </DetailCard>
          <DetailCard title="Items">
            <ul className="space-y-2">
              {(data.items as any[]).map((i, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span className="text-ink truncate">{i.name} ×{i.quantity}</span>
                  <span className="tabular-nums shrink-0">${(Number(i.price) * Number(i.quantity)).toFixed(0)}</span>
                </li>
              ))}
            </ul>
          </DetailCard>
        </div>

        <div className="flex items-center justify-center pt-4">
          <Link to="/shop" className="inline-flex items-center justify-center h-11 px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/20 rounded-[3px] hover:bg-ink hover:text-background transition-all">
            Continue browsing
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-[3px] bg-background">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">{title}</p>
      </div>
      <div className="px-5 py-4 text-[12px] text-foreground/75 space-y-0.5">{children}</div>
    </div>
  );
}