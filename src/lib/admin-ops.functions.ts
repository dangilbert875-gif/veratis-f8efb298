import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

// ─────────────────────────────────────────────
// Activity feed. unified across audit_logs,
// verification_logs, and article_views.
// ─────────────────────────────────────────────

const activityFilter = z.object({
  filter: z
    .enum(["all", "orders", "products", "verification", "customers", "affiliates", "articles", "lots"])
    .default("all"),
  limit: z.number().int().min(1).max(200).default(80),
});

export type ActivityItem = {
  kind: "audit" | "verification" | "view";
  id: string;
  ts: string;
  actor_id: string | null;
  actor_label: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  summary: string;
};

export const getActivityFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => activityFilter.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    // Map filter → entity_types
    const filterMap: Record<string, string[] | null> = {
      all: null,
      orders: ["orders", "order_items"],
      products: ["products"],
      verification: ["product_lots"],
      customers: ["customer_meta", "profiles", "user_roles"],
      affiliates: ["affiliates", "affiliate_referrals", "referrals", "referral_clicks"],
      articles: ["educational_articles"],
      lots: ["product_lots"],
    };
    const entityTypes = filterMap[data.filter];

    let auditQ = supabase
      .from("audit_logs")
      .select("id, created_at, actor_id, action, entity_type, entity_id, diff")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (entityTypes) auditQ = auditQ.in("entity_type", entityTypes);
    const { data: auditRows } = await auditQ;

    let verifications: any[] = [];
    if (data.filter === "all" || data.filter === "verification") {
      const { data: vr } = await supabase
        .from("verification_logs")
        .select("id, created_at, lot_number, lookup_ip")
        .order("created_at", { ascending: false })
        .limit(Math.min(40, data.limit));
      verifications = vr ?? [];
    }

    // Resolve actor labels for unique ids
    const actorIds = Array.from(
      new Set(
        (auditRows ?? [])
          .map((r: any) => r.actor_id)
          .filter((v: any): v is string => Boolean(v)),
      ),
    );
    const labelMap: Record<string, string> = {};
    if (actorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", actorIds);
      (profs ?? []).forEach((p: any) => {
        labelMap[p.id] = p.full_name || p.email || p.id.slice(0, 8);
      });
    }

    const auditItems: ActivityItem[] = (auditRows ?? []).map((r: any) => ({
      kind: "audit",
      id: r.id,
      ts: r.created_at,
      actor_id: r.actor_id ?? null,
      actor_label: r.actor_id ? labelMap[r.actor_id] ?? null : null,
      entity_type: r.entity_type,
      entity_id: r.entity_id ?? null,
      action: r.action,
      summary: summarize(r),
    }));

    const verifItems: ActivityItem[] = verifications.map((v: any) => ({
      kind: "verification",
      id: v.id,
      ts: v.created_at,
      actor_id: null,
      actor_label: "public",
      entity_type: "product_lots",
      entity_id: null,
      action: "lookup",
      summary: `Public verification lookup · lot ${v.lot_number}`,
    }));

    const merged = [...auditItems, ...verifItems].sort(
      (a, b) => (a.ts < b.ts ? 1 : -1),
    );
    return merged.slice(0, data.limit);
  });

function summarize(row: any): string {
  const t = row.entity_type;
  const act = row.action;
  const newRow = row?.diff?.new ?? {};
  const oldRow = row?.diff?.old ?? {};
  const headline = (() => {
    switch (t) {
      case "products":
        return newRow.name || oldRow.name || row.entity_id;
      case "product_lots":
        return `lot ${newRow.lot_number || oldRow.lot_number || row.entity_id}`;
      case "orders":
        return `order ${newRow.order_number || oldRow.order_number || row.entity_id}`;
      case "educational_articles":
        return `“${newRow.title || oldRow.title || row.entity_id}”`;
      case "affiliates":
        return `affiliate ${newRow.affiliate_code || oldRow.affiliate_code || row.entity_id}`;
      case "research_partners":
        return newRow.institution || oldRow.institution || row.entity_id;
      case "customer_meta":
        return `customer ${row.entity_id?.slice(0, 8) ?? ""}`;
      case "internal_notes":
        return `note on ${newRow.entity_type || oldRow.entity_type}`;
      default:
        return row.entity_id ?? "";
    }
  })();
  const verb =
    act === "INSERT" ? "created" : act === "DELETE" ? "deleted" : "updated";
  return `${t.replace(/_/g, " ")} ${verb}. ${headline}`;
}

