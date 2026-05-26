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
          .select(
            "order_number, customer_name, total_usd, payment_method, payment_status, btc_amount, btc_tx_hash, payment_proof_url, created_at, payment_tx_id, notes"
          )
          .neq("payment_status", "confirmed")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(1000);

        if (error) return json({ error: error.message }, 500);

        const orders = ((data as any[]) ?? []).map((o: any) => {
          const pm = String(o.payment_method ?? "").toLowerCase();
          const isBtc = pm === "btc" || pm === "bitcoin";
          const isVenmo = pm === "venmo";

          const createdAt = o.created_at ?? null;
          return {
            ordernumber: o.order_number ?? "",
            customername: o.customer_name ?? "",
            ordertotal: Number(o.total_usd ?? 0),
            paymentmethod: o.payment_method ?? "",
            paymentstatus: o.payment_status ?? "",
            btcamountquoted: isBtc ? (o.btc_amount != null ? Number(o.btc_amount) : null) : null,
            btctxid: isBtc ? (o.payment_tx_id || o.btc_tx_hash || null) : null,
            btcpaymentproofurl: isBtc ? (o.payment_proof_url ?? null) : null,
            venmousername: isVenmo ? (o.payment_tx_id ?? null) : null,
            venmonotes: isVenmo ? (o.notes ?? null) : null,
            venmopaymentproofurl: isVenmo ? (o.payment_proof_url ?? null) : null,
            createdat: createdAt,
            placedrelative: formatRelative(createdAt),
            placedformatted: formatAbsolute(createdAt),
          };
        });

        return json({ orders });
      },
    },
  },
});

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} second${sec === 1 ? "" : "s"} ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const yr = Math.floor(day / 365);
  return `${yr} year${yr === 1 ? "" : "s"} ago`;
}

function formatAbsolute(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}
