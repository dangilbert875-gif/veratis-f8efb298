import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, json, supabaseAdmin } from "@/lib/admin-api.server";
import { postN8nOpsEvent } from "@/lib/n8n-webhook.server";

const ALLOWED = new Set(["pending", "confirmed", "failed", "refunded"]);

export const Route = createFileRoute("/api/admin/orders/$orderNumber/payment-status")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;

        let body: { paymentstatus?: string };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const paymentstatus = (body.paymentstatus ?? "").toString().trim().toLowerCase();
        if (!paymentstatus || !ALLOWED.has(paymentstatus)) {
          return json(
            { error: `paymentstatus must be one of: ${Array.from(ALLOWED).join(", ")}` },
            400,
          );
        }

        const nowIso = new Date().toISOString();
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update({ payment_status: paymentstatus, updated_at: nowIso })
          .eq("order_number", params.orderNumber)
          .select("order_number, payment_status")
          .maybeSingle();

        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Order not found" }, 404);

        const opsEventMap: Record<string, "ORDER_PAID" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | null> = {
          confirmed: "ORDER_PAID",
          pending: "PAYMENT_PENDING",
          failed: "PAYMENT_FAILED",
          refunded: null,
        };
        const opsEvent = opsEventMap[paymentstatus];
        if (opsEvent) {
          await postN8nOpsEvent(opsEvent, {
            ordernumber: data.order_number,
            paymentstatus: data.payment_status,
          });
        }

        return json({
          success: true,
          ordernumber: data.order_number,
          paymentstatus: data.payment_status,
        });
      },
    },
  },
});