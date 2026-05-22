import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listReferrals, upsertReferral, deleteReferral } from "@/lib/admin.functions";
import { Card, Empty, Field, GhostButton, PrimaryButton, TextInput, formatUSD } from "../ui";

type Draft = {
  id?: string;
  code: string;
  label: string | null;
  discount_type: "percent" | "fixed";
  discount_amount: number;
  active: boolean;
  clicks: number;
  conversions: number;
  revenue_usd: number;
};
const empty: Draft = {
  code: "",
  label: null,
  discount_type: "percent",
  discount_amount: 10,
  active: true,
  clicks: 0,
  conversions: 0,
  revenue_usd: 0,
};

export function ReferralsPanel() {
  const fetchList = useServerFn(listReferrals);
  const save = useServerFn(upsertReferral);
  const remove = useServerFn(deleteReferral);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-referrals"], queryFn: () => fetchList() });
  const [draft, setDraft] = useState<Draft | null>(null);

  function formatDiscount(r: any) {
    const v = Number(r.discount_amount ?? 0);
    return r.discount_type === "fixed" ? `$${v.toFixed(2)} off` : `${v}% off`;
  }

  return (
    <div className="space-y-5">
      <Card title="Promo & referral codes" hint="Codes customers can enter at checkout" action={<PrimaryButton onClick={() => setDraft({ ...empty })}>New code</PrimaryButton>}>
        {isLoading ? <Empty>Loading…</Empty> : !data.length ? <Empty>No referrals yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10"><tr>
                <th className="text-left font-medium px-5 py-3">Code</th>
                <th className="text-left font-medium px-5 py-3">Label</th>
                <th className="text-left font-medium px-5 py-3">Discount</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Clicks</th>
                <th className="text-right font-medium px-5 py-3">Conv.</th>
                <th className="text-right font-medium px-5 py-3">Revenue</th>
                <th />
              </tr></thead>
              <tbody>{data.map((r: any) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono">{r.code}</td>
                  <td className="px-5 py-3 text-foreground/70">{r.label ?? "—"}</td>
                  <td className="px-5 py-3 tabular-nums">{formatDiscount(r)}</td>
                  <td className="px-5 py-3 text-[10.5px] uppercase tracking-[0.16em] text-foreground/55">{r.active === false ? "Inactive" : "Active"}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{r.clicks}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{r.conversions}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatUSD(r.revenue_usd)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      className="text-[10.5px] tracking-[0.16em] uppercase text-foreground/55 hover:text-ink"
                      onClick={() => setDraft({
                        id: r.id,
                        code: r.code,
                        label: r.label,
                        discount_type: (r.discount_type ?? "percent") as "percent" | "fixed",
                        discount_amount: Number(r.discount_amount ?? 0),
                        active: r.active !== false,
                        clicks: r.clicks ?? 0,
                        conversions: r.conversions ?? 0,
                        revenue_usd: Number(r.revenue_usd ?? 0),
                      })}
                    >Edit</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
      {draft && (
        <Card title={draft.id ? "Edit referral" : "New referral"}>
          <form className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e) => {
            e.preventDefault();
            await save({ data: { ...draft, code: draft.code.trim().toUpperCase() } as any });
            setDraft(null);
            qc.invalidateQueries({ queryKey: ["admin-referrals"] });
            qc.invalidateQueries({ queryKey: ["admin-overview"] });
          }}>
            <Field label="Code (used at checkout)">
              <TextInput required value={draft.code} placeholder="WELCOME10" onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
            </Field>
            <Field label="Label (internal)">
              <TextInput value={draft.label ?? ""} placeholder="Launch promo" onChange={(e) => setDraft({ ...draft, label: e.target.value || null })} />
            </Field>
            <Field label="Discount type">
              <select
                className="w-full h-9 px-2 text-[13px] bg-background border border-ink/15 rounded-[3px]"
                value={draft.discount_type}
                onChange={(e) => setDraft({ ...draft, discount_type: e.target.value as "percent" | "fixed" })}
              >
                <option value="percent">Percentage off (%)</option>
                <option value="fixed">Fixed amount off ($)</option>
              </select>
            </Field>
            <Field label={draft.discount_type === "fixed" ? "Amount off (USD)" : "Percentage off (0–100)"}>
              <TextInput
                type="number"
                step={draft.discount_type === "fixed" ? "0.01" : "1"}
                min="0"
                max={draft.discount_type === "fixed" ? undefined : 100}
                value={draft.discount_amount}
                onChange={(e) => setDraft({ ...draft, discount_amount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Status">
              <select
                className="w-full h-9 px-2 text-[13px] bg-background border border-ink/15 rounded-[3px]"
                value={draft.active ? "1" : "0"}
                onChange={(e) => setDraft({ ...draft, active: e.target.value === "1" })}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </Field>
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