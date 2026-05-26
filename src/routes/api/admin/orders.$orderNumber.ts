import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, formatOrder, json, supabaseAdmin, ORDER_SELECT } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/orders/$orderNumber")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select(ORDER_SELECT)
          .eq("order_number", params.orderNumber)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Order not found" }, 404);
        return json(formatOrder(data));
      },
    },
  },
});