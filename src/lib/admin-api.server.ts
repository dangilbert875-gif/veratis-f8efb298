// Shared helpers for admin-only HTTP API routes under /api/admin/*.
// Authentication: every request MUST send `x-admin-api-key` header matching
// the ADMIN_API_KEY secret. Used by the n8n Telegram Operations Bot.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function checkAdminApiKey(request: Request): Response | null {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return json({ error: "ADMIN_API_KEY not configured on server" }, 500);
  }
  const provided = request.headers.get("x-admin-api-key");
  if (!provided || provided !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Map an `orders` row (+ optional joined order_items) into the canonical
// JSON shape consumed by n8n / Telegram bot.
export function formatOrder(o: any): Record<string, unknown> {
  const items = Array.isArray(o.order_items) ? o.order_items : [];
  const products = items.length
    ? items.map((it: any) => ({
        name: it.product_name ?? "",
        quantity: Number(it.quantity ?? 0),
      }))
    : (Array.isArray(o.items) ? o.items : []).map((it: any) => ({
        name: it.name ?? it.product_name ?? "",
        quantity: Number(it.quantity ?? 0),
      }));

  const paymentMethod = String(o.payment_method ?? "").toLowerCase();
  const isVenmo = paymentMethod === "venmo";
  const isBtc = paymentMethod === "bitcoin" || paymentMethod === "btc";

  return {
    ordernumber: o.order_number ?? "",
    customername: o.customer_name ?? "",
    customeremail: o.customer_email ?? "",
    customerphone: o.customer_phone ?? "",
    products,
    ordertotal: Number(o.total_usd ?? 0),
    paymentmethod: o.payment_method ?? "",
    paymentstatus: o.payment_status ?? "",
    btcamountquoted: isBtc ? (o.btc_amount != null ? String(o.btc_amount) : "N/A") : "N/A",
    btctxid: isBtc ? (o.payment_tx_id || o.btc_tx_hash || "N/A") : "N/A",
    btcpaymentproofurl: isBtc ? (o.payment_proof_url || "N/A") : "N/A",
    venmousername: isVenmo ? (o.payment_tx_id || "N/A") : "N/A",
    venmonotes: isVenmo ? (o.notes || "N/A") : "N/A",
    venmopaymentproofurl: isVenmo ? (o.payment_proof_url || "N/A") : "N/A",
    trackingnumber: o.tracking_number ?? "",
    fulfillmentstatus: o.fulfillment_status ?? "",
    shippingaddress: {
      name: o.shipping_name ?? "",
      address1: o.shipping_address_1 ?? "",
      address2: o.shipping_address_2 ?? "",
      city: o.shipping_city ?? "",
      state: o.shipping_state ?? "",
      zip: o.shipping_zip ?? "",
      country: o.shipping_country ?? "",
    },
    createdat: o.created_at ?? "",
  };
}

export const ORDER_SELECT = "*, order_items(*)";

export { supabaseAdmin };