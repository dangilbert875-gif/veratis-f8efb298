import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getActivityFeed } from "@/lib/admin-ops.functions";
import { Card, Empty } from "../ui";

const FILTERS = [
  "all",
  "orders",
  "products",
  "verification",
  "customers",
  "affiliates",
  "articles",
  "lots",
] as const;
type Filter = (typeof FILTERS)[number];

function relativeTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function actionTone(action: string) {
  switch (action) {
    case "INSERT":
      return "bg-[var(--state-success)]";
    case "DELETE":
      return "bg-[var(--state-danger)]";
    case "UPDATE":
      return "bg-[var(--state-warning)]";
    case "lookup":
      return "bg-[var(--state-archived)]";
    default:
      return "bg-foreground/30";
  }
}

export function ActivityPanel() {
  const [filter, setFilter] = useState<Filter>("all");
  const fetchFeed = useServerFn(getActivityFeed);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", filter],
    queryFn: () => fetchFeed({ data: { filter, limit: 80 } }),
    refetchInterval: 30_000,
  });

  return (
    <Card title="Operational activity" hint="Recent admin actions, edits, and public verification lookups">
      <div className="px-5 pt-4 pb-3 border-b border-ink/10 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "px-2.5 py-1 text-[10.5px] tracking-[0.16em] uppercase border transition-colors",
              f === filter
                ? "border-ink text-ink"
                : "border-ink/15 text-foreground/55 hover:border-ink/30 hover:text-ink",
            ].join(" ")}
          >
            {f}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="divide-y divide-ink/10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3 h-12 animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Empty>No activity recorded for this filter yet. Admin edits and public verification lookups will appear here.</Empty>
      ) : (
        <ul className="divide-y divide-ink/10">
          {data.map((it) => (
            <li key={`${it.kind}:${it.id}`} className="px-5 py-3 flex items-start gap-3">
              <span className={`mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0 ${actionTone(it.action)}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-ink">{it.summary}</div>
                <div className="mt-0.5 text-[10.5px] tracking-[0.04em] text-foreground/50 flex gap-3">
                  <span className="tabular-nums">{relativeTime(it.ts)}</span>
                  {it.actor_label && <span>by {it.actor_label}</span>}
                  <span className="uppercase tracking-[0.18em]">{it.action}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}