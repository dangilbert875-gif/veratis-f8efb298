import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, formatOrder, json, supabaseAdmin, ORDER_SELECT } from "@/lib/admin-api.server";
import { postN8nOpsEvent } from "@/lib/n8n-webhook.server";

export const Route = createFileRoute("/api/admin/orders/$orderNumber/mark-shipped")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;

        let body: { trackingnumber?: string; carrier?: string };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }
        const tracking = (body.trackingnumber ?? "").toString().trim();
        const carrier = (body.carrier ?? "").toString().trim();
        if (!tracking) return json({ error: "trackingnumber is required" }, 400);

        const nowIso = new Date().toISOString();
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update({
            tracking_number: tracking,
            carrier: carrier || null,
            fulfillment_status: "shipped",
            shipping_status: "shipped",
            shipped_at: nowIso,
            updated_at: nowIso,
          })
          .eq("order_number", params.orderNumber)
          .select(ORDER_SELECT)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Order not found" }, 404);

        const formatted = formatOrder(data);
        await postN8nOpsEvent("ORDER_SHIPPED", formatted);
        return json({ ok: true, order: formatted });
      },
    },
  },
});