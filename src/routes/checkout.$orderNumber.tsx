import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Layout, PageHeader } from "@/components/site/Layout";
import { getCheckoutOrder } from "@/lib/checkout.functions";
import { Bitcoin, Copy, Check, Mail, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/checkout/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Order confirmation — VERATIS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { orderNumber } = Route.useParams();
  const fetcher = useServerFn(getCheckoutOrder);
  const { data, isLoading, error } = useQuery({
    queryKey: ["checkout-order", orderNumber],
    queryFn: () => fetcher({ data: { order_number: orderNumber } }),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <Layout>
        <PageHeader eyebrow="— Order" title="Loading order…" />
      </Layout>
    );
  }
  if (error || !data) {
    return (
      <Layout>
        <PageHeader eyebrow="— Order" title="Order not found" />
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

  const expiresAt = data.payment_expires_at ? new Date(data.payment_expires_at) : null;
  const paid = data.payment_status === "confirmed" || data.payment_received_at;

  return (
    <Layout>
      <PageHeader eyebrow="— Order placed" title="Thank you" />

      <section className="px-6 lg:px-12 py-12 max-w-4xl mx-auto space-y-8">
        <div className="border border-border rounded-[3px] bg-mist/30 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— Reference</p>
            <p className="mt-1 text-2xl font-display tracking-tight text-ink">{data.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— Amount due</p>
            <p className="mt-1 text-2xl font-display tracking-tight text-ink tabular-nums">
              ${Number(data.total_usd).toFixed(2)} <span className="text-[12px] font-mono text-foreground/55 uppercase tracking-[0.18em]">USD</span>
            </p>
          </div>
        </div>

        {/* Payment block */}
        <div className="border border-border rounded-[3px] bg-background">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Bitcoin size={16} className="text-ink/70" strokeWidth={1.5} />
            <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/65">— Bitcoin payment</p>
            <span className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] rounded-[2px] ${
              paid ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                   : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {paid ? <Check size={11} /> : <Clock size={11} />} {paid ? "Confirmed" : "Awaiting payment"}
            </span>
          </div>
          <div className="px-6 py-6 space-y-5">
            {data.btc_address ? (
              <>
                <Field label="Send BTC to this address">
                  <CopyValue value={data.btc_address} mono />
                </Field>
                {data.btc_amount && (
                  <Field label="Exact BTC amount">
                    <CopyValue value={String(data.btc_amount)} mono />
                  </Field>
                )}
                <p className="text-[11.5px] text-foreground/70 leading-relaxed">
                  Send the exact USD-equivalent of <strong className="text-ink">${Number(data.total_usd).toFixed(2)}</strong> in BTC
                  to the address above. Your order ships within 48 hours of on-chain confirmation. A confirmation email will be sent to{" "}
                  <span className="font-mono text-ink">{data.customer_email}</span>.
                </p>
              </>
            ) : (
              <div className="rounded-[3px] border border-border bg-mist/40 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-ink/60 mt-0.5" strokeWidth={1.5} />
                  <div className="text-[12.5px] text-foreground/80 leading-relaxed">
                    Your unique Bitcoin payment address and the exact BTC amount will be issued to{" "}
                    <span className="font-mono text-ink">{data.customer_email}</span> within the next hour.
                    Please keep this reference number safe.
                  </div>
                </div>
              </div>
            )}

            {expiresAt && (
              <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
                — Payment window expires {expiresAt.toLocaleString()}
              </p>
            )}
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
                — {data.shipping_method === "express" ? "Express overnight" : "Standard cold-chain"}
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

        <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
          <ShieldCheck size={12} strokeWidth={1.5} /> Save this page · status auto-refreshes every 30 seconds
        </div>

        <div className="flex gap-4">
          <Link to="/shop" className="inline-flex items-center justify-center h-11 px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/20 rounded-[3px] hover:bg-ink hover:text-background transition-all">
            Continue browsing
          </Link>
          <Link to="/how-to-pay" className="inline-flex items-center justify-center h-11 px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70 hover:text-ink transition-colors">
            Bitcoin payment guide
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-1.5">— {label}</p>
      {children}
    </div>
  );
}
function CopyValue({ value, mono }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className="group w-full flex items-center justify-between gap-3 px-3.5 py-3 border border-border rounded-[3px] bg-mist/30 hover:border-ink/40 transition-colors text-left"
    >
      <span className={`text-[12.5px] text-ink break-all ${mono ? "font-mono" : ""}`}>{value}</span>
      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/55 group-hover:text-ink shrink-0">
        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </span>
    </button>
  );
}
function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-[3px] bg-background">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— {title}</p>
      </div>
      <div className="px-5 py-4 text-[12px] text-foreground/75 space-y-0.5">{children}</div>
    </div>
  );
}