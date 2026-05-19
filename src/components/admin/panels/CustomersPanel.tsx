import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCustomers, setUserRole } from "@/lib/admin.functions";
import { Card, Empty, GhostButton, TextInput, formatDate } from "../ui";

const ROLES = ["admin", "research_partner", "customer"] as const;
type Role = (typeof ROLES)[number];

export function CustomersPanel() {
  const fetchList = useServerFn(listCustomers);
  const setRole = useServerFn(setUserRole);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-customers", q],
    queryFn: () => fetchList({ data: { q: q || undefined } }),
  });

  async function toggle(user_id: string, role: Role, enabled: boolean) {
    await setRole({ data: { user_id, role, enabled } });
    qc.invalidateQueries({ queryKey: ["admin-customers"] });
  }

  return (
    <Card
      title="Customer registry"
      hint="Search by email or name · toggle roles"
      action={
        <div className="w-[260px]">
          <TextInput placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      }
    >
      {isLoading ? (
        <Empty>Loading…</Empty>
      ) : !data.length ? (
        <Empty>No customers found.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
              <tr>
                <th className="text-left font-medium px-5 py-3">Email</th>
                <th className="text-left font-medium px-5 py-3">Name</th>
                <th className="text-left font-medium px-5 py-3">Joined</th>
                <th className="text-left font-medium px-5 py-3">Roles</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c: any) => {
                const roles: Role[] = c.roles ?? [];
                return (
                  <tr key={c.id} className="border-b border-ink/5 align-top">
                    <td className="px-5 py-3 font-mono text-foreground/80">{c.email ?? "—"}</td>
                    <td className="px-5 py-3">{c.full_name ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground/70">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => {
                          const has = roles.includes(r);
                          return (
                            <GhostButton
                              key={r}
                              type="button"
                              onClick={() => toggle(c.id, r, !has)}
                              className={has ? "!text-ink !border-ink/40 !bg-mist/40" : ""}
                            >
                              {has ? "✓ " : ""}{r.replace("_", " ")}
                            </GhostButton>
                          );
                        })}
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
  );
}