import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCustomers } from "@/lib/admin.functions";
import { Card, Empty, formatDate } from "../ui";

export function PartnersPanel() {
  const fetchList = useServerFn(listCustomers);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: () => fetchList({ data: {} }),
  });
  const partners = (data as any[]).filter((c) => (c.roles ?? []).includes("research_partner"));

  return (
    <Card title="Research partners" hint="Accounts with the research_partner role · manage roles in Customers">
      {isLoading ? (
        <Empty>Loading…</Empty>
      ) : !partners.length ? (
        <Empty>No research partners enrolled.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
              <tr>
                <th className="text-left font-medium px-5 py-3">Email</th>
                <th className="text-left font-medium px-5 py-3">Name</th>
                <th className="text-left font-medium px-5 py-3">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p: any) => (
                <tr key={p.id} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono text-foreground/80">{p.email ?? "."}</td>
                  <td className="px-5 py-3">{p.full_name ?? "."}</td>
                  <td className="px-5 py-3 text-foreground/70">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}