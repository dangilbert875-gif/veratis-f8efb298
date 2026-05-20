// Public catalog server functions. No auth required — uses the admin client
// scoped to safe public projections (status='published', non-archived).
// Safe to call from public route loaders and components.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const COLUMNS =
  "id, slug, name, category, dosage, size_label, price_usd, purity, endotoxin, lot_number, stock_status, featured, featured_image, short_description, full_description, molecular_class, sort_order";

export const listPublishedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(COLUMNS)
      .eq("status", "published")
      .is("archived_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPublishedProductBySlug = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string().min(1).max(255) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select(COLUMNS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ───────── Public verification lots ─────────

const LOT_PUBLIC_COLUMNS =
  "id, lot_number, product_id, purity, identity_status, identity_method, " +
  "water_content, endotoxin, release_date, best_before, lab_partner, tested_by, " +
  "coa_url, coa_download_enabled, status";

/** Public COA archive — released + public_visible only. */
export const listPublicLots = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("product_lots")
    .select(
      LOT_PUBLIC_COLUMNS +
        ", products:product_id!inner(name, slug, status, archived_at)",
    )
    .eq("status", "released")
    .eq("public_visible", true)
    .is("archived_at", null)
    .eq("products.status", "published")
    .is("products.archived_at", null)
    .order("release_date", { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Public Verify Batch lookup — returns null when not publicly verifiable. */
export const lookupPublicLot = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ lot_number: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data }) => {
    const q = data.lot_number.trim();
    if (!q) return null;
    const { data: row, error } = await supabaseAdmin
      .from("product_lots")
      .select(
        LOT_PUBLIC_COLUMNS +
          ", products:product_id!inner(name, slug, status, archived_at)",
      )
      .ilike("lot_number", q)
      .eq("status", "released")
      .eq("public_visible", true)
      .eq("verify_lookup_enabled", true)
      .is("archived_at", null)
      .eq("products.status", "published")
      .is("products.archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Best-effort verification log (anonymous)
    try {
      await supabaseAdmin.from("verification_logs").insert({ lot_number: q });
    } catch {}
    return row;
  });

/** Public lot lookup by product (for product detail pages). */
export const listPublicLotsForProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ product_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("product_lots")
      .select(LOT_PUBLIC_COLUMNS + ", products:product_id!inner(status, archived_at)")
      .eq("product_id", data.product_id)
      .eq("status", "released")
      .eq("product_page_visible", true)
      .is("archived_at", null)
      .eq("products.status", "published")
      .is("products.archived_at", null)
      .order("release_date", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });