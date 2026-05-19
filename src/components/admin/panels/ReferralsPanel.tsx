import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listReferrals, upsertReferral, deleteReferral } from "@/lib/admin.functions";
import { Card, Empty, Field, GhostButton, PrimaryButton, TextInput, formatUSD } from "../ui";

type Draft = { id?: string; partner_id: string; code: string; label: string | null; clicks: number; conversions: number; revenue_usd: number; commission_rate: number };
const empty: Draft = { partner_id: "", code: "", label: null, clicks: 0, conversions: 0, revenue_usd: 0, commission_rate: 0.1 };

export function ReferralsPanel() {
  const fetchList = useServerFn(listReferrals);
  const save = useServerFn(upsertReferral);
  const remove = useServerFn(deleteReferral);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-referrals"], queryFn: () => fetchList() });
  const [draft, setDraft] = useState<Draft | null>(null);

  return (
    <div className="space-y-5">
      <Card title="Referral codes" hint="Research-partner attribution" action={<PrimaryButton onClick={() => setDraft({ ...empty })}>New code</PrimaryButton>}>
        {isLoading ? <Empty>Loading…</Empty> : !data.length ? <Empty>No referrals yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10"><tr>
                <th className="text-left font-medium px-5 py-3">Code</th>
                <th className="text-left font-medium px-5 py-3">Partner</th>
                <th className="text-right font-medium px-5 py-3">Clicks</th>
                <th className="text-right font-medium px-5 py-3">Conv.</th>
                <th className="text-right font-medium px-5 py-3">Revenue</th>
                <th className="text-right font-medium px-5 py-3">Rate</th>
                <th />
              </tr></thead>
              <tbody>{data.map((r: any) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono">{r.code}</td>
                  <td className="px-5 py-3 text-foreground/70">{r.profiles?.email ?? r.partner_id.slice(0,8)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{r.clicks}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{r.conversions}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatUSD(r.revenue_usd)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{(Number(r.commission_rate)*100).toFixed(1)}%</td>
                  <td className="px-5 py-3 text-right"><button className="text-[10.5px] tracking-[0.16em] uppercase text-foreground/55 hover:text-ink" onClick={() => setDraft({ id: r.id, partner_id: r.partner_id, code: r.code, label: r.label, clicks: r.clicks, conversions: r.conversions, revenue_usd: Number(r.revenue_usd), commission_rate: Number(r.commission_rate) })}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
      {draft && (
        <Card title={draft.id ? "Edit referral" : "New referral"}>
          <form className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => { e.preventDefault(); await save({ data: draft as any }); setDraft(null); qc.invalidateQueries({ queryKey: ["admin-referrals"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] }); }}>
            <Field label="Partner user id (uuid)"><TextInput required value={draft.partner_id} onChange={(e) => setDraft({ ...draft, partner_id: e.target.value })} /></Field>
            <Field label="Code"><TextInput required value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></Field>
            <Field label="Label"><TextInput value={draft.label ?? ""} onChange={(e) => setDraft({ ...draft, label: e.target.value || null })} /></Field>
            <Field label="Commission (0–1)"><TextInput type="number" step="0.01" min="0" max="1" value={draft.commission_rate} onChange={(e) => setDraft({ ...draft, commission_rate: Number(e.target.value) })} /></Field>
            <Field label="Clicks"><TextInput type="number" min="0" value={draft.clicks} onChange={(e) => setDraft({ ...draft, clicks: Number(e.target.value) })} /></Field>
            <Field label="Conversions"><TextInput type="number" min="0" value={draft.conversions} onChange={(e) => setDraft({ ...draft, conversions: Number(e.target.value) })} /></Field>
            <Field label="Revenue USD"><TextInput type="number" step="0.01" min="0" value={draft.revenue_usd} onChange={(e) => setDraft({ ...draft, revenue_usd: Number(e.target.value) })} /></Field>
            <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-ink/10">
              <div>{draft.id && <GhostButton type="button" onClick={async () => { if (!confirm("Delete?")) return; await remove({ data: { id: draft.id! } }); setDraft(null); qc.invalidateQueries({ queryKey: ["admin-referrals"] }); }}>Delete</GhostButton>}</div>
              <div className="flex gap-2"><GhostButton type="button" onClick={() => setDraft(null)}>Cancel</GhostButton><PrimaryButton type="submit">Save</PrimaryButton></div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}