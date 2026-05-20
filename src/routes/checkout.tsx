import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Layout, PageHeader } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { createCheckoutOrder } from "@/lib/checkout.functions";
import { ShieldCheck, Lock, Snowflake, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — VERATIS" },
      { name: "description", content: "Secure Bitcoin checkout for laboratory-verified research compounds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type Step = 1 | 2 | 3;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(createCheckoutOrder);

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Shipping
  const [shipName, setShipName] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");
  const [notes, setNotes] = useState("");

  const FREE_SHIPPING_THRESHOLD = 150;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 18;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <Layout>
        <PageHeader eyebrow="— Checkout" title="Your cart is empty" />
        <section className="px-6 lg:px-12 py-20 max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">Add specimens from the catalog before proceeding to checkout.</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center justify-center h-11 px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/20 rounded-[3px] hover:bg-ink hover:text-background transition-all"
          >
            Browse catalog
          </Link>
        </section>
      </Layout>
    );
  }

  function validateStep1() {
    if (!email.includes("@")) return "Enter a valid email address.";
    if (!name.trim()) return "Enter your full name.";
    return null;
  }
  function validateStep2() {
    if (!shipName.trim()) return "Recipient name is required.";
    if (!addr1.trim()) return "Street address is required.";
    if (!city.trim()) return "City is required.";
    if (!stateRegion.trim()) return "State / region is required.";
    if (!zip.trim()) return "Postal code is required.";
    if (!country.trim()) return "Country is required.";
    return null;
  }

  function next() {
    setError(null);
    if (step === 1) {
      const v = validateStep1();
      if (v) return setError(v);
      if (!shipName) setShipName(name);
      setStep(2);
    } else if (step === 2) {
      const v = validateStep2();
      if (v) return setError(v);
      setStep(3);
    }
  }

  async function placeOrder() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          customer: { email, name, phone },
          shipping: {
            name: shipName, address_1: addr1, address_2: addr2,
            city, state: stateRegion, zip, country,
          },
          shipping_method: "standard",
          notes,
          items: items.map((i) => ({
            slug: i.slug, name: i.name, size: i.size,
            lot: i.lot, price: i.price, quantity: i.quantity,
          })),
        },
      });
      clear();
      navigate({ to: "/checkout/$orderNumber", params: { orderNumber: res.order_number } });
    } catch (e: any) {
      setError(e?.message || "Could not place order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <PageHeader eyebrow="— Checkout" title="Complete your order" />

      <section className="px-6 lg:px-12 py-12 max-w-6xl mx-auto grid lg:grid-cols-[1fr_380px] gap-12">
        {/* LEFT: form */}
        <div>
          <StepRail step={step} />

          {step === 1 && (
            <Panel title="Contact information">
              <Field label="Email address" required>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lab.com" autoComplete="email" className={inp} />
              </Field>
              <Field label="Full name" required>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jane Doe" autoComplete="name" className={inp} />
              </Field>
              <Field label="Phone (optional)">
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 0100" autoComplete="tel" className={inp} />
              </Field>
            </Panel>
          )}

          {step === 2 && (
            <Panel title="Shipping destination">
              <Field label="Recipient name" required>
                <input value={shipName} onChange={(e) => setShipName(e.target.value)} autoComplete="name" className={inp} />
              </Field>
              <Field label="Street address" required>
                <input value={addr1} onChange={(e) => setAddr1(e.target.value)} autoComplete="address-line1" className={inp} />
              </Field>
              <Field label="Apt / Suite (optional)">
                <input value={addr2} onChange={(e) => setAddr2(e.target.value)} autoComplete="address-line2" className={inp} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City" required>
                  <input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={inp} />
                </Field>
                <Field label="State / region" required>
                  <input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} autoComplete="address-level1" className={inp} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Postal code" required>
                  <input value={zip} onChange={(e) => setZip(e.target.value)} autoComplete="postal-code" className={inp} />
                </Field>
                <Field label="Country" required>
                  <input value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" className={inp} />
                </Field>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">— Dispatch method</p>
                <div className="p-4 border border-ink rounded-[3px] bg-mist/50">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] text-ink">Standard cold-chain</p>
                    <p className="text-[12px] tabular-nums text-ink">
                      {shippingCost === 0 ? "Free" : `$${shippingCost}`}
                    </p>
                  </div>
                  <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/55 mt-1">
                    3–5 business days · insured
                  </p>
                  {shippingCost === 0 ? (
                    <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-emerald-700 mt-2">
                      — Free shipping unlocked (orders over ${FREE_SHIPPING_THRESHOLD})
                    </p>
                  ) : (
                    <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/55 mt-2">
                      — Free over ${FREE_SHIPPING_THRESHOLD} · add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(0)} to qualify
                    </p>
                  )}
                </div>
              </div>

              <Field label="Order notes (optional)">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Delivery instructions, institutional reference, etc." className={`${inp} min-h-[88px] resize-y`} />
              </Field>
            </Panel>
          )}

          {step === 3 && (
            <Panel title="Review & confirm">
              <Review label="Contact">
                <p>{name}</p>
                <p className="text-foreground/70">{email}{phone ? ` · ${phone}` : ""}</p>
              </Review>
              <Review label="Shipping to">
                <p>{shipName}</p>
                <p className="text-foreground/70">{addr1}{addr2 ? `, ${addr2}` : ""}</p>
                <p className="text-foreground/70">{city}, {stateRegion} {zip}</p>
                <p className="text-foreground/70">{country}</p>
              </Review>
              <Review label="Dispatch">
                <p>Standard cold-chain · {shippingCost === 0 ? "Free" : `$${shippingCost}`}</p>
              </Review>
              <Review label="Payment method">
                <p>Bitcoin (BTC)</p>
                <p className="text-foreground/70 text-[11px] mt-1">
                  Payment address and exact BTC amount will be issued on the next screen.
                </p>
              </Review>
            </Panel>
          )}

          {error && (
            <p className="mt-4 text-[12px] text-red-700 font-mono">{error}</p>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)}
                className="inline-flex items-center gap-2 h-11 px-5 text-[11px] uppercase tracking-[0.18em] text-foreground/70 hover:text-ink transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <span />}
            {step < 3 ? (
              <button onClick={next}
                className="inline-flex items-center gap-2 h-11 px-6 bg-ink text-background rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 active:scale-[0.99] transition-all">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={placeOrder} disabled={submitting}
                className="inline-flex items-center gap-2 h-11 px-6 bg-ink text-background rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 active:scale-[0.99] transition-all disabled:opacity-60">
                {submitting ? "Placing order…" : "Place order"} {!submitting && <ArrowRight size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: summary */}
        <aside className="lg:sticky lg:top-24 self-start border border-border rounded-[3px] bg-mist/30">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— Order summary</p>
          </div>
          <ul className="divide-y divide-border">
            {items.map((i) => (
              <li key={i.slug} className="px-5 py-3 flex justify-between gap-3 text-[12px]">
                <div className="min-w-0">
                  <p className="text-ink truncate">{i.name}</p>
                  <p className="text-foreground/55 text-[10.5px] font-mono tabular-nums">
                    LOT {i.lot} · ×{i.quantity}
                  </p>
                </div>
                <p className="tabular-nums text-ink shrink-0">${(i.price * i.quantity).toFixed(0)}</p>
              </li>
            ))}
          </ul>
          <div className="px-5 py-4 border-t border-border space-y-2 text-[12px]">
            <Row label="Subtotal" value={`$${subtotal.toFixed(0)}`} />
            <Row label="Cold-chain shipping" value={shippingCost === 0 ? "Free" : `$${shippingCost}`} />
            {shippingCost > 0 && (
              <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/55">
                — Free over ${FREE_SHIPPING_THRESHOLD}
              </p>
            )}
            <div className="pt-2 mt-2 border-t border-border flex justify-between items-baseline">
              <span className="font-mono uppercase tracking-[0.18em] text-foreground/55 text-[10.5px]">Total</span>
              <span className="text-lg text-ink tabular-nums">${total.toFixed(0)}</span>
            </div>
          </div>
          <ul className="px-5 py-4 border-t border-border flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/55">
            <li className="inline-flex items-center gap-1.5"><Snowflake size={11} strokeWidth={1.5} /> Cold-chain</li>
            <li className="inline-flex items-center gap-1.5"><ShieldCheck size={11} strokeWidth={1.5} /> Lot-verified</li>
            <li className="inline-flex items-center gap-1.5"><Lock size={11} strokeWidth={1.5} /> BTC-secured</li>
          </ul>
        </aside>
      </section>
    </Layout>
  );
}

