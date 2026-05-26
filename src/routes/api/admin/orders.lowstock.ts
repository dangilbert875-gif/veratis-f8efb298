import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, json, supabaseAdmin } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/orders/lowstock")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;
        // Fetch published products and filter in JS — Postgres doesn't support
        // column-vs-column comparison directly through PostgREST filters.
        const { data, error } = await supabaseAdmin
          .from("products")
          .select("id, name, slug, inventory_count, low_stock_threshold, stock_status")
          .eq("status", "published")
          .is("archived_at", null)
          .order("inventory_count", { ascending: true });
        if (error) return json({ error: error.message }, 500);
        const low = (data ?? []).filter(
          (p) => Number(p.inventory_count ?? 0) <= Number(p.low_stock_threshold ?? 0),
        );
        return json({
          count: low.length,
          products: low.map((p) => ({
            name: p.name,
            slug: p.slug,
            inventory_count: Number(p.inventory_count ?? 0),
            low_stock_threshold: Number(p.low_stock_threshold ?? 0),
            stock_status: p.stock_status,
          })),
        });
      },
    },
  },
});