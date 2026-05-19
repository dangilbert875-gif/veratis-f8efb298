import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    const revenue30d = orderRows
      .filter((o: any) =>
        ["paid", "shipped", "delivered"].includes(o.status) &&
        new Date(o.created_at).getTime() > Date.now() - 30 * 86400000,
      )
      .reduce((s: number, o: any) => s + Number(o.total_usd ?? 0), 0);

    return {
      orders: {
        total: orderRows.length,
        pending: orderRows.filter((o: any) => o.status === "pending" || o.status === "awaiting_payment").length,
        revenue30d,
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
      customers: { total: (profiles.data ?? []).length },
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
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
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