import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueTransactionalEmail } from "@/lib/email/enqueue.server";

async function sendOrderStatusEmail(orderId: string, newStatus: string, priorStatus?: string | null) {
  if (priorStatus === newStatus) return;
  if (newStatus !== "shipped" && newStatus !== "cancelled") return;
  try {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("order_number, customer_email, customer_name, shipping_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_zip, shipping_country, tracking_number, carrier")
      .eq("id", orderId)
      .maybeSingle();
    if (!order?.customer_email) return;
    const orderNumber = String(order.order_number ?? "");
    if (newStatus === "shipped") {
      await enqueueTransactionalEmail({
        templateName: "order-shipped",
        recipientEmail: order.customer_email,
        idempotencyKey: `order-shipped-${orderId}-${order.tracking_number ?? ""}`,
        templateData: {
          orderNumber,
          customerName: order.customer_name || order.shipping_name || undefined,
          trackingNumber: order.tracking_number || undefined,
          carrier: order.carrier || undefined,
          shippingAddress: order.shipping_address_1 ? {
            name: order.shipping_name,
            address_1: order.shipping_address_1,
            address_2: order.shipping_address_2,
            city: order.shipping_city,
            state: order.shipping_state,
            zip: order.shipping_zip,
            country: order.shipping_country,
          } : undefined,
        },
      });
    } else if (newStatus === "cancelled") {
      await enqueueTransactionalEmail({
        templateName: "order-cancelled",
        recipientEmail: order.customer_email,
        idempotencyKey: `order-cancelled-${orderId}`,
        templateData: {
          orderNumber,
          customerName: order.customer_name || order.shipping_name || undefined,
        },
      });
    }
  } catch (err) {
    console.warn("[orders] status email enqueue failed:", (err as any)?.message ?? err);
  }
}

type Role = "admin" | "research_partner" | "customer";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getViewerContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    const roleList: Role[] = (roles ?? []).map((r: any) => r.role);
    return {
      userId,
      email: profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      roles: roleList,
      isAdmin: roleList.includes("admin"),
    };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const [orders, referrals, payouts, profiles] = await Promise.all([
      supabase.from("orders").select("id, status, total_usd, created_at"),
      supabase.from("referrals").select("id, clicks, conversions, revenue_usd"),
      supabase.from("payouts").select("id, status, amount_usd"),
      supabase.from("profiles").select("id, created_at"),
    ]);

    const orderRows = orders.data ?? [];
    const paidLike = (o: any) =>
      ["paid", "shipped", "delivered"].includes(o.status);
    const now = Date.now();
    const within = (o: any, fromDaysAgo: number, toDaysAgo = 0) => {
      const t = new Date(o.created_at).getTime();
      return t > now - fromDaysAgo * 86400000 && t <= now - toDaysAgo * 86400000;
    };

    const revenue30d = orderRows
      .filter((o: any) => paidLike(o) && within(o, 30))
      .reduce((s: number, o: any) => s + Number(o.total_usd ?? 0), 0);
    const revenuePrev30d = orderRows
      .filter((o: any) => paidLike(o) && within(o, 60, 30))
      .reduce((s: number, o: any) => s + Number(o.total_usd ?? 0), 0);
    const orders7d = orderRows.filter((o: any) => within(o, 7)).length;
    const ordersPrev7d = orderRows.filter((o: any) => within(o, 14, 7)).length;

    // 14-day daily order count series for sparkline (oldest → newest)
    const series14: number[] = Array.from({ length: 14 }, (_, i) => {
      const dayIdx = 13 - i; // 13 = 13 days ago, 0 = today
      return orderRows.filter((o: any) => {
        const t = new Date(o.created_at).getTime();
        const start = now - (dayIdx + 1) * 86400000;
        const end = now - dayIdx * 86400000;
        return t > start && t <= end;
      }).length;
    });

    const profileRows = profiles.data ?? [];
    const newCustomers30d = profileRows.filter(
      (p: any) => new Date(p.created_at).getTime() > now - 30 * 86400000,
    ).length;

    return {
      orders: {
        total: orderRows.length,
        pending: orderRows.filter((o: any) => o.status === "pending" || o.status === "awaiting_payment").length,
        revenue30d,
        revenuePrev30d,
        orders7d,
        ordersPrev7d,
        series14,
      },
      referrals: {
        total: (referrals.data ?? []).length,
        clicks: (referrals.data ?? []).reduce((s: number, r: any) => s + Number(r.clicks ?? 0), 0),
        conversions: (referrals.data ?? []).reduce((s: number, r: any) => s + Number(r.conversions ?? 0), 0),
        revenue: (referrals.data ?? []).reduce((s: number, r: any) => s + Number(r.revenue_usd ?? 0), 0),
      },
      payouts: {
        total: (payouts.data ?? []).length,
        pending: (payouts.data ?? []).filter((p: any) => p.status === "pending" || p.status === "approved").length,
        outstanding: (payouts.data ?? [])
          .filter((p: any) => p.status !== "sent" && p.status !== "cancelled")
          .reduce((s: number, p: any) => s + Number(p.amount_usd ?? 0), 0),
      },
      customers: { total: profileRows.length, new30d: newCustomers30d },
      generatedAt: new Date().toISOString(),
    };
  });

