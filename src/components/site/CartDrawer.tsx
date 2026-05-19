import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { VialImage } from "./VialImage";
import { X } from "lucide-react";

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
        className="w-full sm:max-w-md flex flex-col gap-0 p-0 border-l border-border bg-background"
      >
        <SheetHeader className="px-6 py-5 border-b border-border flex-row items-center justify-between space-y-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">
              — Specimen cart
            </p>
            <SheetTitle className="mt-1 text-lg text-ink font-display tracking-tight">
              {count === 0 ? "Empty" : `${count} ${count === 1 ? "item" : "items"}`}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="mt-6 inline-flex items-center justify-center h-10 px-5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/20 rounded-[3px] hover:bg-mist transition-colors"
              >
                Browse catalog
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const t = titleFor(item.name);
                return (
                  <li key={item.slug} className="px-6 py-5 flex gap-4">
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
                            {sizeFor(item.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.slug)}
                          aria-label={`Remove ${t}`}
                          className="p-1 text-foreground/50 hover:text-ink transition-colors shrink-0"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-border rounded-[3px]">
                          <button
                            onClick={() => setQuantity(item.slug, item.quantity - 1)}
                            className="px-2.5 py-1 text-foreground/70 hover:text-ink transition text-sm"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-2 text-[12px] tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.slug, item.quantity + 1)}
                            className="px-2.5 py-1 text-foreground/70 hover:text-ink transition text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[13px] text-ink tabular-nums">
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
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-mono uppercase tracking-[0.18em] text-foreground/55">
                Subtotal
              </span>
              <span className="text-lg text-ink font-display tabular-nums">
                ${subtotal.toFixed(0)}
              </span>
            </div>
            <p className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/50">
              Cold-chain dispatch · taxes calculated at checkout
            </p>
            <button className="w-full bg-ink text-background rounded-[3px] text-[12px] font-medium uppercase tracking-[0.18em] px-6 py-3.5 hover:bg-ink/90 transition">
              Checkout · ${subtotal.toFixed(0)}
            </button>
            <button
              onClick={closeCart}
              className="w-full text-center text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/60 hover:text-ink transition"
            >
              Continue browsing
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