const inp = "mt-1.5 w-full h-11 px-3 text-[13px] text-ink bg-background border border-border rounded-[3px] focus:outline-none focus:border-ink/60 transition-colors";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-[3px] bg-background">
      <div className="px-5 py-4 border-b border-border">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— {title}</p>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/60">
        {label}{required && <span className="text-ink/40"> *</span>}
      </span>
      {children}
    </label>
  );
}
function Review({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-border last:border-b-0 grid grid-cols-[120px_1fr] gap-4 text-[12.5px]">
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">— {label}</p>
      <div className="text-ink space-y-0.5">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="text-foreground/65">{label}</span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}
function StepRail({ step }: { step: Step }) {
  const steps = ["Contact", "Shipping", "Review"];
  return (
    <ol className="flex items-center gap-3 mb-6 text-[10.5px] font-mono uppercase tracking-[0.2em]">
      {steps.map((s, i) => {
        const n = (i + 1) as Step;
        const done = step > n;
        const active = step === n;
        return (
          <li key={s} className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${active ? "bg-ink text-background border-ink" : done ? "bg-ink/10 border-ink/30 text-ink" : "border-border text-foreground/40"} tabular-nums text-[10px]`}>
              {n}
            </span>
            <span className={active ? "text-ink" : done ? "text-foreground/70" : "text-foreground/40"}>{s}</span>
            {i < steps.length - 1 && <span className="w-8 h-px bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}