// ───── Orders ─────
export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getOrderDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: order, error } = await supabase
      .from("orders").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");

    const { data: items } = await supabase
      .from("order_items").select("*").eq("order_id", data.id);

    let customerStats: any = null;
    if (order.customer_id || order.user_id) {
      const cid = order.customer_id ?? order.user_id;
      const { data: hist } = await supabase
        .from("orders")
        .select("id, total_usd, created_at, status")
        .or(`customer_id.eq.${cid},user_id.eq.${cid}`);
      const rows = hist ?? [];
      customerStats = {
        total_orders: rows.length,
        lifetime_spend: rows
          .filter((r: any) => ["paid","shipped","delivered"].includes(r.status))
          .reduce((s: number, r: any) => s + Number(r.total_usd ?? 0), 0),
        first_order_at: rows.length
          ? rows.map((r: any) => r.created_at).sort()[0]
          : null,
      };
    }

    return { order, items: items ?? [], customerStats };
  });

const orderPatchInput = z.object({
  id: z.string().uuid(),
  patch: z.object({
    payment_status: z.string().max(32).optional(),
    fulfillment_status: z.string().max(32).optional(),
    status: z.enum(["pending","awaiting_payment","paid","shipped","delivered","cancelled","refunded"]).optional(),
    risk_flag: z.boolean().optional(),
    tracking_number: z.string().max(128).nullable().optional(),
    carrier: z.string().max(64).nullable().optional(),
    shipping_method: z.string().max(64).nullable().optional(),
    shipped_at: z.string().nullable().optional(),
    delivered_at: z.string().nullable().optional(),
    payment_received_at: z.string().nullable().optional(),
    payment_expires_at: z.string().nullable().optional(),
    btc_tx_hash: z.string().max(128).nullable().optional(),
    btc_confirmations: z.number().int().min(0).optional(),
    btc_amount: z.number().nullable().optional(),
    btc_address: z.string().max(128).nullable().optional(),
    customer_name: z.string().max(128).nullable().optional(),
    customer_email: z.string().email().max(255).optional(),
    shipping_name: z.string().max(128).nullable().optional(),
    shipping_address_1: z.string().max(256).nullable().optional(),
    shipping_address_2: z.string().max(256).nullable().optional(),
    shipping_city: z.string().max(128).nullable().optional(),
    shipping_state: z.string().max(64).nullable().optional(),
    shipping_zip: z.string().max(32).nullable().optional(),
    shipping_country: z.string().max(64).nullable().optional(),
    internal_notes: z.string().max(4096).nullable().optional(),
    archived_at: z.string().nullable().optional(),
  }),
});

export const patchOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => orderPatchInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    // Snapshot prior state for audit logging
    const { data: prior } = await supabase
      .from("orders")
      .select("order_number, payment_status, fulfillment_status, status, tracking_number, carrier, archived_at, risk_flag")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabase
      .from("orders")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    // Audit log — record status-relevant transitions. Uses supabaseAdmin
    // so the write bypasses the SELECT-only RLS policy on audit_logs.
    try {
      if (prior) {
        const entries: Array<{ field: string; from: any; to: any }> = [];
        const watch = ["payment_status", "fulfillment_status", "status", "tracking_number", "carrier", "risk_flag", "archived_at"];
        for (const k of watch) {
          if (k in data.patch && (prior as any)[k] !== (data.patch as any)[k]) {
            entries.push({ field: k, from: (prior as any)[k], to: (data.patch as any)[k] });
          }
        }
        if (entries.length) {
          await supabaseAdmin.from("audit_logs").insert(
            entries.map((e) => ({
              actor_id: userId,
              action: `ORDER_${e.field.toUpperCase()}_CHANGE`,
              entity_type: "orders",
              entity_id: data.id,
              diff: {
                order_number: prior.order_number,
                field: e.field,
                old: e.from,
                new: e.to,
              },
            })),
          );
        }
      }
    } catch (err) {
      // Audit failure must not break the operational update
      console.warn("[orders] audit log write failed:", (err as any)?.message ?? err);
    }

    // Trigger status-change customer emails (shipped / cancelled)
    if (data.patch.status && data.patch.status !== (prior as any)?.status) {
      await sendOrderStatusEmail(data.id, data.patch.status, (prior as any)?.status);
    }

    return { ok: true };
  });

