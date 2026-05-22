import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listOrders, getOrderDetail, patchOrder, bulkOrderAction, deleteOrder } from "@/lib/admin.functions";
import { InternalNotes } from "../InternalNotes";
import { Card, Empty, Field, GhostButton, PrimaryButton, SelectInput, TextInput, formatDate, formatUSD } from "../ui";

// ───── Status taxonomy ─────
const PAYMENT_STATUSES = [
  "pending", "awaiting_payment", "paid", "confirmed",
  "underpaid", "expired", "refunded", "failed",
] as const;
const FULFILLMENT_STATUSES = [
  "not_started", "processing", "packed", "shipped",
  "delivered", "held", "cancelled",
] as const;

type Tone = "ok" | "warn" | "bad" | "neutral";

function paymentTone(s: string): Tone {
  if (["confirmed", "paid", "btc_received"].includes(s)) return "ok";
  if (["pending", "awaiting_payment", "underpaid"].includes(s)) return "warn";
  if (["failed", "expired", "refunded"].includes(s)) return "bad";
  return "neutral";
}
function fulfillmentTone(s: string): Tone {
  if (["shipped", "delivered"].includes(s)) return "ok";
  if (["processing", "packed", "held"].includes(s)) return "warn";
  if (["cancelled"].includes(s)) return "bad";
  return "neutral";
}

function isComplete(o: any) {
  return ["paid", "confirmed", "btc_received"].includes(o.payment_status)
    && ["shipped", "delivered"].includes(o.fulfillment_status);
}

function isPaidLike(o: any) {
  return ["paid", "shipped", "delivered"].includes(o.status)
    || ["paid", "confirmed", "btc_received"].includes(o.payment_status);
}
function isAwaitingPayment(o: any) {
  if (isPaidLike(o)) return false;
  return ["awaiting_payment", "pending", "underpaid"].includes(o.payment_status)
    || ["pending", "awaiting_payment"].includes(o.status);
}

function StatusDot({ tone }: { tone: Tone }) {
  const c = tone === "ok" ? "bg-emerald-700"
    : tone === "warn" ? "bg-amber-600"
    : tone === "bad" ? "bg-red-700"
    : "bg-ink/30";
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${c}`} />;
}

function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const tones: Record<Tone, string> = {
    neutral: "border-ink/15 text-foreground/60 bg-mist/30",
    ok: "border-emerald-700/30 text-emerald-800 bg-emerald-50/40",
    warn: "border-amber-700/30 text-amber-800 bg-amber-50/40",
    bad: "border-red-700/30 text-red-800 bg-red-50/40",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase ${tones[tone]}`}>
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}

function InlineStatusSelect({
  value, tone, options, onChange,
}: {
  value: string;
  tone: Tone;
  options: string[];
  onChange: (next: string) => void | Promise<void>;
}) {
  const tones: Record<Tone, string> = {
    neutral: "border-ink/15 text-foreground/65 bg-mist/30 hover:border-ink/30",
    ok: "border-emerald-700/30 text-emerald-800 bg-emerald-50/40 hover:border-emerald-700/50",
    warn: "border-amber-700/30 text-amber-800 bg-amber-50/40 hover:border-amber-700/50",
    bad: "border-red-700/30 text-red-800 bg-red-50/40 hover:border-red-700/50",
  };
  return (
    <span className={`relative inline-flex items-center gap-1.5 border h-6 pl-2 pr-1 text-[10px] tracking-[0.14em] uppercase transition-colors ${tones[tone]}`}>
      <StatusDot tone={tone} />
      <span>{humanize(value)}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Change status"
      >
        {options.map((s) => (
          <option key={s} value={s}>{humanize(s)}</option>
        ))}
      </select>
    </span>
  );
}

function humanize(s: string | null | undefined) {
  if (!s) return "—";
  return s.replace(/_/g, " ");
}

function shipAddress(o: any) {
  const parts = [o.shipping_address_1, o.shipping_address_2, o.shipping_city, o.shipping_state, o.shipping_zip, o.shipping_country]
    .filter(Boolean);
  return parts.join(", ");
}

