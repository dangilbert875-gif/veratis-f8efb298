import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOrders, upsertOrder, deleteOrder } from "@/lib/admin.functions";
import { Card, Empty, Field, GhostButton, PrimaryButton, SelectInput, StatusPill, TextArea, TextInput, formatDate, formatUSD } from "../ui";

const STATUSES = ["pending", "awaiting_payment", "paid", "shipped", "delivered", "cancelled", "refunded"] as const;
type Status = typeof STATUSES[number];

function toneFor(s: Status) {
  if (s === "paid" || s === "delivered" || s === "shipped") return "ok" as const;
  if (s === "pending" || s === "awaiting_payment") return "warn" as const;
  if (s === "cancelled" || s === "refunded") return "bad" as const;
  return "neutral" as const;
}

type Draft = {
  id?: string;
  order_number: string;
  customer_email: string;
  status: Status;
  total_usd: number;
  btc_amount: number | null;
  btc_address: string | null;
  notes: string | null;
};

const empty: Draft = {
  order_number: "",
  customer_email: "",
  status: "pending",
  total_usd: 0,
  btc_amount: null,
  btc_address: null,
  notes: null,
};

export function OrdersPanel() {
  const fetchOrders = useServerFn(listOrders);
  const saveOrder = useServerFn(upsertOrder);
  const removeOrder = useServerFn(deleteOrder);
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetchOrders() });
  const [draft, setDraft] = useState<Draft | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  return (
    <div className="space-y-5">
      <Card
        title="Orders ledger"
        hint="Bitcoin-settled, manually reconciled."
        action={<PrimaryButton onClick={() => setDraft({ ...empty })}>New order</PrimaryButton>}
      >
        {isLoading ? (
          <Empty>Loading…</Empty>
        ) : !orders.length ? (
          <Empty>No orders yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Order</th>
                  <th className="text-left font-medium px-5 py-3">Customer</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Total</th>
                  <th className="text-left font-medium px-5 py-3">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-ink/5">
                    <td className="px-5 py-3 font-mono text-[11.5px]">{o.order_number}</td>
                    <td className="px-5 py-3">{o.customer_email}</td>
                    <td className="px-5 py-3"><StatusPill tone={toneFor(o.status)}>{o.status.replace("_", " ")}</StatusPill></td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatUSD(o.total_usd)}</td>
                    <td className="px-5 py-3 text-foreground/60">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        className="text-[10.5px] tracking-[0.16em] uppercase text-foreground/55 hover:text-ink"
                        onClick={() => setDraft({
                          id: o.id,
                          order_number: o.order_number,
                          customer_email: o.customer_email,
                          status: o.status,
                          total_usd: Number(o.total_usd),
                          btc_amount: o.btc_amount ? Number(o.btc_amount) : null,
                          btc_address: o.btc_address,
                          notes: o.notes,
                        })}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {draft && (
        <Card title={draft.id ? "Edit order" : "New order"}>
          <form
            className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await saveOrder({ data: draft as any });
              setDraft(null);
              refresh();
            }}
          >
            <Field label="Order number">
              <TextInput required value={draft.order_number} onChange={(e) => setDraft({ ...draft, order_number: e.target.value })} />
            </Field>
            <Field label="Customer email">
              <TextInput required type="email" value={draft.customer_email} onChange={(e) => setDraft({ ...draft, customer_email: e.target.value })} />
            </Field>
            <Field label="Status">
              <SelectInput value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </SelectInput>
            </Field>
            <Field label="Total (USD)">
              <TextInput type="number" step="0.01" min="0" value={draft.total_usd} onChange={(e) => setDraft({ ...draft, total_usd: Number(e.target.value) })} />
            </Field>
            <Field label="BTC amount">
              <TextInput type="number" step="0.00000001" min="0" value={draft.btc_amount ?? ""} onChange={(e) => setDraft({ ...draft, btc_amount: e.target.value ? Number(e.target.value) : null })} />
            </Field>
            <Field label="BTC address">
              <TextInput value={draft.btc_address ?? ""} onChange={(e) => setDraft({ ...draft, btc_address: e.target.value || null })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <TextArea value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value || null })} />
              </Field>
            </div>
            <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-ink/10">
              <div>
                {draft.id && (
                  <GhostButton
                    type="button"
                    onClick={async () => {
                      if (!confirm("Delete this order?")) return;
                      await removeOrder({ data: { id: draft.id! } });
                      setDraft(null);
                      refresh();
                    }}
                  >
                    Delete
                  </GhostButton>
                )}
              </div>
              <div className="flex gap-2">
                <GhostButton type="button" onClick={() => setDraft(null)}>Cancel</GhostButton>
                <PrimaryButton type="submit">Save</PrimaryButton>
              </div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}