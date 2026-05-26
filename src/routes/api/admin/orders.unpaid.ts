import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, json, supabaseAdmin } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/orders/unpaid")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;

        const { data, error } = await supabaseAdmin
          .from("orders")
          .select("order_number, customer_name, total_usd, payment_method, payment_status, btc_amount, btc_tx_hash, payment_proof_url, created_at, payment_tx_id, notes")
          .neq("payment_status", "confirmed")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(1000);

        if (error) return json({ error: error.message }, 500);

        const orders = (data ?? []).map((o) => ({
          ordernumber: o.order_number ?? "",
          customername: o.customer_name ?? "",
          ordertotal: Number(o.total_usd ?? 0),
          paymentmethod: o.payment_method ?? "",
          paymentstatus: o.payment_status ?? "",
          btcamountquoted: o.btc_amount ? Number(o.btc_amount) : null,
          btctxid: o.btc_tx_hash ?? null,
          btcpaymentproofurl: o.payment_proof_url ?? null,
          venmousername: o.payment_tx_id ?? null,
          venmonotes: o.notes ?? null,
          venmopaymentproofurl: o.payment_proof_url ?? null,
          createdat: o.created_at ?? null,
        }));

        return json({ orders });
      },
    },
  },
});
