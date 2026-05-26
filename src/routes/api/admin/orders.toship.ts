import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, formatOrder, json, supabaseAdmin, ORDER_SELECT } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/orders/toship")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select(ORDER_SELECT)
          .eq("payment_status", "paid")
          .in("fulfillment_status", ["not_started", "processing", "pending"])
          .is("archived_at", null)
          .order("created_at", { ascending: true })
          .limit(100);
        if (error) return json({ error: error.message }, 500);
        return json({ count: data.length, orders: data.map(formatOrder) });
      },
    },
  },
});