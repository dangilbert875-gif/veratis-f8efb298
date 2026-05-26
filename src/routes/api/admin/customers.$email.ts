import { createFileRoute } from "@tanstack/react-router";
import { checkAdminApiKey, json, supabaseAdmin } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/customers/$email")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const unauthorized = checkAdminApiKey(request);
        if (unauthorized) return unauthorized;

        const email = decodeURIComponent(params.email).toLowerCase().trim();
        if (!email) return json({ error: "Email required" }, 400);

        const { data: orders, error } = await supabaseAdmin
          .from("orders")
          .select(
            "order_number, total_usd, payment_status, fulfillment_status, tracking_number, carrier, shipping_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_zip, shipping_country, created_at",
          )
          .ilike("customer_email", email)
          .is("archived_at", null)
          .order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 500);

        const list = orders ?? [];
        const total_orders = list.length;
        const lifetime_spend = list.reduce((s, o) => s + Number(o.total_usd ?? 0), 0);
        const last_order = list[0]
          ? {
              ordernumber: list[0].order_number,
              ordertotal: Number(list[0].total_usd ?? 0),
              paymentstatus: list[0].payment_status,
              fulfillmentstatus: list[0].fulfillment_status,
              createdat: list[0].created_at,
            }
          : null;

        // Try to find profile + customer_meta notes
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .ilike("email", email)
          .maybeSingle();

        let notes = "";
        if (profile?.id) {
          const { data: meta } = await supabaseAdmin
            .from("customer_meta")
            .select("admin_notes")
            .eq("profile_id", profile.id)
            .maybeSingle();
          notes = meta?.admin_notes ?? "";
        }

        return json({
          email,
          total_orders,
          lifetime_spend,
          last_order,
          notes,
          shipping_history: list.map((o) => ({
            ordernumber: o.order_number,
            trackingnumber: o.tracking_number ?? "",
            carrier: o.carrier ?? "",
            shippingaddress: {
              name: o.shipping_name ?? "",
              address1: o.shipping_address_1 ?? "",
              address2: o.shipping_address_2 ?? "",
              city: o.shipping_city ?? "",
              state: o.shipping_state ?? "",
              zip: o.shipping_zip ?? "",
              country: o.shipping_country ?? "",
            },
            createdat: o.created_at,
          })),
        });
      },
    },
  },
});