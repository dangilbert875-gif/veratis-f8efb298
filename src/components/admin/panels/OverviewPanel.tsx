import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { Card, Stat, HeroStat, formatUSD } from "../ui";
import { AdminAlerts } from "../AdminAlerts";
import { QuickActions } from "../QuickActions";
import type { SectionId } from "../AdminDashboard";

type NavigateFn = (s: SectionId, opts?: { ordersFilter?: "unshipped" | "unpaid" | "flagged" | "refunded" }) => void;

type Scope = "today" | "7d" | "30d" | "all";
const SCOPES: { id: Scope; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "all", label: "All time" },
];
const SCOPE_SUFFIX: Record<Scope, string> = {
  today: "today",
  "7d": "last 7 days",
  "30d": "last 30 days",
  all: "all-time",
};

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

function ScopeToggle({ scope, onChange }: { scope: Scope; onChange: (s: Scope) => void }) {
  return (
    <div className="inline-flex border border-ink/15 bg-background">
      {SCOPES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={[
            "h-8 px-3 text-[10.5px] tracking-[0.18em] uppercase transition-colors border-r border-ink/10 last:border-r-0",
            scope === s.id
              ? "bg-ink text-background"
              : "text-foreground/60 hover:text-ink hover:bg-mist/40",
          ].join(" ")}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function OverviewPanel({ onNavigate }: { onNavigate: NavigateFn }) {
  const [scope, setScope] = useState<Scope>("30d");
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview", scope],
    queryFn: () => fetchOverview({ data: { scope } }),
    refetchInterval: 60_000,
  });

  const revDelta = data
    ? pctDelta((data.orders as any).revenueScope ?? 0, (data.orders as any).revenuePrevScope ?? 0)
    : 0;
  const orderDelta = data
    ? pctDelta((data.orders as any).ordersScopeCount ?? 0, (data.orders as any).ordersPrevScopeCount ?? 0)
    : 0;
  const scopeSuffix = SCOPE_SUFFIX[scope];

  return (
    <div className="space-y-10">
      {/* Scope toggle — applies to time-scoped row */}
      <div className="flex items-center justify-between gap-4 -mt-4">
        <div className="text-[11px] text-foreground/55">
          Metrics scoped to{" "}
          <span className="text-ink">{scopeSuffix}</span>.
        </div>
        <ScopeToggle scope={scope} onChange={setScope} />
      </div>

      {/* ROW 1 — ACTION REQUIRED (prominent, clickable) */}
      <section>
        <SectionHeading>Action required</SectionHeading>
        {isLoading || !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-ink/15 bg-background h-[120px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionStat
              label="Orders to ship"
              value={(data.orders.unshipped ?? 0).toLocaleString()}
              sub="paid · awaiting shipment"
              tone={data.orders.unshipped > 0 ? "warn" : "ok"}
              onClick={() => onNavigate("orders", { ordersFilter: "unshipped" })}
            />
            <ActionStat
              label="Awaiting payment"
              value={((data.orders as any).awaitingPayment ?? 0).toLocaleString()}
              sub="pending confirmation"
              tone={(data.orders as any).awaitingPayment > 0 ? "warn" : "ok"}
              onClick={() => onNavigate("orders", { ordersFilter: "unpaid" })}
            />
            <ActionStat
              label="Flagged orders"
              value={((data.orders as any).flagged ?? 0).toLocaleString()}
              sub="risk review"
              tone={(data.orders as any).flagged > 0 ? "bad" : "ok"}
              onClick={() => onNavigate("orders", { ordersFilter: "flagged" })}
            />
            <ActionStat
              label="Active alerts"
              value={alertCountFromOverview(data).toString()}
              sub="operational checks"
              tone={alertCountFromOverview(data) > 0 ? "warn" : "ok"}
            />
          </div>
        )}
        <div className="mt-4">
          <AdminAlerts onNavigate={onNavigate} />
        </div>
      </section>

      {/* ROW 2 — TIME-SCOPED METRICS */}
      <section>
        <SectionHeading>Time-scoped · {scopeSuffix}</SectionHeading>
        {isLoading || !data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-ink/15 bg-background h-[156px] animate-pulse" />
            <div className="border border-ink/10 bg-background h-[72px] animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <HeroStat
                label={`Revenue · ${scopeSuffix}`}
                value={formatUSD((data.orders as any).revenueScope ?? 0)}
                sub={`${(data.orders as any).ordersScopeCount ?? 0} orders · ${data.orders.pending} pending`}
                trend={
                  scope === "all"
                    ? undefined
                    : { delta: revDelta, suffix: `vs prior ${scope === "today" ? "day" : scope}` }
                }
                series={data.orders.series14 ?? []}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Stat
                label={`Orders · ${scopeSuffix}`}
                value={((data.orders as any).ordersScopeCount ?? 0).toLocaleString()}
                sub={
                  scope === "all"
                    ? "lifetime"
                    : `${orderDelta >= 0 ? "+" : ""}${Math.round(orderDelta)}% vs prior period`
                }
              />
              <Stat
                label={`New customers · ${scopeSuffix}`}
                value={((data.customers as any).newScope ?? 0).toLocaleString()}
                sub={`${data.customers.total.toLocaleString()} total`}
                onClick={() => onNavigate("customers")}
              />
            </div>
          </div>
        )}
      </section>

      {/* ROW 3 — INVENTORY HEALTH */}
      <section>
        <SectionHeading>Inventory health</SectionHeading>
        {isLoading || !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-ink/10 bg-background h-[100px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ActionStat
              label="Low-stock SKUs"
              value={((data as any).inventory?.lowStockCount ?? 0).toLocaleString()}
              sub="below threshold"
              tone={((data as any).inventory?.lowStockCount ?? 0) > 0 ? "warn" : "ok"}
              onClick={() => onNavigate("products")}
            />
            <ActionStat
              label="Lots expiring ≤30d"
              value={((data as any).inventory?.lotsExpiringCount ?? 0).toLocaleString()}
              sub="best-before approaching"
              tone={((data as any).inventory?.lotsExpiringCount ?? 0) > 0 ? "warn" : "ok"}
              onClick={() => onNavigate("archive")}
            />
            <ActionStat
              label="COAs pending"
              value={((data as any).inventory?.coaPendingCount ?? 0).toLocaleString()}
              sub="awaiting upload"
              tone={((data as any).inventory?.coaPendingCount ?? 0) > 0 ? "warn" : "ok"}
              onClick={() => onNavigate("coa")}
            />
          </div>
        )}
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <SectionHeading>Quick actions</SectionHeading>
        <QuickActions
          onNavigate={onNavigate}
          counts={{
            todayLabels: data?.orders.unshipped ?? 0,
            picking: data?.orders.unshipped ?? 0,
            refunds: (data?.orders as any)?.refundsPending ?? 0,
            coaPending: (data as any)?.inventory?.coaPendingCount ?? 0,
          }}
        />
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

function alertCountFromOverview(data: any): number {
  let n = 0;
  if ((data.orders?.unshipped ?? 0) > 0) n++;
  if ((data.orders?.flagged ?? 0) > 0) n++;
  if ((data.inventory?.lowStockCount ?? 0) > 0) n++;
  if ((data.inventory?.coaPendingCount ?? 0) > 0) n++;
  if ((data.payouts?.pending ?? 0) > 0) n++;
  return n;
}

function ActionStat({
  label,
  value,
  sub,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "ok" | "warn" | "bad";
  onClick?: () => void;
}) {
  const dotClass =
    tone === "ok"
      ? "bg-emerald-700"
      : tone === "warn"
        ? "bg-amber-600"
        : "bg-red-700";
  const numberClass =
    tone === "ok"
      ? "text-ink"
      : tone === "warn"
        ? "text-amber-900"
        : "text-red-800";
  const base =
    "group border bg-background p-5 text-left w-full transition-colors";
  const interactive = onClick
    ? "cursor-pointer hover:bg-mist/30 hover:border-ink/30"
    : "";
  const borderTone =
    tone === "ok" ? "border-ink/10" : tone === "warn" ? "border-amber-700/30" : "border-red-700/30";
  const inner = (
    <>
      <div className="flex items-center gap-2 text-[9.5px] tracking-[0.28em] uppercase text-foreground/55">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {label}
      </div>
      <div className={`mt-3 text-[34px] leading-none font-medium tracking-tight tabular-nums ${numberClass}`}>
        {value}
      </div>
      {sub && <div className="mt-2 text-[11px] text-foreground/55">{sub}</div>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${borderTone} ${interactive}`}>
        {inner}
      </button>
    );
  }
  return <div className={`${base} ${borderTone}`}>{inner}</div>;
}