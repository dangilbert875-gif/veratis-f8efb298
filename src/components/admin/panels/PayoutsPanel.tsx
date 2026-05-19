import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPayouts, upsertPayout, deletePayout } from "@/lib/admin.functions";
import { Card, Empty, Field, GhostButton, PrimaryButton, SelectInput, StatusPill, TextArea, TextInput, formatDate, formatUSD } from "../ui";

const STATUSES = ["pending", "approved", "sent", "cancelled"] as const;
type Status = typeof STATUSES[number];
type Draft = { id?: string; partner_id: string; amount_usd: number; btc_amount: number | null; btc_address: string | null; status: Status; notes: string | null; paid_at: string | null };
const empty: Draft = { partner_id: "", amount_usd: 0, btc_amount: null, btc_address: null, status: "pending", notes: null, paid_at: null };

export function PayoutsPanel() {
  const fetchList = useServerFn(listPayouts);
  const save = useServerFn(upsertPayout);
  const remove = useServerFn(deletePayout);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-payouts"], queryFn: () => fetchList() });
  const [draft, setDraft] = useState<Draft | null>(null);

  return (
    <div className="space-y-5">
      <Card title="Payout ledger" hint="Bitcoin settlements to research partners" action={<PrimaryButton onClick={() => setDraft({ ...empty })}>New payout</PrimaryButton>}>
        {isLoading ? <Empty>Loading…</Empty> : !data.length ? <Empty>No payouts yet.</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10"><tr>
              <th className="text-left font-medium px-5 py-3">Partner</th>
              <th className="text-right font-medium px-5 py-3">Amount</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-left font-medium px-5 py-3">Paid</th>
              <th />
            </tr></thead>
            <tbody>{data.map((p: any) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="px-5 py-3">{p.profiles?.email ?? p.partner_id.slice(0,8)}</td>
                <td className="px-5 py-3 text-right tabular-nums">{formatUSD(p.amount_usd)}</td>
                <td className="px-5 py-3"><StatusPill tone={p.status === "sent" ? "ok" : p.status === "cancelled" ? "bad" : "warn"}>{p.status}</StatusPill></td>
                <td className="px-5 py-3 text-foreground/60">{formatDate(p.paid_at)}</td>
                <td className="px-5 py-3 text-right"><button className="text-[10.5px] tracking-[0.16em] uppercase text-foreground/55 hover:text-ink" onClick={() => setDraft({ id: p.id, partner_id: p.partner_id, amount_usd: Number(p.amount_usd), btc_amount: p.btc_amount ? Number(p.btc_amount) : null, btc_address: p.btc_address, status: p.status, notes: p.notes, paid_at: p.paid_at })}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
      {draft && (
        <Card title={draft.id ? "Edit payout" : "New payout"}>
          <form className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => { e.preventDefault(); await save({ data: draft as any }); setDraft(null); qc.invalidateQueries({ queryKey: ["admin-payouts"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] }); }}>
            <Field label="Partner user id (uuid)"><TextInput required value={draft.partner_id} onChange={(e) => setDraft({ ...draft, partner_id: e.target.value })} /></Field>
            <Field label="Status"><SelectInput value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</SelectInput></Field>
            <Field label="Amount USD"><TextInput type="number" step="0.01" min="0" value={draft.amount_usd} onChange={(e) => setDraft({ ...draft, amount_usd: Number(e.target.value) })} /></Field>
            <Field label="BTC amount"><TextInput type="number" step="0.00000001" min="0" value={draft.btc_amount ?? ""} onChange={(e) => setDraft({ ...draft, btc_amount: e.target.value ? Number(e.target.value) : null })} /></Field>
            <Field label="BTC address"><TextInput value={draft.btc_address ?? ""} onChange={(e) => setDraft({ ...draft, btc_address: e.target.value || null })} /></Field>
            <Field label="Paid at (ISO)"><TextInput value={draft.paid_at ?? ""} onChange={(e) => setDraft({ ...draft, paid_at: e.target.value || null })} placeholder="2026-05-20T12:00:00Z" /></Field>
            <div className="md:col-span-2"><Field label="Notes"><TextArea value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value || null })} /></Field></div>
            <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-ink/10">
              <div>{draft.id && <GhostButton type="button" onClick={async () => { if (!confirm("Delete?")) return; await remove({ data: { id: draft.id! } }); setDraft(null); qc.invalidateQueries({ queryKey: ["admin-payouts"] }); }}>Delete</GhostButton>}</div>
              <div className="flex gap-2"><GhostButton type="button" onClick={() => setDraft(null)}>Cancel</GhostButton><PrimaryButton type="submit">Save</PrimaryButton></div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}