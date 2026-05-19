import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getProductRelations,
  getCustomerRelations,
} from "@/lib/admin-ops.functions";
import type { SectionId } from "./AdminDashboard";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[9px] tracking-[0.28em] uppercase text-foreground/45">{title}</div>
      {children}
    </div>
  );
}

function LinkRow({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 border border-ink/10 bg-background hover:border-ink/30 hover:bg-mist/30 transition-colors"
    >
      <span className="text-[12.5px] text-ink truncate">{label}</span>
      {sub && (
        <span className="text-[10px] tracking-[0.16em] uppercase text-foreground/50 shrink-0">{sub}</span>
      )}
    </button>
  );
}

export function ProductRelatedLinks({
  productId,
  onNavigate,
}: {
  productId: string;
  onNavigate?: (s: SectionId) => void;
}) {
  const fn = useServerFn(getProductRelations);
  const { data, isLoading } = useQuery({
    queryKey: ["product-relations", productId],
    queryFn: () => fn({ data: { product_id: productId } }),
    enabled: Boolean(productId),
  });

  if (isLoading) return <div className="text-[12px] text-foreground/50">Loading links…</div>;
  if (!data) return null;

  const go = (s: SectionId) => () => onNavigate?.(s);
  const empty =
    data.lots.length === 0 &&
    data.articles.length === 0 &&
    data.recentOrders.length === 0 &&
    data.relatedProducts.length === 0;

  if (empty) {
    return (
      <div className="text-[12px] text-foreground/50">
        No related lots, articles, orders, or sibling products yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.lots.length > 0 && (
        <Group title={`Lots / COAs · ${data.lots.length}`}>
          <div className="space-y-1.5">
            {data.lots.map((l: any) => (
              <LinkRow
                key={l.id}
                label={`Lot ${l.lot_number}`}
                sub={l.active ? "active" : "inactive"}
                onClick={go("coa")}
              />
            ))}
          </div>
        </Group>
      )}
      {data.articles.length > 0 && (
        <Group title={`Linked articles · ${data.articles.length}`}>
          <div className="space-y-1.5">
            {data.articles.map((a: any) => (
              <LinkRow key={a.id} label={a.title} sub={a.status} onClick={go("articles")} />
            ))}
          </div>
        </Group>
      )}
      {data.relatedProducts.length > 0 && (
        <Group title={`Related products · ${data.relatedProducts.length}`}>
          <div className="space-y-1.5">
            {data.relatedProducts.map((p: any) => (
              <LinkRow key={p.id} label={p.name} sub={p.status} onClick={go("products")} />
            ))}
          </div>
        </Group>
      )}
      {data.recentOrders.length > 0 && (
        <Group title={`Recent order items · ${data.recentOrders.length}`}>
          <div className="space-y-1.5">
            {data.recentOrders.slice(0, 6).map((o: any) => (
              <LinkRow
                key={o.id}
                label={`Order ${o.order_id?.slice(0, 8) ?? "—"}`}
                sub={`qty ${o.quantity}`}
                onClick={go("orders")}
              />
            ))}
          </div>
        </Group>
      )}
    </div>
  );
}

export function CustomerRelatedLinks({
  profileId,
  onNavigate,
}: {
  profileId: string;
  onNavigate?: (s: SectionId) => void;
}) {
  const fn = useServerFn(getCustomerRelations);
  const { data, isLoading } = useQuery({
    queryKey: ["customer-relations", profileId],
    queryFn: () => fn({ data: { profile_id: profileId } }),
    enabled: Boolean(profileId),
  });

  if (isLoading) return <div className="text-[12px] text-foreground/50">Loading…</div>;
  if (!data) return null;

  const go = (s: SectionId) => () => onNavigate?.(s);
  return (
    <div className="space-y-4">
      {data.orders.length > 0 ? (
        <Group title={`Orders · ${data.orders.length}`}>
          <div className="space-y-1.5">
            {data.orders.map((o: any) => (
              <LinkRow
                key={o.id}
                label={o.order_number}
                sub={`${o.status} · $${Number(o.total_usd ?? 0).toFixed(2)}`}
                onClick={go("orders")}
              />
            ))}
          </div>
        </Group>
      ) : (
        <div className="text-[12px] text-foreground/50">No orders yet.</div>
      )}
      {data.affiliate && (
        <Group title="Affiliate">
          <LinkRow
            label={data.affiliate.affiliate_code}
            sub={data.affiliate.status}
            onClick={go("referrals")}
          />
        </Group>
      )}
      {data.meta && (
        <Group title="CRM">
          <div className="text-[12px] text-foreground/65 space-y-0.5 px-3 py-2 border border-ink/10 bg-background">
            <div>Total spend: <span className="tabular-nums text-ink">${Number(data.meta.total_spend ?? 0).toFixed(2)}</span></div>
            {data.meta.referral_source && <div>Source: {data.meta.referral_source}</div>}
            {data.meta.tags?.length > 0 && <div>Tags: {data.meta.tags.join(", ")}</div>}
          </div>
        </Group>
      )}
    </div>
  );
}