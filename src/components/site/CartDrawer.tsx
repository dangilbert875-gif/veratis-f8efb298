import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { VialImage } from "./VialImage";
import { X, ShieldCheck, Snowflake, Lock } from "lucide-react";

function titleFor(name: string) {
  return name
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*VIAL\s*$/i, " Vial")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function sizeFor(size: string) {
  return size.replace(/\bMG\b/g, "mg").replace(/\s*\/\s*/g, " / ").replace(/\s{2,}/g, " ").trim();
}

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, setQuantity, removeItem, count } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : closeCart())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0 border-l border-border bg-background shadow-[-40px_0_80px_-40px_rgba(15,23,42,0.18)]"
      >
        <SheetHeader className="px-6 py-5 border-b border-border flex-row items-center justify-between space-y-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">
              — Specimen cart
            </p>
            <SheetTitle key={count} className="mt-1 text-lg text-ink font-display tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-300">
              {count === 0 ? "Empty" : `${count} ${count === 1 ? "item" : "items"}`}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-4">— No specimens selected</p>
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="mt-6 inline-flex items-center justify-center h-10 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/20 rounded-[3px] hover:bg-ink hover:text-background hover:border-ink active:scale-[0.985] transition-all duration-200"
              >
                Browse catalog
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item, idx) => {
                const t = titleFor(item.name);
                return (
                  <li
                    key={item.slug}
                    className="px-6 py-5 flex gap-4 animate-in fade-in slide-in-from-right-2 duration-300"
                    style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "both" }}
                  >
                    <div className="w-20 h-20 shrink-0 bg-mist border border-border/70 rounded-[3px] overflow-hidden">
                      <VialImage
                        name={item.name}
                        dosage={item.dosage}
                        lot={item.lot}
                        purity={item.purity}
                        size="card"
                        alt={t}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
                            {item.category}
                          </p>
                          <h3 className="mt-1 text-[14px] text-ink font-display leading-tight tracking-tight truncate">
                            {t}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-muted-foreground font-mono tabular-nums">
                            {sizeFor(item.size)} · LOT {item.lot}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.slug)}
                          aria-label={`Remove ${t}`}
                          className="p-1 text-foreground/40 hover:text-ink active:scale-90 transition-all duration-200 shrink-0"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-border rounded-[3px] overflow-hidden">
                          <button
                            onClick={() => setQuantity(item.slug, item.quantity - 1)}
                            className="px-2.5 py-1 text-foreground/70 hover:bg-mist hover:text-ink active:scale-95 transition-all duration-150 text-sm"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span key={item.quantity} className="px-2 text-[12px] tabular-nums inline-block animate-in fade-in zoom-in-95 duration-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.slug, item.quantity + 1)}
                            className="px-2.5 py-1 text-foreground/70 hover:bg-mist hover:text-ink active:scale-95 transition-all duration-150 text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <p key={item.price * item.quantity} className="text-[13px] text-ink tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-200">
                          ${(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4 bg-mist/30">
            <ul className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/55">
              {[
                [Snowflake,   "Cold-chain"],
                [ShieldCheck, "Lot-verified"],
                [Lock,        "Encrypted checkout"],
              ].map(([Ic, l], i) => {
                const I = Ic as typeof Snowflake;
                return (
                  <li key={i} className="inline-flex items-center gap-1.5">
                    <I size={11} className="text-ink/60" strokeWidth={1.5} /> {l as string}
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-mono uppercase tracking-[0.18em] text-foreground/55">
                Subtotal
              </span>
              <span key={subtotal} className="text-lg text-ink font-display tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-200">
                ${subtotal.toFixed(0)}
              </span>
            </div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/50">
              Median dispatch · 48 hrs · taxes calculated at checkout
            </p>
            <button className="w-full bg-ink text-background rounded-[3px] text-[12px] font-medium uppercase tracking-[0.18em] px-6 py-3.5 hover:bg-ink/90 active:scale-[0.99] transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(15,23,42,0.35)]">
              Checkout · ${subtotal.toFixed(0)}
            </button>
            <button
              onClick={closeCart}
              className="w-full text-center text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55 hover:text-ink transition-colors"
            >
              Continue browsing
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