const bulkOrderInput = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  action: z.enum([
    "mark_processing","mark_packed","mark_shipped","mark_delivered",
    "mark_paid","archive","unarchive","delete",
  ]),
});

export const bulkOrderAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bulkOrderInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const now = new Date().toISOString();
    let patch: Record<string, any> = {};
    if (data.action === "mark_processing") patch = { fulfillment_status: "processing" };
    else if (data.action === "mark_packed") patch = { fulfillment_status: "packed" };
    else if (data.action === "mark_shipped") patch = { fulfillment_status: "shipped", shipped_at: now, status: "shipped" };
    else if (data.action === "mark_delivered") patch = { fulfillment_status: "delivered", delivered_at: now, status: "delivered" };
    else if (data.action === "mark_paid") patch = { payment_status: "confirmed", payment_received_at: now, status: "paid" };
    else if (data.action === "archive") patch = { archived_at: now };
    else if (data.action === "unarchive") patch = { archived_at: null };
    else if (data.action === "delete") {
      const { error } = await supabase.from("orders").delete().in("id", data.ids);
      if (error) throw new Error(error.message);
      return { ok: true, count: data.ids.length };
    }
    patch.updated_at = now;
    const { error } = await supabase.from("orders").update(patch).in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.ids.length };
  });

const orderInput = z.object({
  id: z.string().uuid().optional(),
  order_number: z.string().min(1).max(64),
  customer_email: z.string().email(),
  status: z.enum(["pending", "awaiting_payment", "paid", "shipped", "delivered", "cancelled", "refunded"]),
  total_usd: z.number().min(0),
  btc_amount: z.number().nullable().optional(),
  btc_address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const upsertOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => orderInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("orders").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───── Referrals ─────
export const listReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("referrals")
      .select("*, profiles:partner_id(email, full_name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const referralInput = z.object({
  id: z.string().uuid().optional(),
  partner_id: z.string().uuid(),
  code: z.string().min(2).max(32).regex(/^[A-Za-z0-9_-]+$/),
  label: z.string().max(128).nullable().optional(),
  clicks: z.number().int().min(0),
  conversions: z.number().int().min(0),
  revenue_usd: z.number().min(0),
  commission_rate: z.number().min(0).max(1),
});

export const upsertReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => referralInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("referrals").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("referrals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───── Payouts ─────
export const listPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("payouts")
      .select("*, profiles:partner_id(email, full_name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const payoutInput = z.object({
  id: z.string().uuid().optional(),
  partner_id: z.string().uuid(),
  amount_usd: z.number().min(0),
  btc_amount: z.number().nullable().optional(),
  btc_address: z.string().max(128).nullable().optional(),
  status: z.enum(["pending", "approved", "sent", "cancelled"]),
  notes: z.string().max(1024).nullable().optional(),
  paid_at: z.string().nullable().optional(),
});

export const upsertPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => payoutInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("payouts").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("payouts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ───── Customers / Roles ─────
export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ q: z.string().max(128).optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    let query = supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }).limit(200);
    if (data.q) {
      query = query.or(`email.ilike.%${data.q}%,full_name.ilike.%${data.q}%`);
    }
    const { data: profiles, error } = await query;
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map((p: any) => p.id);
    if (!ids.length) return [];
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("user_id", ids);
    const roleMap: Record<string, Role[]> = {};
    (roles ?? []).forEach((r: any) => {
      roleMap[r.user_id] = [...(roleMap[r.user_id] ?? []), r.role];
    });
    return (profiles ?? []).map((p: any) => ({ ...p, roles: roleMap[p.id] ?? [] }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      user_id: z.string().uuid(),
      role: z.enum(["admin", "research_partner", "customer"]),
      enabled: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    if (data.enabled) {
      const { error } = await supabase.from("user_roles").upsert({ user_id: data.user_id, role: data.role });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ───── Operational alerts (Phase 2.5 A) ─────
export const getAdminAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const today = new Date().toISOString().slice(0, 10);

    const [products, lots, payouts, orders] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, inventory_count, low_stock_threshold, status, archived_at")
        .is("archived_at", null),
      supabase
        .from("product_lots")
        .select("id, lot_number, best_before, active, archived_at, product_id")
        .is("archived_at", null),
      supabase
        .from("payouts")
        .select("id, status, amount_usd, partner_id")
        .in("status", ["pending", "approved"]),
      supabase
        .from("orders")
        .select("id, order_number, status, risk_flag, archived_at")
        .is("archived_at", null),
    ]);

    const lowStock = (products.data ?? []).filter(
      (p: any) =>
        p.status === "published" &&
        Number(p.inventory_count ?? 0) <= Number(p.low_stock_threshold ?? 0),
    );

    const expiredLots = (lots.data ?? []).filter(
      (l: any) => l.best_before && l.best_before < today && l.active,
    );

    const pendingPayouts = payouts.data ?? [];
    const flaggedOrders = (orders.data ?? []).filter((o: any) => o.risk_flag);
    const unfulfilledOrders = (orders.data ?? []).filter(
      (o: any) => o.status === "paid",
    );

    return {
      lowStock: lowStock.map((p: any) => ({
        id: p.id,
        label: p.name,
        slug: p.slug,
        count: Number(p.inventory_count ?? 0),
      })),
      expiredLots: expiredLots.map((l: any) => ({
        id: l.id,
        lot_number: l.lot_number,
        best_before: l.best_before,
      })),
      pendingPayouts: {
        count: pendingPayouts.length,
        total: pendingPayouts.reduce(
          (s: number, p: any) => s + Number(p.amount_usd ?? 0),
          0,
        ),
      },
      flaggedOrders: flaggedOrders.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
      })),
      unfulfilledOrders: {
        count: unfulfilledOrders.length,
      },
    };
  });

