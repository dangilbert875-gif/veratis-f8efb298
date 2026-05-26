import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, formatOrder, json, supabaseAdmin, ORDER_SELECT } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/orders/today")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select(ORDER_SELECT)
          .gte("created_at", since.toISOString())
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) return json({ error: error.message }, 500);
        return json({ count: data.length, orders: data.map(formatOrder) });
      },
    },
  },
});