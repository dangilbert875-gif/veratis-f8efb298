import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { Card, Stat, formatUSD } from "../ui";
import { AdminAlerts } from "../AdminAlerts";
import { QuickActions } from "../QuickActions";
import type { SectionId } from "../AdminDashboard";

export function OverviewPanel({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview() });

  return (
    <div className="space-y-6">
      {/* Quick actions — top of dashboard, always visible */}
      <section>
        <div className="mb-2 text-[9px] tracking-[0.28em] uppercase text-foreground/45">
          Quick actions
        </div>
        <QuickActions onNavigate={onNavigate} />
      </section>

      {/* Operational alerts — what needs attention */}
      <section>
        <div className="mb-2 text-[9px] tracking-[0.28em] uppercase text-foreground/45">
          Operational alerts
        </div>
        <AdminAlerts onNavigate={onNavigate} />
      </section>

      {/* Operational metrics */}
      <section>
        <div className="mb-2 text-[9px] tracking-[0.28em] uppercase text-foreground/45">
          Operational metrics
        </div>
        {isLoading || !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-ink/10 bg-background p-5 h-[110px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Orders · all-time" value={data.orders.total.toLocaleString()} sub={`${data.orders.pending} pending`} />
            <Stat label="Revenue · 30 days" value={formatUSD(data.orders.revenue30d)} sub="paid · shipped · delivered" />
            <Stat label="Referrals" value={data.referrals.total.toLocaleString()} sub={`${data.referrals.conversions} conversions / ${data.referrals.clicks} clicks`} />
            <Stat label="Outstanding payouts" value={formatUSD(data.payouts.outstanding)} sub={`${data.payouts.pending} pending`} />
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Customer base" hint="Registered accounts">
          <div className="px-5 py-6">
            <div className="text-[32px] font-medium tracking-tight tabular-nums">
              {data?.customers.total ?? "—"}
            </div>
            <p className="mt-2 text-[12px] text-foreground/55">
              Each signup is automatically enrolled in the customer role. Promote to research-partner or admin from the Customers panel.
            </p>
          </div>
        </Card>
        <Card title="Operational notes">
          <div className="px-5 py-5 text-[12.5px] leading-relaxed text-foreground/70 space-y-3">
            <p>This console is the internal operations surface for Veratis. It is not linked from any public navigation.</p>
            <p>Catalog, verification archive, and educational publications are sourced from the canonical archive and are presented here for review and audit.</p>
            <p className="text-foreground/45">
              Press <kbd className="border border-ink/15 px-1.5 py-0.5 text-[10px] tracking-[0.1em]">⌘K</kbd> anywhere to open the operations command bar.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}