// ───── Global command-bar search (Phase 2.5 A) ─────
const searchInput = z.object({ q: z.string().max(128).optional() });

export const commandSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => searchInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const q = (data.q ?? "").trim();
    const like = q ? `%${q.replace(/[%_]/g, "")}%` : null;

    const limited = (table: string, sel: string, filter: (qb: any) => any) => {
      let qb = supabase.from(table).select(sel).limit(8);
      qb = filter(qb);
      return qb;
    };

    const [products, orders, customers, articles, lots, affiliates, partners] =
      await Promise.all([
        limited("products", "id, name, slug, status", (qb: any) =>
          like ? qb.or(`name.ilike.${like},slug.ilike.${like}`) : qb.order("updated_at", { ascending: false }),
        ),
        limited("orders", "id, order_number, customer_email, status", (qb: any) =>
          like
            ? qb.or(`order_number.ilike.${like},customer_email.ilike.${like}`)
            : qb.order("created_at", { ascending: false }),
        ),
        limited("profiles", "id, email, full_name", (qb: any) =>
          like ? qb.or(`email.ilike.${like},full_name.ilike.${like}`) : qb.order("created_at", { ascending: false }),
        ),
        limited("educational_articles", "id, title, slug, status", (qb: any) =>
          like ? qb.or(`title.ilike.${like},slug.ilike.${like}`) : qb.order("updated_at", { ascending: false }),
        ),
        limited("product_lots", "id, lot_number, product_id, active", (qb: any) =>
          like ? qb.ilike("lot_number", like) : qb.order("created_at", { ascending: false }),
        ),
        limited("affiliates", "id, affiliate_code, user_id, status", (qb: any) =>
          like ? qb.ilike("affiliate_code", like) : qb.order("created_at", { ascending: false }),
        ),
        limited("research_partners", "id, institution, contact_email, status", (qb: any) =>
          like
            ? qb.or(`institution.ilike.${like},contact_email.ilike.${like}`)
            : qb.order("created_at", { ascending: false }),
        ),
      ]);

    return {
      products: products.data ?? [],
      orders: orders.data ?? [],
      customers: customers.data ?? [],
      articles: articles.data ?? [],
      lots: lots.data ?? [],
      affiliates: affiliates.data ?? [],
      partners: partners.data ?? [],
    };
  });