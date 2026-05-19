import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { Card, Stat, formatUSD } from "../ui";

export function OverviewPanel() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview() });

  if (isLoading || !data) {
    return <div className="text-[12px] text-foreground/50">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Orders · all-time" value={data.orders.total.toLocaleString()} sub={`${data.orders.pending} pending`} />
        <Stat label="Revenue · 30 days" value={formatUSD(data.orders.revenue30d)} sub="paid · shipped · delivered" />
        <Stat label="Referrals" value={data.referrals.total.toLocaleString()} sub={`${data.referrals.conversions} conversions / ${data.referrals.clicks} clicks`} />
        <Stat label="Outstanding payouts" value={formatUSD(data.payouts.outstanding)} sub={`${data.payouts.pending} pending`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Customer base" hint="Registered accounts">
          <div className="px-5 py-6">
            <div className="text-[32px] font-medium tracking-tight tabular-nums">{data.customers.total}</div>
            <p className="mt-2 text-[12px] text-foreground/55">
              Each signup is automatically enrolled in the customer role. Promote to research-partner or admin from the Customers panel.
            </p>
          </div>
        </Card>
        <Card title="Operational notes">
          <div className="px-5 py-5 text-[12.5px] leading-relaxed text-foreground/70 space-y-3">
            <p>This console is the internal operations surface for Veratis. It is not linked from any public navigation.</p>
            <p>Catalog, verification archive, and educational publications are sourced from the canonical archive and are presented here for review and audit.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}