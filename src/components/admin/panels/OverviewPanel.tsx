import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { Card, Stat, HeroStat, formatUSD } from "../ui";
import { AdminAlerts } from "../AdminAlerts";
import { QuickActions } from "../QuickActions";
import type { SectionId } from "../AdminDashboard";

function pctDelta(curr: number, prev: number): number {
  if (!prev) return curr ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <span className="text-[9px] tracking-[0.32em] uppercase text-foreground/45">
        {children}
      </span>
      <span className="flex-1 h-px bg-ink/8" />
    </div>
  );
}

export function OverviewPanel({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    refetchInterval: 60_000,
  });

  const revDelta = data ? pctDelta(data.orders.revenue30d, data.orders.revenuePrev30d ?? 0) : 0;
  const orderDelta = data ? pctDelta(data.orders.orders7d ?? 0, data.orders.ordersPrev7d ?? 0) : 0;

  return (
    <div className="space-y-10">
      {/* PRIORITY BAND — alerts first, what demands attention */}
      <section>
        <SectionHeading>Priority · requires attention</SectionHeading>
        <AdminAlerts onNavigate={onNavigate} />
      </section>

      {/* PRIMARY METRICS — hero KPI + supporting */}
      <section>
        <SectionHeading>Primary operational metrics</SectionHeading>
        {isLoading || !data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-ink/15 bg-background h-[156px] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border border-ink/10 bg-background h-[72px] animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <HeroStat
                label="Revenue · last 30 days"
                value={formatUSD(data.orders.revenue30d)}
                sub={`${data.orders.orders7d ?? 0} orders past 7 days · ${data.orders.pending} pending`}
                trend={{ delta: revDelta, suffix: "vs prior 30d" }}
                series={data.orders.series14 ?? []}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Stat
                label="Orders · 7 days"
                value={(data.orders.orders7d ?? 0).toLocaleString()}
                sub={`${orderDelta >= 0 ? "+" : ""}${Math.round(orderDelta)}% vs prior 7d`}
              />
              <Stat
                label="Fulfillment queue"
                value={data.orders.pending.toLocaleString()}
                sub="pending · awaiting payment"
              />
            </div>
          </div>
        )}
      </section>

      {/* QUICK ACTIONS — kept compact, after priority + KPI so eye lands here next */}
      <section>
        <SectionHeading>Quick actions</SectionHeading>
        <QuickActions onNavigate={onNavigate} />
      </section>

      {/* SECONDARY — referrals, payouts, customers, articles */}
      <section>
        <SectionHeading>Secondary · partners & audience</SectionHeading>
        {isLoading || !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-ink/10 bg-background p-5 h-[110px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Referrals · total"
              value={data.referrals.total.toLocaleString()}
              sub={`${data.referrals.conversions} conv · ${data.referrals.clicks} clicks`}
            />
            <Stat
              label="Outstanding payouts"
              value={formatUSD(data.payouts.outstanding)}
              sub={`${data.payouts.pending} pending`}
            />
            <Stat
              label="Customer base"
              value={data.customers.total.toLocaleString()}
              sub={`+${data.customers.new30d ?? 0} in last 30d`}
            />
            <Stat
              label="Orders · all-time"
              value={data.orders.total.toLocaleString()}
              sub="lifetime"
            />
          </div>
        )}
      </section>

      {/* BOTTOM — operational notes */}
      <section>
        <SectionHeading>Operational notes</SectionHeading>
        <Card>
          <div className="px-5 py-5 text-[12.5px] leading-relaxed text-foreground/70 space-y-3">
            <p>
              This console is the internal operations surface for Veratis. It is not linked from any public navigation.
            </p>
            <p>
              Catalog, verification archive, and educational publications are sourced from the canonical archive and are presented here for review and audit.
            </p>
            <p className="text-foreground/45">
              Press{" "}
              <kbd className="border border-ink/15 px-1.5 py-0.5 text-[10px] tracking-[0.1em]">⌘K</kbd>{" "}
              anywhere to open the operations command bar.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}