// ─────────────────────────────────────────────
// Audit log viewer. paginated, with diff
// ─────────────────────────────────────────────

const auditFilter = z.object({
  entity_type: z.string().max(64).optional(),
  actor_id: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(200).default(100),
});

export const getAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => auditFilter.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    let q = supabase
      .from("audit_logs")
      .select("id, created_at, actor_id, action, entity_type, entity_id, diff")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.entity_type) q = q.eq("entity_type", data.entity_type);
    if (data.actor_id) q = q.eq("actor_id", data.actor_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const actorIds = Array.from(
      new Set((rows ?? []).map((r: any) => r.actor_id).filter(Boolean)),
    ) as string[];
    const labelMap: Record<string, string> = {};
    if (actorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", actorIds);
      (profs ?? []).forEach((p: any) => {
        labelMap[p.id] = p.full_name || p.email || p.id.slice(0, 8);
      });
    }

    return (rows ?? []).map((r: any) => ({
      ...r,
      actor_label: r.actor_id ? labelMap[r.actor_id] ?? null : null,
    }));
  });

export const getAuditEntityTypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("audit_logs")
      .select("entity_type")
      .limit(1000);
    const set = new Set<string>();
    (data ?? []).forEach((r: any) => set.add(r.entity_type));
    return Array.from(set).sort();
  });

// ─────────────────────────────────────────────
// Internal notes (polymorphic)
// ─────────────────────────────────────────────

const entityEnum = z.enum([
  "product",
  "order",
  "customer",
  "lot",
  "article",
  "affiliate",
  "research_partner",
]);

export const listNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ entity_type: entityEnum, entity_id: z.string().min(1).max(128) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: rows, error } = await supabase
      .from("internal_notes")
      .select("id, body_md, pinned, author_id, created_at, updated_at")
      .eq("entity_type", data.entity_type)
      .eq("entity_id", data.entity_id)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = Array.from(
      new Set((rows ?? []).map((r: any) => r.author_id).filter(Boolean)),
    ) as string[];
    const labelMap: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", ids);
      (profs ?? []).forEach((p: any) => {
        labelMap[p.id] = p.full_name || p.email || p.id.slice(0, 8);
      });
    }
    return (rows ?? []).map((r: any) => ({
      ...r,
      author_label: r.author_id ? labelMap[r.author_id] ?? null : null,
    }));
  });

export const upsertNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        entity_type: entityEnum,
        entity_id: z.string().min(1).max(128),
        body_md: z.string().min(1).max(8000),
        pinned: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const payload: any = {
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      body_md: data.body_md,
      pinned: data.pinned,
      author_id: userId,
    };
    if (data.id) payload.id = data.id;
    const { error } = await supabase.from("internal_notes").upsert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("internal_notes")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────
// Relational links. used by detail drawers
// ─────────────────────────────────────────────

export const getProductRelations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ product_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const product_id = data.product_id;

    const [lots, articles, recentOrders, product] = await Promise.all([
      supabase
        .from("product_lots")
        .select("id, lot_number, active, best_before, coa_url")
        .eq("product_id", product_id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("educational_articles")
        .select("id, title, status")
        .contains("related_product_ids", [product_id])
        .limit(20),
      supabase
        .from("order_items")
        .select("id, quantity, order_id")
        .eq("product_id", product_id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("products")
        .select("related_product_ids")
        .eq("id", product_id)
        .maybeSingle(),
    ]);

    let relatedProducts: any[] = [];
    const relIds: string[] = product.data?.related_product_ids ?? [];
    if (relIds.length) {
      const { data: rp } = await supabase
        .from("products")
        .select("id, name, slug, status")
        .in("id", relIds);
      relatedProducts = rp ?? [];
    }

    return {
      lots: lots.data ?? [],
      articles: articles.data ?? [],
      recentOrders: recentOrders.data ?? [],
      relatedProducts,
    };
  });

export const getCustomerRelations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ profile_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const pid = data.profile_id;

    const [orders, affiliate, meta] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, status, total_usd, created_at")
        .or(`customer_id.eq.${pid},user_id.eq.${pid}`)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("affiliates")
        .select("id, affiliate_code, status, total_sales")
        .eq("user_id", pid)
        .maybeSingle(),
      supabase
        .from("customer_meta")
        .select("affiliate_id, referral_source, tags, total_spend, last_order_at")
        .eq("profile_id", pid)
        .maybeSingle(),
    ]);

    return {
      orders: orders.data ?? [],
      affiliate: affiliate.data ?? null,
      meta: meta.data ?? null,
    };
  });