import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, json, supabaseAdmin } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/stats/today")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;

        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        const sinceIso = since.toISOString();

        const [todaysOrdersRes, pendingRes, productsRes, itemsTodayRes] = await Promise.all([
          supabaseAdmin
            .from("orders")
            .select("order_number, total_usd, payment_status, created_at")
            .gte("created_at", sinceIso)
            .is("archived_at", null),
          supabaseAdmin
            .from("orders")
            .select("order_number, total_usd, payment_status")
            .in("payment_status", ["pending", "unpaid", "awaiting_payment"])
            .is("archived_at", null),
          supabaseAdmin
            .from("products")
            .select("id, name, slug, inventory_count, low_stock_threshold")
            .eq("status", "published")
            .is("archived_at", null),
          supabaseAdmin
            .from("order_items")
            .select("product_name, quantity, created_at")
            .gte("created_at", sinceIso),
        ]);

        if (todaysOrdersRes.error) return json({ error: todaysOrdersRes.error.message }, 500);
        if (pendingRes.error) return json({ error: pendingRes.error.message }, 500);
        if (productsRes.error) return json({ error: productsRes.error.message }, 500);
        if (itemsTodayRes.error) return json({ error: itemsTodayRes.error.message }, 500);

        const orders_today = todaysOrdersRes.data?.length ?? 0;
        const revenue_today = (todaysOrdersRes.data ?? []).reduce(
          (s, o) => s + Number(o.total_usd ?? 0),
          0,
        );
        const pending_payments = pendingRes.data?.length ?? 0;

        const counts: Record<string, number> = {};
        for (const it of itemsTodayRes.data ?? []) {
          const name = it.product_name ?? "Unknown";
          counts[name] = (counts[name] ?? 0) + Number(it.quantity ?? 0);
        }
        const top_products = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, quantity]) => ({ name, quantity }));

        const low_stock_items = (productsRes.data ?? [])
          .filter((p) => Number(p.inventory_count ?? 0) <= Number(p.low_stock_threshold ?? 0))
          .map((p) => ({
            name: p.name,
            slug: p.slug,
            inventory_count: Number(p.inventory_count ?? 0),
            low_stock_threshold: Number(p.low_stock_threshold ?? 0),
          }));

        return json({
          orders_today,
          revenue_today,
          pending_payments,
          top_products,
          low_stock_items,
        });
      },
    },
  },
});