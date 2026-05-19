import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAuditLog, getAuditEntityTypes } from "@/lib/admin-ops.functions";
import { Card, Empty, SelectInput } from "../ui";

type DiffMode = "summary" | "full";

function shallowDiff(oldRow: any, newRow: any) {
  if (!oldRow && !newRow) return [];
  if (!oldRow) {
    return Object.entries(newRow).map(([k, v]) => ({ k, before: undefined, after: v }));
  }
  if (!newRow) {
    return Object.entries(oldRow).map(([k, v]) => ({ k, before: v, after: undefined }));
  }
  const keys = new Set([...Object.keys(oldRow), ...Object.keys(newRow)]);
  const result: { k: string; before: any; after: any }[] = [];
  for (const k of keys) {
    const b = oldRow[k];
    const a = newRow[k];
    if (JSON.stringify(b) !== JSON.stringify(a)) result.push({ k, before: b, after: a });
  }
  return result;
}

function fmt(v: any) {
  if (v === undefined) return "—";
  if (v === null) return "null";
  if (typeof v === "string") return v.length > 80 ? v.slice(0, 80) + "…" : v;
  if (typeof v === "object") return JSON.stringify(v).slice(0, 80);
  return String(v);
}

export function AuditLogPanel() {
  const [entity, setEntity] = useState<string>("");
  const [mode, setMode] = useState<DiffMode>("summary");
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchLog = useServerFn(getAuditLog);
  const fetchTypes = useServerFn(getAuditEntityTypes);

  const types = useQuery({ queryKey: ["audit-entity-types"], queryFn: () => fetchTypes() });
  const log = useQuery({
    queryKey: ["audit-log", entity],
    queryFn: () => fetchLog({ data: { entity_type: entity || undefined, limit: 120 } }),
  });

  const rows = useMemo(() => log.data ?? [], [log.data]);

  return (
    <Card
      title="Audit log"
      hint="Every admin write is recorded. Click a row to inspect before / after state."
      action={
        <div className="flex items-center gap-2">
          <SelectInput value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">All entity types</option>
            {(types.data ?? []).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </SelectInput>
          <SelectInput value={mode} onChange={(e) => setMode(e.target.value as DiffMode)}>
            <option value="summary">Summary diff</option>
            <option value="full">Full payload</option>
          </SelectInput>
        </div>
      }
    >
      {log.isLoading ? (
        <div className="divide-y divide-ink/10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Empty>No audit entries match this filter yet. Any product, order, COA, or note edit will show up here with its before/after state.</Empty>
      ) : (
        <ul className="divide-y divide-ink/10">
          {rows.map((r: any) => {
            const isOpen = openId === r.id;
            const oldRow = r.diff?.old ?? null;
            const newRow = r.diff?.new ?? null;
            const diff = shallowDiff(oldRow, newRow);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : r.id)}
                  className="w-full text-left px-5 py-3 flex items-center gap-4 hover:bg-mist/40 transition-colors"
                >
                  <span className="text-[10.5px] tracking-[0.18em] uppercase text-foreground/55 w-16">
                    {r.action}
                  </span>
                  <span className="text-[12.5px] text-ink flex-1 min-w-0 truncate">
                    {r.entity_type} · {r.entity_id?.slice(0, 12) ?? "—"}
                  </span>
                  <span className="text-[11px] text-foreground/55 hidden sm:inline">
                    {r.actor_label ?? "—"}
                  </span>
                  <span className="text-[11px] tabular-nums text-foreground/55">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 bg-mist/30 border-t border-ink/10">
                    {mode === "summary" ? (
                      diff.length === 0 ? (
                        <div className="py-3 text-[12px] text-foreground/55">No field-level changes captured.</div>
                      ) : (
                        <table className="w-full text-[12px] mt-3">
                          <thead>
                            <tr className="text-left text-[9.5px] tracking-[0.24em] uppercase text-foreground/50">
                              <th className="py-1 pr-3 w-1/4">Field</th>
                              <th className="py-1 pr-3 w-1/3">Before</th>
                              <th className="py-1">After</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink/10">
                            {diff.map((d) => (
                              <tr key={d.k} className="align-top">
                                <td className="py-1.5 pr-3 text-foreground/70">{d.k}</td>
                                <td className="py-1.5 pr-3 text-foreground/55 font-mono text-[11px]">{fmt(d.before)}</td>
                                <td className="py-1.5 text-ink font-mono text-[11px]">{fmt(d.after)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    ) : (
                      <pre className="mt-3 max-h-[320px] overflow-auto text-[11px] leading-relaxed bg-background border border-ink/10 p-3 font-mono">
                        {JSON.stringify(r.diff, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}