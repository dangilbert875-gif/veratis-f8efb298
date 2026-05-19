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

// ───────── Products ─────────

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .is("archived_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productStatus = z.enum(["draft", "published", "archived", "out_of_stock"]);

const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  category: z.string().max(128).nullable().optional(),
  short_description: z.string().max(512).nullable().optional(),
  full_description: z.string().max(20000).nullable().optional(),
  molecular_class: z.string().max(128).nullable().optional(),
  storage_guidance: z.string().max(1024).nullable().optional(),
  lyophilized: z.boolean().optional(),
  featured_image: z.string().max(1024).nullable().optional(),
  gallery_images: z.array(z.string().max(1024)).max(20).optional(),
  price_usd: z.number().min(0),
  compare_at_price: z.number().min(0).nullable().optional(),
  inventory_count: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  purity: z.string().max(64).nullable().optional(),
  endotoxin: z.string().max(64).nullable().optional(),
  tags: z.array(z.string().max(64)).max(20).optional(),
  meta_keywords: z.array(z.string().max(64)).max(20).optional(),
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().max(512).nullable().optional(),
  status: productStatus.optional(),
  featured: z.boolean().optional(),
  related_product_ids: z.array(z.string().uuid()).max(20).optional(),
  related_article_ids: z.array(z.string().uuid()).max(20).optional(),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const row: any = { ...data };
    if (!row.id) {
      delete row.id;
      row.created_by = userId;
    }
    const { error } = await supabase.from("products").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setProductStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: productStatus }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("products")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const archiveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("products")
      .update({ archived_at: new Date().toISOString(), status: "archived" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const duplicateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: src, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!src) throw new Error("Product not found");
    const { id, created_at, updated_at, archived_at, ...rest } = src;
    const copy = {
      ...rest,
      slug: `${src.slug}-copy-${Date.now().toString(36)}`,
      name: `${src.name} (Copy)`,
      status: "draft",
      created_by: userId,
    };
    const { error: insErr } = await supabase.from("products").insert(copy);
    if (insErr) throw new Error(insErr.message);
    return { ok: true };
  });

export const reorderProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ orderedIds: z.array(z.string().uuid()).max(500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    // Sequential updates - small N expected
    for (let i = 0; i < data.orderedIds.length; i++) {
      const { error } = await supabase
        .from("products")
        .update({ sort_order: i })
        .eq("id", data.orderedIds[i]);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ───────── Storage uploads ─────────

const uploadInput = z.object({
  bucket: z.enum(["product-images", "article-images", "coa-pdfs", "chromatograms", "raw-lab-data"]),
  path: z.string().min(1).max(512),
  contentBase64: z.string().min(1).max(15_000_000), // ~10MB binary
  contentType: z.string().min(1).max(128),
});

const PUBLIC_BUCKETS = new Set(["product-images", "article-images"]);

export const uploadAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const buf = Buffer.from(data.contentBase64, "base64");
    const safePath = data.path.replace(/[^a-zA-Z0-9._/-]/g, "_");
    const { error } = await supabase.storage
      .from(data.bucket)
      .upload(safePath, buf, { contentType: data.contentType, upsert: true });
    if (error) throw new Error(error.message);

    if (PUBLIC_BUCKETS.has(data.bucket)) {
      const { data: pub } = supabase.storage.from(data.bucket).getPublicUrl(safePath);
      return { path: safePath, url: pub.publicUrl, signed: false };
    }
    const { data: signed, error: sErr } = await supabase.storage
      .from(data.bucket)
      .createSignedUrl(safePath, 3600);
    if (sErr) throw new Error(sErr.message);
    return { path: safePath, url: signed.signedUrl, signed: true };
  });

export const getSignedAssetUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      bucket: z.enum(["coa-pdfs", "chromatograms", "raw-lab-data"]),
      path: z.string().min(1).max(512),
      expiresIn: z.number().int().min(60).max(86400).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: signed, error } = await supabase.storage
      .from(data.bucket)
      .createSignedUrl(data.path, data.expiresIn ?? 3600);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

// ───────── Product Lots ─────────

export const listLots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("product_lots")
      .select("*, products:product_id(id, name, slug)")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const lotInput = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().nullable().optional(),
  lot_number: z.string().min(1).max(128),
  purity: z.string().max(64).nullable().optional(),
  identity_status: z.string().max(64).nullable().optional(),
  identity_method: z.string().max(64).nullable().optional(),
  water_content: z.string().max(64).nullable().optional(),
  endotoxin: z.string().max(64).nullable().optional(),
  release_date: z.string().nullable().optional(),
  best_before: z.string().nullable().optional(),
  tested_by: z.string().max(128).nullable().optional(),
  lab_partner: z.string().max(128).nullable().optional(),
  coa_url: z.string().max(1024).nullable().optional(),
  lcms_url: z.string().max(1024).nullable().optional(),
  hplc_url: z.string().max(1024).nullable().optional(),
  notes: z.string().max(4096).nullable().optional(),
  active: z.boolean().optional(),
});

export const upsertLot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => lotInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const row: any = { ...data };
    if (!row.id) {
      delete row.id;
      row.created_by = userId;
    }
    const { error } = await supabase.from("product_lots").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setLotActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("product_lots")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const archiveLot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("product_lots")
      .update({ archived_at: new Date().toISOString(), active: false })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listVerificationLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("verification_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ───────── Pickers (lightweight lists) ─────────

export const listProductsLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug")
      .is("archived_at", null)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listArticlesLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("educational_articles")
      .select("id, title, slug")
      .is("archived_at", null)
      .order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });