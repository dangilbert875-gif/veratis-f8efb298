import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { enqueueTransactionalEmail } from "@/lib/email/enqueue.server";

const STATIC_BTC_ADDRESS = "3FD7Djem6ME9rnwx9YbdD3v7BiNF8PCvhq";
const N8N_NEW_ORDER_WEBHOOK_URL = "https://veratis.app.n8n.cloud/webhook/New-Order-Clean";

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
  promo_code: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional()
    .nullable(),
  payment_method: z.enum(["btc", "venmo"]).optional().default("btc"),
  reserved_order_number: z
    .string()
    .regex(/^[0-9]{3,12}$/)
    .optional()
    .nullable(),
});

async function nextOrderNumber(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("next_order_number");
  if (error) throw new Error(error.message);
  return String(data);
}

export const reserveOrderNumber = createServerFn({ method: "POST" }).handler(async () => {
  const order_number = await nextOrderNumber();
  return { order_number };
});

async function fetchBtcUsdRate(): Promise<number | null> {
  try {
    const res = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { amount?: string } };
    const rate = Number(json?.data?.amount);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

export const createCheckoutOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => checkoutSchema.parse(d))
  .handler(async ({ data }) => {
    // Authoritative pricing: look up each item from the products table by slug.
    // Never trust client-supplied prices.
    const slugs = Array.from(new Set(data.items.map((i) => i.slug)));
    const { data: products, error: productsErr } = await supabaseAdmin
      .from("products")
      .select("slug, name, price_usd, status, archived_at")
      .in("slug", slugs);
    if (productsErr) throw new Error(productsErr.message);
    const priceBySlug = new Map<string, number>();
    for (const p of products ?? []) {
      if (p.status !== "published" || p.archived_at) continue;
      priceBySlug.set(p.slug, Number(p.price_usd));
    }
    const pricedItems = data.items.map((i) => {
      const dbPrice = priceBySlug.get(i.slug);
      if (dbPrice === undefined || !Number.isFinite(dbPrice)) {
        throw new Error(`Item not available: ${i.slug}`);
      }
      return { ...i, price: dbPrice };
    });
    const itemsTotal = pricedItems.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
    const shippingCost = itemsTotal >= 150 ? 0 : 18;

    // Validate promo code server-side (never trust the client price)
    let discountAmount = 0;
    let appliedCode: string | null = null;
    if (data.promo_code) {
      const { data: codeRows } = await supabaseAdmin.rpc("lookup_promo_code", {
        _code: data.promo_code,
      });
      const code = Array.isArray(codeRows) ? codeRows[0] : codeRows;
      if (code && code.active) {
        const amount = Number(code.discount_amount ?? 0);
        if (code.discount_type === "fixed") {
          discountAmount = Math.min(amount, itemsTotal);
        } else {
          discountAmount = Math.min((itemsTotal * amount) / 100, itemsTotal);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
        appliedCode = String(code.code);
      }
    }

    const total = Math.max(0, Math.round((itemsTotal + shippingCost - discountAmount) * 100) / 100);

    // Sequential order number starting at 1501 (1501, 1502, 1503…) — always
    // assigned server-side. If the client pre-reserved a number for this
    // checkout session (so the buyer sees the same # in the Venmo/BTC note
    // that they'll see on the receipt), reuse it as long as it isn't already
    // in use; otherwise mint a new one.
    let order_number: string;
    const reserved = data.reserved_order_number?.trim();
    if (reserved) {
      const { data: existing } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("order_number", reserved)
        .maybeSingle();
      order_number = existing ? await nextOrderNumber() : reserved;
    } else {
      order_number = await nextOrderNumber();
    }

    const isVenmo = data.payment_method === "venmo";
    const btcAddress = isVenmo ? null : STATIC_BTC_ADDRESS;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    // Lock the BTC quote at the time of checkout so the admin can see
    // exactly how much BTC the customer was asked to pay.
    const btcRate = isVenmo ? null : await fetchBtcUsdRate();
    const btcAmount = !isVenmo && btcRate ? Number((total / btcRate).toFixed(8)) : null;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number,
        customer_email: data.customer.email.trim().toLowerCase(),
        customer_name: data.customer.name.trim(),
        status: "awaiting_payment",
        payment_status: "pending",
        payment_method: data.payment_method,
        fulfillment_status: "not_started",
        total_usd: total,
        btc_address: btcAddress,
        btc_amount: btcAmount,
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
        items: pricedItems as unknown as Json,
        payment_proof_url: data.payment_proof_url || null,
        payment_tx_id: data.payment_tx_id?.trim() || null,
        discount_code: appliedCode,
        discount_amount_usd: discountAmount,
      })
      .select(
        "id, order_number, access_token, customer_email, customer_name, payment_method, payment_status, fulfillment_status, total_usd, btc_amount, payment_tx_id, payment_proof_url, notes, items, created_at, shipping_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_zip, shipping_country",
      )
      .single();

    if (error) throw new Error(error.message);

    // Best-effort n8n webhook — fired once per order immediately after DB creation.
    const savedOrderItems = (Array.isArray(order!.items) ? order!.items : pricedItems) as Array<{
      name?: string;
      quantity?: number;
      price?: number;
    }>;
    const firstOrderItem = savedOrderItems[0];
    const isVenmoOrder = order!.payment_method === "venmo";
    const isBtcOrder = order!.payment_method === "btc";
    const newOrderWebhookPayload: Record<string, unknown> = {
      ordernumber: order!.order_number,
      customername: order!.customer_name,
      customeremail: order!.customer_email,
      customerphone: data.customer.phone || null,
      products: {
        name: firstOrderItem?.name ?? null,
        quantity: firstOrderItem?.quantity ?? null,
        price: firstOrderItem?.price ?? null,
      },
      ordertotal: Number(order!.total_usd),
      paymentmethod: order!.payment_method,
      paymentstatus: order!.payment_status,
      fulfillmentstatus: order!.fulfillment_status,
      shippingaddress: {
        name: order!.shipping_name,
        address1: order!.shipping_address_1,
        address2: order!.shipping_address_2,
        city: order!.shipping_city,
        state: order!.shipping_state,
        zip: order!.shipping_zip,
        country: order!.shipping_country,
      },
      timestamp: order!.created_at,
    };

    // Always include all payment-method fields. Use "N/A" for the unused
    // method so n8n/Telegram never receives blank values.
    const NA = "N/A";
    if (isBtcOrder) {
      newOrderWebhookPayload.btcamountquoted = order!.btc_amount ?? NA;
      newOrderWebhookPayload.btctxid = order!.payment_tx_id ?? NA;
      newOrderWebhookPayload.btcpaymentproofurl = order!.payment_proof_url ?? NA;
      newOrderWebhookPayload.venmousername = NA;
      newOrderWebhookPayload.venmonotes = NA;
      newOrderWebhookPayload.venmopaymentproofurl = NA;
    } else if (isVenmoOrder) {
      // Venmo username is captured via payment_tx_id on the checkout form,
      // payment proof URL via payment_proof_url, and any buyer note via notes.
      newOrderWebhookPayload.venmousername = order!.payment_tx_id ?? NA;
      newOrderWebhookPayload.venmonotes = order!.notes ?? NA;
      newOrderWebhookPayload.venmopaymentproofurl = order!.payment_proof_url ?? NA;
      newOrderWebhookPayload.btcamountquoted = NA;
      newOrderWebhookPayload.btctxid = NA;
      newOrderWebhookPayload.btcpaymentproofurl = NA;
    } else {
      newOrderWebhookPayload.btcamountquoted = NA;
      newOrderWebhookPayload.btctxid = NA;
      newOrderWebhookPayload.btcpaymentproofurl = NA;
      newOrderWebhookPayload.venmousername = NA;
      newOrderWebhookPayload.venmonotes = NA;
      newOrderWebhookPayload.venmopaymentproofurl = NA;
    }

    try {
      console.log("[checkout order n8n webhook] webhook attempted", true);
      console.log("[checkout order n8n webhook] full URL used", N8N_NEW_ORDER_WEBHOOK_URL);
      console.log("[checkout order n8n webhook] JSON payload", JSON.stringify(newOrderWebhookPayload));

      const webhookResponse = await fetch(N8N_NEW_ORDER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrderWebhookPayload),
      });

      const webhookResponseBody = await webhookResponse.text();
      console.log("[checkout order n8n webhook] response status", webhookResponse.status);
      console.log("[checkout order n8n webhook] response body", webhookResponseBody);
    } catch (webhookError) {
      console.error(
        "[checkout order n8n webhook] error message",
        webhookError instanceof Error ? webhookError.message : String(webhookError),
      );
    }

    // Best-effort line items
    if (order?.id) {
      await supabaseAdmin.from("order_items").insert(
        pricedItems.map((i) => ({
          order_id: order.id,
          product_name: i.name,
          lot_number: i.lot || null,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      );
    }

    // Decrement inventory atomically for each line item. Best-effort: log
    // errors but never fail the order — the order is already recorded.
    for (const i of pricedItems) {
      const { error: decErr } = await supabaseAdmin.rpc("decrement_product_inventory", {
        _slug: i.slug,
        _qty: i.quantity,
      });
      if (decErr) {
        console.error("Inventory decrement failed", {
          slug: i.slug,
          qty: i.quantity,
          error: decErr.message,
        });
      }
    }

    // Best-effort order confirmation email — never fail the order if email errors.
    try {
      const siteOrigin = process.env.SITE_URL || "https://veratis.lovable.app";

      await enqueueTransactionalEmail({
        templateName: "order-confirmation",
        recipientEmail: data.customer.email,
        idempotencyKey: `order-confirmation-${order!.order_number}`,
        templateData: {
          orderNumber: order!.order_number,
          customerName: data.customer.name,
          items: pricedItems,
          subtotal: itemsTotal,
          shipping: shippingCost,
          total,
          shippingAddress: {
            name: data.shipping.name,
            address_1: data.shipping.address_1,
            address_2: data.shipping.address_2 || null,
            city: data.shipping.city,
            state: data.shipping.state,
            zip: data.shipping.zip,
            country: data.shipping.country,
          },
          orderUrl: `${siteOrigin}/checkout/thank-you/${order!.order_number}?t=${order!.access_token}`,
        },
      });
    } catch (e) {
      console.error("Order confirmation email failed", e);
    }

    return {
      order_number: order!.order_number,
      access_token: order!.access_token as string,
      total_usd: total,
      shipping_cost: shippingCost,
      discount_amount_usd: discountAmount,
      discount_code: appliedCode,
      btc_address: btcAddress,
      expires_at: expiresAt,
    };
  });

export const validatePromoCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        code: z
          .string()
          .min(2)
          .max(32)
          .regex(/^[A-Za-z0-9_-]+$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.rpc("lookup_promo_code", {
      _code: data.code,
    });
    if (error) throw new Error(error.message);
    const code = Array.isArray(rows) ? rows[0] : rows;
    if (!code || code.active === false) {
      return { valid: false as const, error: "Invalid or inactive code" };
    }
    return {
      valid: true as const,
      code: String(code.code),
      label: code.label as string | null,
      discount_type: code.discount_type as "percent" | "fixed",
      discount_amount: Number(code.discount_amount ?? 0),
    };
  });

export const getCheckoutOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        order_number: z.string().min(3).max(32),
        access_token: z
          .string()
          .min(8)
          .max(128)
          .regex(/^[A-Za-z0-9_-]+$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, access_token, customer_email, customer_name, status, payment_status, payment_method, fulfillment_status, total_usd, btc_address, btc_amount, payment_expires_at, payment_received_at, shipping_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_zip, shipping_country, shipping_method, items, created_at",
      )
      .eq("order_number", data.order_number.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");
    // Timing-safe-ish equality on the unguessable access token.
    const got = String(data.access_token);
    const want = String(order.access_token ?? "");
    if (got.length !== want.length) throw new Error("Order not found");
    let diff = 0;
    for (let i = 0; i < want.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
    if (diff !== 0) throw new Error("Order not found");
    return { ...order, btc_address: order.btc_address ?? STATIC_BTC_ADDRESS };
  });

export const getBtcUsdRate = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Coinbase ${res.status}`);
    const json = (await res.json()) as { data?: { amount?: string } };
    const rate = Number(json?.data?.amount);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("bad rate");
    return { rate, fetched_at: new Date().toISOString() };
  } catch (e) {
    return {
      rate: null as number | null,
      fetched_at: new Date().toISOString(),
      error: (e as Error).message,
    };
  }
});
