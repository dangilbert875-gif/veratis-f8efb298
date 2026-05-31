import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminAlerts } from "@/lib/admin.functions";
import { formatUSD } from "./ui";
import type { SectionId } from "./AdminDashboard";

type AlertTone = "warn" | "bad" | "ok" | "neutral";

function dot(tone: AlertTone) {
  const map: Record<AlertTone, string> = {
    warn: "bg-[var(--state-warning)]",
    bad: "bg-[var(--state-danger)]",
    ok: "bg-[var(--state-success)]",
    neutral: "bg-foreground/30",
  };
  return map[tone];
}

export function AdminAlerts({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const fetchAlerts = useServerFn(getAdminAlerts);
  const { data } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: () => fetchAlerts(),
    refetchInterval: 60_000,
  });

  if (!data) return null;

  const items: { tone: AlertTone; label: string; sub?: string; section: SectionId }[] = [];

  if (data.unfulfilledOrders.count > 0) {
    items.push({
      tone: "warn",
      label: `${data.unfulfilledOrders.count} paid order${data.unfulfilledOrders.count > 1 ? "s" : ""} awaiting fulfillment`,
      section: "orders",
    });
  }
    if (data.lowStock.length > 0) {
    items.push({
      tone: "warn",
      label: `${data.lowStock.length} product${data.lowStock.length > 1 ? "s" : ""} below low-stock threshold`,
        sub: data.lowStock.slice(0, 3).map((p: any) => p.label).join(" · "),
      section: "products",
    });
  }
  if (data.expiredLots.length > 0) {
    items.push({
      tone: "bad",
      label: `${data.expiredLots.length} expired lot${data.expiredLots.length > 1 ? "s" : ""} still active`,
        sub: data.expiredLots.slice(0, 3).map((l: any) => l.lot_number).join(" · "),
      section: "coa",
    });
  }
  if (data.flaggedOrders.length > 0) {
    items.push({
      tone: "bad",
      label: `${data.flaggedOrders.length} order${data.flaggedOrders.length > 1 ? "s" : ""} flagged for risk review`,
      section: "orders",
    });
  }
  if (data.pendingPayouts.count > 0) {
    items.push({
      tone: "neutral",
      label: `${data.pendingPayouts.count} payout${data.pendingPayouts.count > 1 ? "s" : ""} pending. ${formatUSD(data.pendingPayouts.total)}`,
      section: "payouts",
    });
  }

  if (items.length === 0) {
    return (
      <div className="border border-ink/10 bg-mist/30 px-5 py-3 text-[12px] text-foreground/55 flex items-center gap-3">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot("ok")}`} />
        All operational checks clear.
      </div>
    );
  }

  return (
    <div className="border border-ink/10 bg-background divide-y divide-ink/10">
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onNavigate(it.section)}
          className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-mist/40 transition-colors"
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${dot(it.tone)}`} />
          <span className="flex-1 min-w-0">
            <span className="block text-[12.5px] text-ink">{it.label}</span>
            {it.sub && (
              <span className="block mt-0.5 text-[11px] text-foreground/55 truncate">{it.sub}</span>
            )}
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-foreground/45">Review →</span>
        </button>
      ))}
    </div>
  );
}