function countryFlag(code?: string | null) {
  if (!code) return "";
  const c = code.trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "";
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

function itemCount(o: any) {
  const items = Array.isArray(o.items) ? o.items : [];
  return items.reduce((s: number, it: any) => s + Number(it?.quantity ?? it?.qty ?? 1), 0);
}

function itemSummary(o: any) {
  const items = Array.isArray(o.items) ? o.items : [];
  return items
    .map((it: any) => `${it?.quantity ?? it?.qty ?? 1}× ${it?.product_name ?? it?.name ?? "Item"}`)
    .join("\n");
}

function deriveAlerts(o: any) {
  const out: string[] = [];
  const now = Date.now();
  if (o.payment_expires_at && new Date(o.payment_expires_at).getTime() < now && o.payment_status !== "confirmed") {
    out.push("BTC invoice expired");
  }
  if (o.payment_status === "awaiting_payment" && o.created_at && now - new Date(o.created_at).getTime() > 1000 * 60 * 60 * 48) {
    out.push("Payment overdue");
  }
  if ((o.payment_status === "confirmed" || o.status === "paid") && !["shipped","delivered"].includes(o.fulfillment_status)) {
    out.push("Paid · not shipped");
  }
  if (!o.shipping_address_1 && !["cancelled","refunded"].includes(o.fulfillment_status)) {
    out.push("Address missing");
  }
  if (["shipped","delivered"].includes(o.fulfillment_status) && !o.tracking_number) {
    out.push("Tracking missing");
  }
  if (Number(o.total_usd ?? 0) >= 2500) out.push("High value");
  if (o.risk_flag) out.push("Flagged");
  return out;
}

// ───── Main panel ─────
export function OrdersPanel({ initialQuickFilter = "all" }: { initialQuickFilter?: "all"|"unpaid"|"unshipped"|"flagged"|"refunded" } = {}) {
  const qc = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const bulk = useServerFn(bulkOrderAction);
  const removeOrder = useServerFn(deleteOrder);
  const update = useServerFn(patchOrder);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
  });

  const [q, setQ] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<"all"|"unpaid"|"unshipped"|"flagged"|"refunded">("all");
  useEffect(() => { if (initialQuickFilter) setQuickFilter(initialQuickFilter); }, [initialQuickFilter]);
  const [sort, setSort] = useState<"newest"|"oldest"|"value"|"awaiting"|"priority">("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25|50|100>(50);

  useEffect(() => { setPage(1); }, [q, paymentFilter, fulfillmentFilter, quickFilter, sort, pageSize]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
    qc.invalidateQueries({ queryKey: ["admin-alerts"] });
    if (detailId) qc.invalidateQueries({ queryKey: ["admin-order", detailId] });
  };

  // ── Inline status mutation (table dropdowns) ──
  const changePayment = async (o: any, next: string) => {
    if (next === o.payment_status) return;
    const patch: Record<string, any> = { payment_status: next };
    if (["paid", "confirmed", "btc_received"].includes(next)) {
      if (!o.payment_received_at) patch.payment_received_at = new Date().toISOString();
      patch.status = "paid";
    }
    if (next === "refunded") patch.status = "refunded";
    try {
      await update({ data: { id: o.id, patch } });
      toast.success(`Payment → ${humanize(next)}`);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  const changeFulfillment = async (o: any, next: string) => {
    if (next === o.fulfillment_status) return;
    const patch: Record<string, any> = { fulfillment_status: next };
    if (next === "shipped") {
      if (!o.shipped_at) patch.shipped_at = new Date().toISOString();
      patch.status = "shipped";
      if (!o.tracking_number) {
        const t = typeof window !== "undefined"
          ? window.prompt("Tracking number (optional — leave blank to fill later):", "")
          : "";
        if (t && t.trim()) patch.tracking_number = t.trim();
        if (!o.carrier) {
          const c = typeof window !== "undefined"
            ? window.prompt("Carrier (USPS / UPS / FedEx / DHL / Other) — optional:", "USPS")
            : "";
          if (c && c.trim()) patch.carrier = c.trim();
        }
      }
    }
    if (next === "delivered") {
      if (!o.delivered_at) patch.delivered_at = new Date().toISOString();
      patch.status = "delivered";
    }
    if (next === "cancelled") patch.status = "cancelled";
    try {
      await update({ data: { id: o.id, patch } });
      toast.success(`Fulfillment → ${humanize(next)}`);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = (orders as any[]).filter((o) => {
      if (paymentFilter !== "all" && o.payment_status !== paymentFilter) return false;
      if (fulfillmentFilter !== "all" && o.fulfillment_status !== fulfillmentFilter) return false;
      if (quickFilter === "unpaid" && isPaidLike(o)) return false;
      if (quickFilter === "unshipped" && (!isPaidLike(o) || ["shipped","delivered","cancelled"].includes(o.fulfillment_status))) return false;
      if (quickFilter === "flagged" && !o.risk_flag) return false;
      if (quickFilter === "refunded" && o.payment_status !== "refunded") return false;
      if (needle) {
        const hay = [
          o.order_number, o.customer_email, o.customer_name,
          o.tracking_number, o.btc_tx_hash, o.btc_address,
          o.shipping_name, o.shipping_city,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "value") return Number(b.total_usd) - Number(a.total_usd);
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "awaiting") {
        const aw = (x: any) => (x.payment_status === "awaiting_payment" ? -1 : 0);
        return aw(a) - aw(b);
      }
      if (sort === "priority") {
        const score = (x: any) => (deriveAlerts(x).length > 0 ? -1 : 0);
        return score(a) - score(b);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return rows;
  }, [orders, q, paymentFilter, fulfillmentFilter, quickFilter, sort]);

  const allSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) filtered.forEach((o) => next.delete(o.id));
    else filtered.forEach((o) => next.add(o.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const doBulk = async (action: any, label: string, destructive = false) => {
    if (!selected.size) return;
    if (destructive && !confirm(`${label} ${selected.size} order(s)?`)) return;
    await bulk({ data: { ids: Array.from(selected), action } });
    setSelected(new Set());
    refresh();
  };

  const exportCsv = () => {
    const rows = selected.size ? filtered.filter((o) => selected.has(o.id)) : filtered;
    const header = ["order_number","customer_email","customer_name","payment_status","fulfillment_status","total_usd","tracking_number","shipping_city","shipping_country","created_at"];
    const csv = [
      header.join(","),
      ...rows.map((o: any) => header.map((k) => {
        const v = (o as any)[k];
        const s = v == null ? "" : String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => {
    const rows = orders as any[];
    return {
      total: rows.length,
      awaiting: rows.filter(isAwaitingPayment).length,
      unshipped: rows.filter((o) => isPaidLike(o) && !["shipped","delivered","cancelled"].includes(o.fulfillment_status)).length,
      flagged: rows.filter((o) => o.risk_flag).length,
      alerts: rows.reduce((s, o) => s + deriveAlerts(o).length, 0),
    };
  }, [orders]);

  return (
    <div className="space-y-5" onClick={() => menuOpen && setMenuOpen(null)}>
      {/* Health strip — clickable filter chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border border-ink/10">
        {([
          ["Total",            counts.total,     "all"],
          ["Awaiting payment", counts.awaiting,  "unpaid"],
          ["Unshipped paid",   counts.unshipped, "unshipped"],
          ["Flagged",          counts.flagged,   "flagged"],
          ["Active alerts",    counts.alerts,    "all"],
        ] as const).map(([label, value, qf], i) => {
          const active = quickFilter === qf && qf !== "all" ? true : (qf === "all" && quickFilter === "all" && label === "Total");
          return (
            <button
              key={i}
              type="button"
              onClick={() => setQuickFilter(qf as any)}
              className={`text-left p-4 transition-colors hover:bg-mist/30 ${i > 0 ? "border-l border-ink/10" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} ${active ? "bg-mist/40" : ""}`}
            >
              <div className="text-[9.5px] tracking-[0.28em] uppercase text-foreground/55">{label}</div>
              <div className="mt-1.5 text-[22px] font-medium tabular-nums text-ink">{value as number}</div>
            </button>
          );
        })}
      </div>

      <Card
        title="Order management"
        hint="Payment reconciliation · fulfillment workflow · operational notes"
      >
        {/* Toolbar: search + filters + sort + export */}
        <div className="px-5 py-2.5 border-b border-ink/10 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, email, name, tracking, tx…"
            className="h-8 flex-1 min-w-[220px] border border-ink/15 bg-background px-2.5 text-[12px] placeholder:text-foreground/35 focus:outline-none focus:border-ink/40"
          />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-8 border border-ink/15 bg-background px-2 text-[11px] uppercase tracking-[0.1em] text-foreground/70"
          >
            <option value="all">All payment</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="h-8 border border-ink/15 bg-background px-2 text-[11px] uppercase tracking-[0.1em] text-foreground/70"
          >
            <option value="all">All fulfillment</option>
            {FULFILLMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-8 border border-ink/15 bg-background px-2 text-[11px] uppercase tracking-[0.1em] text-foreground/70"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="value">Highest value</option>
            <option value="awaiting">Awaiting first</option>
            <option value="priority">Alerts first</option>
          </select>
          {(q || paymentFilter !== "all" || fulfillmentFilter !== "all" || quickFilter !== "all" || sort !== "newest") && (
            <button
              type="button"
              onClick={() => { setQ(""); setPaymentFilter("all"); setFulfillmentFilter("all"); setQuickFilter("all"); setSort("newest"); }}
              className="text-[10px] tracking-[0.16em] uppercase text-foreground/50 hover:text-ink"
            >
              Clear
            </button>
          )}
          <GhostButton onClick={exportCsv} className="!h-8 !text-[10.5px]">Export CSV</GhostButton>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="sticky top-0 z-10 px-5 py-2.5 bg-mist/60 backdrop-blur border-b border-ink/15 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-foreground/70 tracking-[0.14em] uppercase text-[10.5px]">
              {selected.size} selected
            </span>
            <div className="flex-1" />
            <GhostButton onClick={() => doBulk("mark_processing", "Mark processing")} className="!h-7 !text-[10px]">Processing</GhostButton>
            <GhostButton onClick={() => doBulk("mark_packed", "Mark packed")} className="!h-7 !text-[10px]">Packed</GhostButton>
            <GhostButton onClick={() => doBulk("mark_shipped", "Mark shipped")} className="!h-7 !text-[10px]">Shipped</GhostButton>
            <GhostButton onClick={() => doBulk("mark_paid", "Mark paid")} className="!h-7 !text-[10px]">Paid</GhostButton>
            <GhostButton onClick={() => doBulk("archive", "Archive", true)} className="!h-7 !text-[10px]">Archive</GhostButton>
            <GhostButton
              onClick={() => doBulk("delete", `Permanently delete`, true)}
              className="!h-7 !text-[10px] !border-red-700/30 !text-red-700 hover:!bg-red-700 hover:!text-background"
            >
              Delete
            </GhostButton>
            <button onClick={() => setSelected(new Set())} className="text-[10px] tracking-[0.16em] uppercase text-foreground/50 hover:text-ink">Clear</button>
          </div>
        )}

        {isLoading ? (
          <Empty>Loading…</Empty>
        ) : !filtered.length ? (
          <Empty>
            <div>No orders match these filters.</div>
            {!orders.length && (
              <div className="mt-2 text-foreground/45">
                Paid BTC orders and manually created orders will appear here.
              </div>
            )}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10 bg-mist/20">
                <tr>
                  <th className="w-8 px-3 py-2.5">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  <th className="text-left font-medium px-4 py-2.5">Order</th>
                  <th className="text-left font-medium px-4 py-2.5">Customer</th>
                  <th className="text-left font-medium px-4 py-2.5">Payment</th>
                  <th className="text-left font-medium px-4 py-2.5">Fulfillment</th>
                  <th className="text-right font-medium px-4 py-2.5">Total</th>
                  <th className="text-left font-medium px-4 py-2.5">Ship to</th>
                  <th className="text-left font-medium px-4 py-2.5">Date</th>
                  <th className="text-left font-medium px-4 py-2.5">Alerts</th>
                  <th className="w-12 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o: any) => {
                  const alerts = deriveAlerts(o);
                  return (
                    <tr
                      key={o.id}
                      className={`border-b border-ink/5 hover:bg-mist/20 transition-colors cursor-pointer ${selected.has(o.id) ? "bg-mist/30" : ""}`}
                      onClick={() => setDetailId(o.id)}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} />
                      </td>
                      <td className="px-4 py-3 font-mono text-[11.5px]">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="text-ink">{o.customer_name || o.customer_email}</div>
                        {o.customer_name && <div className="text-[10.5px] text-foreground/50">{o.customer_email}</div>}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <InlineStatusSelect
                          value={o.payment_status}
                          tone={paymentTone(o.payment_status)}
                          options={PAYMENT_STATUSES as unknown as string[]}
                          onChange={(v) => changePayment(o, v)}
                        />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <InlineStatusSelect
                          value={o.fulfillment_status}
                          tone={fulfillmentTone(o.fulfillment_status)}
                          options={FULFILLMENT_STATUSES as unknown as string[]}
                          onChange={(v) => changeFulfillment(o, v)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatUSD(o.total_usd)}</td>
                      <td className="px-4 py-3 text-foreground/65 text-[11.5px]">
                        {o.shipping_city ? `${o.shipping_city}${o.shipping_state ? ", " + o.shipping_state : ""}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground/60">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3">
                        {isComplete(o) ? (
                          <span className="inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.14em] uppercase text-emerald-800">
                            <StatusDot tone="ok" /> Complete
                          </span>
                        ) : alerts.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-[10.5px] text-amber-800" title={alerts.join(" · ")}>
                            <StatusDot tone="warn" />
                            {alerts.length}
                          </span>
                        ) : <span className="text-foreground/30 text-[11px]">—</span>}
                      </td>
                      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button
                            className="px-2 py-1 text-foreground/55 hover:text-ink text-[14px] leading-none"
                            onClick={() => setMenuOpen(menuOpen === o.id ? null : o.id)}
                          >⋯</button>
                          {menuOpen === o.id && (
                            <div className="absolute right-0 top-7 z-20 w-44 border border-ink/15 bg-background shadow-md text-[11.5px]">
                              {[
                                ["View", () => setDetailId(o.id)],
                                ["Copy email", () => navigator.clipboard.writeText(o.customer_email ?? "")],
                                ["Copy address", () => navigator.clipboard.writeText(shipAddress(o))],
                                ["Mark paid", async () => { await bulk({ data: { ids: [o.id], action: "mark_paid" } }); refresh(); }],
                                ["Mark shipped", async () => { await bulk({ data: { ids: [o.id], action: "mark_shipped" } }); refresh(); }],
                                ["Archive", async () => { await bulk({ data: { ids: [o.id], action: "archive" } }); refresh(); }],
                                ["Delete", async () => {
                                  if (!confirm("Delete this order?")) return;
                                  await removeOrder({ data: { id: o.id } }); refresh();
                                }],
                              ].map(([label, fn]) => (
                                <button
                                  key={label as string}
                                  className="block w-full text-left px-3 py-2 hover:bg-mist/40 text-foreground/80"
                                  onClick={() => { setMenuOpen(null); (fn as any)(); }}
                                >{label as string}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {detailId && (
        <OrderDetailDrawer
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

// ───── Detail drawer ─────
function OrderDetailDrawer({ orderId, onClose, onChanged }: { orderId: string; onClose: () => void; onChanged: () => void }) {
  const fetchDetail = useServerFn(getOrderDetail);
  const update = useServerFn(patchOrder);
  const removeOrder = useServerFn(deleteOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => fetchDetail({ data: { id: orderId } }),
  });

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Lazy init form from server data
  const o = data?.order;
  if (o && !form) setForm({ ...o });

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const save = async (patch: Record<string, any>) => {
    setSaving(true);
    try {
      await update({ data: { id: orderId, patch } });
      onChanged();
      toast.success("Saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  };

  const saveAll = async () => {
    if (!form) return;
    const keys = [
      "payment_status","fulfillment_status","risk_flag","tracking_number","carrier",
      "shipping_method","shipped_at","delivered_at","payment_received_at","payment_expires_at",
      "btc_tx_hash","btc_confirmations","btc_amount","btc_address",
      "customer_name","customer_email","shipping_name","shipping_address_1","shipping_address_2",
      "shipping_city","shipping_state","shipping_zip","shipping_country","internal_notes",
    ];
    const patch: Record<string, any> = {};
    keys.forEach((k) => {
      let v = form[k];
      if (k === "btc_amount" || k === "btc_confirmations") {
        v = v === "" || v == null ? null : Number(v);
        if (Number.isNaN(v)) v = null;
      }
      if (k === "customer_email") {
        v = (v ?? "").trim();
        if (!v) return; // email is required, skip if blank
      }
      patch[k] = v ?? null;
    });
    await save(patch);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete order ${o?.order_number ?? ""}? This cannot be undone.`)) return;
    try {
      await removeOrder({ data: { id: orderId } });
      toast.success("Order deleted");
      onChanged();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  };

  const copy = (text: string, label: string) => {
    if (!text) { toast.error(`No ${label}`); return; }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[640px] lg:w-[760px] bg-background border-l border-ink/15 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-background px-5 py-4 border-b border-ink/10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.24em] uppercase text-foreground/55">Order</div>
            <div className="mt-0.5 font-mono text-[14px] text-ink">{o?.order_number ?? "…"}</div>
            {o && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge tone={paymentTone(o.payment_status)}>{humanize(o.payment_status)}</StatusBadge>
                <StatusBadge tone={fulfillmentTone(o.fulfillment_status)}>{humanize(o.fulfillment_status)}</StatusBadge>
                {isComplete(o) && <StatusBadge tone="ok">Complete</StatusBadge>}
                {o.risk_flag && <StatusBadge tone="bad">Flagged</StatusBadge>}
                {o.archived_at && <StatusBadge tone="neutral">Archived</StatusBadge>}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <PrimaryButton onClick={saveAll} disabled={saving || !form}>{saving ? "Saving…" : "Save"}</PrimaryButton>
            <GhostButton onClick={onClose}>Close</GhostButton>
          </div>
        </header>

        {isLoading || !o || !form ? (
          <div className="p-6 text-[12px] text-foreground/55">Loading…</div>
        ) : (
          <div className="p-5 space-y-5">
            {/* A. Order summary */}
            <Section title="Order summary">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KV label="Order" value={<span className="font-mono text-[12px]">{o.order_number}</span>} />
                <KV label="Total" value={formatUSD(o.total_usd)} />
                <KV label="Created" value={formatDate(o.created_at)} />
                <KV label="Status" value={isComplete(o) ? <span className="text-emerald-800">Complete</span> : humanize(o.status)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Payment status">
                  <SelectInput value={form.payment_status ?? "awaiting_payment"} onChange={(e) => set("payment_status", e.target.value)}>
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Fulfillment status">
                  <SelectInput value={form.fulfillment_status ?? "not_started"} onChange={(e) => set("fulfillment_status", e.target.value)}>
                    {FULFILLMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                  </SelectInput>
                </Field>
              </div>
              {/* Quick actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <GhostButton onClick={() => save({ payment_status: "confirmed", payment_received_at: new Date().toISOString(), status: "paid" })}>Mark paid</GhostButton>
                <GhostButton onClick={() => save({ fulfillment_status: "shipped", shipped_at: new Date().toISOString(), status: "shipped" })}>Mark shipped</GhostButton>
                <GhostButton onClick={() => save({ payment_status: "refunded", status: "refunded" })}>Refund</GhostButton>
                <GhostButton onClick={() => save({ fulfillment_status: "cancelled", status: "cancelled" })}>Cancel</GhostButton>
                <div className="relative">
                  <GhostButton onClick={(e: any) => { e.stopPropagation(); setMoreOpen((v) => !v); }}>More ⋯</GhostButton>
                  {moreOpen && (
                    <div className="absolute right-0 top-9 z-20 w-48 border border-ink/15 bg-background shadow-md text-[11.5px]">
                      {[
                        [o.risk_flag ? "Unflag" : "Flag", () => save({ risk_flag: !o.risk_flag })],
                        ["Mark packed", () => save({ fulfillment_status: "packed" })],
                        ["Mark delivered", () => save({ fulfillment_status: "delivered", delivered_at: new Date().toISOString(), status: "delivered" })],
                        [o.archived_at ? "Unarchive" : "Archive", () => save({ archived_at: o.archived_at ? null : new Date().toISOString() })],
                      ].map(([label, fn]) => (
                        <button
                          key={label as string}
                          className="block w-full text-left px-3 py-2 hover:bg-mist/40 text-foreground/80"
                          onClick={() => { setMoreOpen(false); (fn as any)(); }}
                        >{label as string}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* B. Customer */}
            <Section title="Customer">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name"><TextInput value={form.customer_name ?? ""} onChange={(e) => set("customer_name", e.target.value)} /></Field>
                <Field label="Email">
                  <div className="flex gap-2">
                    <TextInput
                      type="email"
                      value={form.customer_email ?? ""}
                      onChange={(e) => set("customer_email", e.target.value)}
                    />
                    <GhostButton type="button" onClick={() => copy(form.customer_email ?? "", "Email")}>Copy</GhostButton>
                  </div>
                </Field>
              </div>
              {data?.customerStats && (
                <div className="mt-3 grid grid-cols-3 gap-3 text-[11.5px]">
                  <KV label="Total orders" value={data.customerStats.total_orders} />
                  <KV label="Lifetime spend" value={formatUSD(data.customerStats.lifetime_spend)} />
                  <KV label="First order" value={formatDate(data.customerStats.first_order_at)} />
                </div>
              )}
            </Section>

            {/* C. Shipping */}
            <Section title="Shipping">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Recipient"><TextInput value={form.shipping_name ?? ""} onChange={(e) => set("shipping_name", e.target.value)} /></Field>
                <Field label="Address line 1"><TextInput value={form.shipping_address_1 ?? ""} onChange={(e) => set("shipping_address_1", e.target.value)} /></Field>
                {form.shipping_address_2 ? (
                  <Field label="Address line 2"><TextInput value={form.shipping_address_2 ?? ""} onChange={(e) => set("shipping_address_2", e.target.value)} /></Field>
                ) : null}
                <Field label="City"><TextInput value={form.shipping_city ?? ""} onChange={(e) => set("shipping_city", e.target.value)} /></Field>
                <Field label="State / Region"><TextInput value={form.shipping_state ?? ""} onChange={(e) => set("shipping_state", e.target.value)} /></Field>
                <Field label="ZIP / Postal"><TextInput value={form.shipping_zip ?? ""} onChange={(e) => set("shipping_zip", e.target.value)} /></Field>
                <Field label="Country"><TextInput value={form.shipping_country ?? ""} onChange={(e) => set("shipping_country", e.target.value)} /></Field>
                <Field label="Carrier">
                  <SelectInput value={form.carrier ?? ""} onChange={(e) => set("carrier", e.target.value || null)}>
                    <option value="">—</option>
                    {["USPS","UPS","FedEx","DHL","Other"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Tracking number">
                  <div className="flex gap-2">
                    <TextInput value={form.tracking_number ?? ""} onChange={(e) => set("tracking_number", e.target.value)} />
                    <GhostButton type="button" onClick={() => copy(form.tracking_number ?? "", "Tracking")}>Copy</GhostButton>
                  </div>
                </Field>
              </div>
              <div className="mt-3 flex gap-2">
                <GhostButton type="button" onClick={() => copy(shipAddress(form), "Address")}>Copy full address</GhostButton>
                {!form.shipping_address_2 && (
                  <GhostButton type="button" onClick={() => set("shipping_address_2", " ")}>+ Address line 2</GhostButton>
                )}
              </div>
            </Section>

            {/* D. BTC payment */}
            <Section title="BTC payment">
              <div className="grid grid-cols-2 gap-3">
                <KV label="USD total" value={formatUSD(o.total_usd)} />
                <Field label="Payment status">
                  <SelectInput value={form.payment_status ?? "awaiting_payment"} onChange={(e) => set("payment_status", e.target.value)}>
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                  </SelectInput>
                </Field>
                <Field label="BTC owed at checkout">
                  <div className="rounded-md border border-line bg-mist/30 px-3 py-2 font-mono text-[12px] text-ink">
                    {o.btc_amount != null && Number(o.btc_amount) > 0
                      ? `${Number(o.btc_amount).toFixed(8)} BTC`
                      : "—"}
                  </div>
                  <p className="mt-1 text-[10px] text-ink-soft">
                    BTC total quoted to the customer at checkout. Verify their
                    proof of payment matches this amount.
                  </p>
                </Field>
                <Field label="BTC confirmations">
                  <TextInput
                    type="number"
                    min={0}
                    value={form.btc_confirmations ?? ""}
                    onChange={(e) => set("btc_confirmations", e.target.value)}
                  />
                </Field>
                <Field label="Received at">
                  <TextInput
                    type="datetime-local"
                    value={form.payment_received_at ? new Date(form.payment_received_at).toISOString().slice(0,16) : ""}
                    onChange={(e) => set("payment_received_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                </Field>
                <Field label="Expires at">
                  <TextInput
                    type="datetime-local"
                    value={form.payment_expires_at ? new Date(form.payment_expires_at).toISOString().slice(0,16) : ""}
                    onChange={(e) => set("payment_expires_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Field label="BTC address">
                  <div className="flex gap-2">
                    <TextInput
                      value={form.btc_address ?? ""}
                      onChange={(e) => set("btc_address", e.target.value)}
                      className="font-mono !text-[11.5px]"
                    />
                    <GhostButton type="button" onClick={() => copy(form.btc_address ?? "", "BTC address")}>Copy</GhostButton>
                  </div>
                </Field>
                <Field label="Transaction hash">
                  <div className="flex gap-2">
                    <TextInput value={form.btc_tx_hash ?? ""} onChange={(e) => set("btc_tx_hash", e.target.value)} className="font-mono !text-[11.5px]" />
                    <GhostButton type="button" onClick={() => copy(form.btc_tx_hash ?? "", "Tx hash")}>Copy</GhostButton>
                  </div>
                </Field>
              </div>
            </Section>

            {/* D2. Customer-submitted proof of payment */}
            <Section title="Customer payment proof">
              {!o.payment_proof_url && !o.payment_tx_id ? (
                <div className="text-[11.5px] text-foreground/45 py-2">
                  No proof of payment submitted by the customer.
                </div>
              ) : (
                <div className="space-y-3">
                  {o.payment_proof_url && (
                    <div>
                      <div className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 mb-1.5">— Screenshot</div>
                      <a
                        href={o.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-ink/15 bg-mist/30 hover:border-ink/40 transition-colors rounded-[3px] overflow-hidden max-w-md"
                        title="Open full-size in new tab"
                      >
                        <img
                          src={o.payment_proof_url}
                          alt="Customer proof of payment"
                          className="block w-full max-h-80 object-contain bg-background"
                        />
                      </a>
                      <div className="mt-2 flex gap-2">
                        <a
                          href={o.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-ink/15 text-[10.5px] tracking-[0.18em] uppercase text-foreground/70 hover:bg-mist/40"
                        >
                          Open
                        </a>
                        <GhostButton type="button" onClick={() => copy(o.payment_proof_url ?? "", "Proof URL")}>Copy URL</GhostButton>
                      </div>
                    </div>
                  )}
                  {o.payment_tx_id && (
                    <div>
                      <div className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 mb-1.5">— Customer-provided TX ID / note</div>
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0 px-3 py-2 border border-ink/15 bg-mist/20 font-mono text-[11.5px] text-ink break-all whitespace-pre-wrap">
                          {o.payment_tx_id}
                        </div>
                        <GhostButton type="button" onClick={() => copy(o.payment_tx_id ?? "", "TX ID")}>Copy</GhostButton>
                        {!form.btc_tx_hash && (
                          <GhostButton type="button" onClick={() => set("btc_tx_hash", o.payment_tx_id)}>Use as TX hash</GhostButton>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* E. Items */}
            <Section title="Order items">
              {data.items.length === 0 ? (
                <div className="text-[11.5px] text-foreground/45 py-2">No items.</div>
              ) : (
                <table className="w-full text-[12px]">
                  <thead className="text-[10px] tracking-[0.16em] uppercase text-foreground/55 border-b border-ink/10">
                    <tr>
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-left py-2">Lot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((it: any) => (
                      <tr key={it.id} className="border-b border-ink/5">
                        <td className="py-2 text-ink">{it.product_name ?? it.product_id}</td>
                        <td className="py-2 text-right tabular-nums">{it.quantity}</td>
                        <td className="py-2 text-right tabular-nums">{formatUSD(it.unit_price)}</td>
                        <td className="py-2 font-mono text-[11px] text-foreground/65">{it.lot_number ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>

            {/* F. Notes */}
            <Section title="Notes">
              <Field label="Internal note">
                <textarea
                  className="w-full min-h-[60px] p-3 text-[13px] border border-ink/15 bg-background focus:border-ink/40 outline-none"
                  value={form.internal_notes ?? ""}
                  onChange={(e) => set("internal_notes", e.target.value)}
                />
              </Field>
              <div className="mt-4">
                <InternalNotes entityType="order" entityId={orderId} />
              </div>
            </Section>

            {/* G. Advanced */}
            <section className="border border-ink/10 bg-background">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="w-full px-4 py-2.5 border-b border-ink/10 text-[10.5px] tracking-[0.22em] uppercase text-foreground/65 flex items-center justify-between hover:bg-mist/20"
              >
                <span>Advanced details</span>
                <span className="text-foreground/45">{advancedOpen ? "−" : "+"}</span>
              </button>
              {advancedOpen && (
                <div className="p-4 grid grid-cols-2 gap-3">
                  <Field label="Shipping method"><TextInput value={form.shipping_method ?? ""} onChange={(e) => set("shipping_method", e.target.value)} placeholder="Standard / Express" /></Field>
                  <Field label="Shipped at"><TextInput type="datetime-local" value={toLocal(form.shipped_at)} onChange={(e) => set("shipped_at", fromLocal(e.target.value))} /></Field>
                  <Field label="Delivered at"><TextInput type="datetime-local" value={toLocal(form.delivered_at)} onChange={(e) => set("delivered_at", fromLocal(e.target.value))} /></Field>
                  <Field label="BTC amount"><TextInput type="number" step="0.00000001" value={form.btc_amount ?? ""} onChange={(e) => set("btc_amount", e.target.value ? Number(e.target.value) : null)} /></Field>
                  <Field label="BTC address"><TextInput value={form.btc_address ?? ""} onChange={(e) => set("btc_address", e.target.value)} /></Field>
                  <Field label="Confirmations"><TextInput type="number" min="0" value={form.btc_confirmations ?? 0} onChange={(e) => set("btc_confirmations", Number(e.target.value || 0))} /></Field>
                  <Field label="Payment received at"><TextInput type="datetime-local" value={toLocal(form.payment_received_at)} onChange={(e) => set("payment_received_at", fromLocal(e.target.value))} /></Field>
                  <Field label="Payment expires at"><TextInput type="datetime-local" value={toLocal(form.payment_expires_at)} onChange={(e) => set("payment_expires_at", fromLocal(e.target.value))} /></Field>
                </div>
              )}
            </section>

            {/* H. Danger zone */}
            <section className="border border-red-700/20 bg-red-50/30">
              <header className="px-4 py-2.5 border-b border-red-700/15 text-[10.5px] tracking-[0.22em] uppercase text-red-800/80">Danger zone</header>
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="text-[11.5px] text-foreground/70">
                  Permanently delete this order and its items. This action cannot be undone.
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="shrink-0 h-8 px-3 text-[11px] tracking-[0.14em] uppercase border border-red-700/40 text-red-800 bg-background hover:bg-red-700 hover:text-white transition-colors"
                >
                  Delete order
                </button>
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink/10 bg-background">
      <header className="px-4 py-2.5 border-b border-ink/10 text-[10.5px] tracking-[0.22em] uppercase text-foreground/65">{title}</header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-ink/10 p-3">
      <div className="text-[9.5px] tracking-[0.22em] uppercase text-foreground/55">{label}</div>
      <div className="mt-1 text-ink tabular-nums">{value}</div>
    </div>
  );
}

function toLocal(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocal(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}