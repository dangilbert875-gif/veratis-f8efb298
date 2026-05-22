import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Layout, PageHeader } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { createCheckoutOrder, getBtcUsdRate, validatePromoCode } from "@/lib/checkout.functions";
import { ShieldCheck, Lock, Snowflake, ArrowRight, ArrowLeft, Bitcoin, Copy, Check, Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import btcQr from "@/assets/btc-qr.jpg";

const BTC_ADDRESS = "3FD7Djem6ME9rnwx9YbdD3v7BiNF8PCvhq";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — VERATIS" },
      { name: "description", content: "Secure Bitcoin checkout for laboratory-verified research compounds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutRouteComponent,
});

type Step = 1 | 2 | 3;

function CheckoutRouteComponent() {
  const location = useLocation();

  if (location.pathname !== "/checkout") {
    return <Outlet />;
  }

  return <CheckoutPage />;
}

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

  const fetchRate = useServerFn(getBtcUsdRate);
  const checkPromo = useServerFn(validatePromoCode);
  const [btcRate, setBtcRate] = useState<number | null>(null);
  const [rateFetchedAt, setRateFetchedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState<"addr" | "amt" | null>(null);

  // Promo / referral code
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    discount_type: "percent" | "fixed";
    discount_amount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  async function applyPromo() {
    setPromoError(null);
    const raw = promoInput.trim();
    if (!raw) return;
    setPromoChecking(true);
    try {
      const res = await checkPromo({ data: { code: raw } });
      if (!res.valid) {
        setPromo(null);
        setPromoError(res.error || "Invalid code");
      } else {
        setPromo({
          code: res.code,
          discount_type: res.discount_type,
          discount_amount: res.discount_amount,
        });
      }
    } catch (e: any) {
      setPromoError(e?.message || "Could not validate code");
    } finally {
      setPromoChecking(false);
    }
  }

  const discountAmount = (() => {
    if (!promo) return 0;
    const raw = promo.discount_type === "fixed"
      ? Math.min(promo.discount_amount, subtotal)
      : Math.min((subtotal * promo.discount_amount) / 100, subtotal);
    return Math.round(raw * 100) / 100;
  })();
  const totalAfterDiscount = Math.max(0, total - discountAmount);

  // Payment proof
  const [proofOpen, setProofOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [txId, setTxId] = useState("");
  const [uploading, setUploading] = useState(false);
  const proofConfirmed = !!(proofUrl || txId.trim());

  function onPickFile(f: File | null) {
    setProofFile(f);
    setProofUrl(null);
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(f ? URL.createObjectURL(f) : null);
  }

  async function confirmProof() {
    setError(null);
    if (!proofFile && !txId.trim()) {
      setError("Upload a screenshot or enter the transaction ID.");
      return;
    }
    let uploadedUrl: string | null = proofUrl;
    if (proofFile && !uploadedUrl) {
      setUploading(true);
      try {
        const ext = proofFile.name.split(".").pop() || "png";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("payment-proofs")
          .upload(path, proofFile, { contentType: proofFile.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        uploadedUrl = pub.publicUrl;
        setProofUrl(uploadedUrl);
      } catch (e: any) {
        setError(e?.message || "Upload failed");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    setProofOpen(false);
  }
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetchRate();
        if (!cancelled && r?.rate) {
          setBtcRate(r.rate);
          setRateFetchedAt(r.fetched_at);
        }
      } catch {}
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [fetchRate]);
  const btcAmount = btcRate && total > 0 ? (total / btcRate).toFixed(8) : null;
  function copyVal(kind: "addr" | "amt", value: string) {
    navigator.clipboard?.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1400);
  }

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
    if (!proofConfirmed) {
      setError("Please upload proof of payment or enter your transaction ID first.");
      return;
    }
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
          payment_proof_url: proofUrl,
          payment_tx_id: txId.trim() || null,
          promo_code: promo?.code ?? null,
        },
      });
      clear();
      navigate({ to: "/checkout/thank-you/$orderNumber", params: { orderNumber: res.order_number } });
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
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bitcoin size={14} className="text-ink/70" strokeWidth={1.5} />
                    <p>Bitcoin (BTC)</p>
                  </div>
                  <p className="text-foreground/75 text-[12px] leading-relaxed">
                    Send{" "}
                    <strong className="text-ink font-mono">
                      {btcAmount ? `${btcAmount} BTC` : `the BTC equivalent of $${total.toFixed(2)}`}
                    </strong>{" "}
                    to the address below. Your order ships within 48 hours of on-chain confirmation.
                  </p>

                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-2">— Scan or copy BTC address</p>
                    <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                      <div className="mx-auto sm:mx-0 shrink-0 p-2.5 bg-white border border-border rounded-[3px]">
                        <img
                          src={btcQr}
                          alt={`Bitcoin payment QR code for ${BTC_ADDRESS}`}
                          className="w-[200px] h-[200px] sm:w-[120px] sm:h-[120px] block"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => copyVal("addr", BTC_ADDRESS)}
                        className="group w-full sm:flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-3.5 py-3 border border-border rounded-[3px] bg-mist/30 hover:border-ink/40 transition-colors text-left min-h-[56px]"
                      >
                        <span className="text-[12.5px] text-ink break-all font-mono leading-relaxed">{BTC_ADDRESS}</span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/55 group-hover:text-ink shrink-0 self-end sm:self-auto">
                          {copied === "addr" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Tap to copy</>}
                        </span>
                      </button>
                    </div>
                  </div>

                  {btcAmount && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-1.5">— Exact amount</p>
                      <button
                        type="button"
                        onClick={() => copyVal("amt", btcAmount)}
                        className="group w-full flex items-center justify-between gap-3 px-3.5 py-3 border border-border rounded-[3px] bg-mist/30 hover:border-ink/40 transition-colors text-left"
                      >
                        <span className="text-[12.5px] text-ink break-all font-mono">{btcAmount} BTC</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/55 group-hover:text-ink shrink-0">
                          {copied === "amt" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                        </span>
                      </button>
                    </div>
                  )}

                  <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
                    — {btcRate
                      ? `Rate: 1 BTC = $${btcRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD · Coinbase spot`
                      : "Fetching live BTC/USD rate from Coinbase…"}
                    {rateFetchedAt && btcRate ? ` · ${new Date(rateFetchedAt).toLocaleTimeString()}` : ""}
                  </p>
                </div>
              </Review>
            </Panel>
          )}

          {error && (
            <p className="mt-4 text-[12px] text-red-700 font-mono">{error}</p>
          )}

          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 text-[11px] uppercase tracking-[0.18em] text-foreground/70 hover:text-ink transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <span className="hidden sm:block" />}
            {step < 3 ? (
              <button onClick={next}
                className="inline-flex items-center justify-center gap-2 h-12 sm:h-11 w-full sm:w-auto px-6 bg-ink text-background rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 active:scale-[0.99] transition-all">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                {proofConfirmed && (
                  <button
                    onClick={() => setProofOpen(true)}
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 text-[11px] uppercase tracking-[0.18em] text-foreground/70 hover:text-ink border border-border rounded-[3px] transition-colors"
                  >
                    <Check size={12} className="text-emerald-700" /> Proof attached · Edit
                  </button>
                )}
                {!proofConfirmed ? (
                  <button
                    onClick={() => setProofOpen(true)}
                    className="inline-flex items-center justify-center gap-2 h-12 sm:h-11 w-full sm:w-auto px-6 bg-ink text-background rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 active:scale-[0.99] transition-all"
                  >
                    <Upload size={14} /> I've sent payment — upload proof
                  </button>
                ) : (
                  <button onClick={placeOrder} disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 h-12 sm:h-11 w-full sm:w-auto px-6 bg-ink text-background rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 active:scale-[0.99] transition-all disabled:opacity-60">
                    {submitting ? "Placing order…" : "Place order"} {!submitting && <ArrowRight size={14} />}
                  </button>
                )}
              </div>
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

      {proofOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={() => !uploading && setProofOpen(false)}>
          <div className="w-full max-w-lg bg-background border border-border rounded-[4px] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/65">— Proof of payment</p>
              <button onClick={() => !uploading && setProofOpen(false)} className="text-foreground/55 hover:text-ink" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <p className="text-[12.5px] text-foreground/75 leading-relaxed">
                Attach a screenshot of your Bitcoin payment <em>or</em> paste the transaction ID below. At least one is required.
              </p>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-1.5">— Screenshot</p>
                {proofPreview ? (
                  <div className="relative border border-border rounded-[3px] overflow-hidden bg-mist/30">
                    <img src={proofPreview} alt="Proof preview" className="w-full max-h-64 object-contain" />
                    <button
                      type="button"
                      onClick={() => onPickFile(null)}
                      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 bg-background/90 border border-border rounded-[3px] text-[10px] font-mono uppercase tracking-[0.18em] text-ink hover:bg-background"
                    >
                      <X size={11} /> Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 border border-dashed border-border rounded-[3px] bg-mist/30 cursor-pointer hover:border-ink/40 transition-colors">
                    <ImageIcon size={18} className="text-foreground/55" strokeWidth={1.5} />
                    <span className="text-[12px] text-foreground/70">Click to upload an image</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/45">PNG · JPG · up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-1.5">— Transaction ID (optional)</p>
                <textarea
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  rows={2}
                  placeholder="e.g. 4a5e1e4b… (paste BTC tx hash or note)"
                  className={`${inp} min-h-[64px] resize-y font-mono text-[12px]`}
                />
                <p className="mt-1.5 text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/45">
                  — Screenshot or TX ID required (one or both)
                </p>
              </div>

              {error && proofOpen && (
                <p className="text-[12px] text-red-700 font-mono">{error}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => !uploading && setProofOpen(false)}
                disabled={uploading}
                className="h-10 px-4 text-[11px] uppercase tracking-[0.18em] text-foreground/70 hover:text-ink transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmProof}
                disabled={uploading || (!proofFile && !txId.trim())}
                className="inline-flex items-center gap-2 h-10 px-5 bg-ink text-background rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink/90 transition-all disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Attach & continue"} {!uploading && <Check size={13} />}
              </button>
            </div>
          </div>
        </div>
      )}
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