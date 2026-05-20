import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STATIC_BTC_ADDRESS = "3FD7Djem6ME9rnwx9YbdD3v7BiNF8PCvhq";

const itemSchema = z.object({
  slug: z.string().min(1).max(128),
  name: z.string().min(1).max(256),
  size: z.string().max(64).optional().default(""),
  lot: z.string().max(64).optional().default(""),
  price: z.number().min(0).max(100000),
  quantity: z.number().int().min(1).max(50),
});

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email().max(255),
    name: z.string().min(1).max(128),
    phone: z.string().max(32).optional().default(""),
  }),
  shipping: z.object({
    name: z.string().min(1).max(128),
    address_1: z.string().min(1).max(256),
    address_2: z.string().max(256).optional().default(""),
    city: z.string().min(1).max(128),
    state: z.string().min(1).max(64),
    zip: z.string().min(1).max(32),
    country: z.string().min(1).max(64),
  }),
  shipping_method: z.literal("standard"),
  notes: z.string().max(1024).optional().default(""),
  items: z.array(itemSchema).min(1).max(50),
  payment_proof_url: z.string().url().max(1024).optional().nullable(),
  payment_tx_id: z.string().max(256).optional().nullable(),
});

async function nextOrderNumber(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("next_order_number");
  if (error) throw new Error(error.message);
  return String(data);
}

export const createCheckoutOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => checkoutSchema.parse(d))
  .handler(async ({ data }) => {
    const itemsTotal = data.items.reduce(
      (s, i) => s + Number(i.price) * Number(i.quantity),
      0,
    );
    const shippingCost = itemsTotal >= 150 ? 0 : 18;
    const total = Math.round((itemsTotal + shippingCost) * 100) / 100;

    // Sequential order number starting at 1501 (1501, 1502, 1503…)
    const order_number = await nextOrderNumber();

    const btcAddress = STATIC_BTC_ADDRESS;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number,
        customer_email: data.customer.email.trim().toLowerCase(),
        customer_name: data.customer.name.trim(),
        status: "awaiting_payment",
        payment_status: "pending",
        payment_method: "btc",
        fulfillment_status: "not_started",
        total_usd: total,
        btc_address: btcAddress,
        payment_expires_at: expiresAt,
        shipping_name: data.shipping.name.trim(),
        shipping_address_1: data.shipping.address_1.trim(),
        shipping_address_2: data.shipping.address_2?.trim() || null,
        shipping_city: data.shipping.city.trim(),
        shipping_state: data.shipping.state.trim(),
        shipping_zip: data.shipping.zip.trim(),
        shipping_country: data.shipping.country.trim(),
        shipping_method: data.shipping_method,
        notes: data.notes?.trim() || null,
        items: data.items as any,
        payment_proof_url: data.payment_proof_url || null,
        payment_tx_id: data.payment_tx_id?.trim() || null,
      })
      .select("id, order_number")
      .single();

    if (error) throw new Error(error.message);

    // Best-effort line items
    if (order?.id) {
      await supabaseAdmin.from("order_items").insert(
        data.items.map((i) => ({
          order_id: order.id,
          product_name: i.name,
          lot_number: i.lot || null,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      );
    }

    return {
      order_number: order!.order_number,
      total_usd: total,
      shipping_cost: shippingCost,
      btc_address: btcAddress,
      expires_at: expiresAt,
    };
  });

export const getCheckoutOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ order_number: z.string().min(3).max(32) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, customer_email, customer_name, status, payment_status, fulfillment_status, total_usd, btc_address, btc_amount, payment_expires_at, payment_received_at, shipping_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_zip, shipping_country, shipping_method, items, created_at",
      )
      .eq("order_number", data.order_number.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");
    return { ...order, btc_address: order.btc_address ?? STATIC_BTC_ADDRESS };
  });

export const getBtcUsdRate = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const res = await fetch(
        "https://api.coinbase.com/v2/prices/BTC-USD/spot",
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(`Coinbase ${res.status}`);
      const json = (await res.json()) as { data?: { amount?: string } };
      const rate = Number(json?.data?.amount);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error("bad rate");
      return { rate, fetched_at: new Date().toISOString() };
    } catch (e) {
      return { rate: null as number | null, fetched_at: new Date().toISOString(), error: (e as Error).message };
    }
  },
);