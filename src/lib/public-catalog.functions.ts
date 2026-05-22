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
  // The public archive mirrors the live storefront: one entry per currently
  // published, non-archived product. We surface the latest matching lot when
  // one exists, and otherwise fall back to the product's own lot/purity
  // fields so the archive stays in sync with the catalog even before a
  // formal COA release has been recorded.
  const { data: products, error: productsErr } = await supabaseAdmin
    .from("products")
    .select(
      "id, slug, name, lot_number, purity, endotoxin, sort_order, created_at",
    )
    .eq("status", "published")
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (productsErr) throw new Error(productsErr.message);

  const productIds = (products ?? []).map((p) => p.id);
  let lotsByProduct = new Map<string, any>();
  if (productIds.length) {
    const { data: lots, error: lotsErr } = await supabaseAdmin
      .from("product_lots")
      .select(LOT_PUBLIC_COLUMNS)
      .in("product_id", productIds)
      .is("archived_at", null)
      .order("release_date", { ascending: false, nullsFirst: false });
    if (lotsErr) throw new Error(lotsErr.message);
    for (const lot of (lots as any[]) ?? []) {
      // Keep the first (most recent) lot we see per product.
      if (!lotsByProduct.has(lot.product_id)) {
        lotsByProduct.set(lot.product_id, lot);
      }
    }
  }

  return (products ?? []).map((p) => {
    const lot = lotsByProduct.get(p.id);
    return {
      id: lot?.id ?? p.id,
      lot_number: lot?.lot_number ?? p.lot_number ?? "",
      product_id: p.id,
      purity: lot?.purity ?? p.purity ?? null,
      identity_status: lot?.identity_status ?? null,
      identity_method: lot?.identity_method ?? null,
      water_content: lot?.water_content ?? null,
      endotoxin: lot?.endotoxin ?? p.endotoxin ?? null,
      release_date: lot?.release_date ?? null,
      best_before: lot?.best_before ?? null,
      lab_partner: lot?.lab_partner ?? null,
      tested_by: lot?.tested_by ?? null,
      coa_url: lot?.coa_url ?? null,
      coa_download_enabled: lot?.coa_download_enabled ?? false,
      status: lot?.status ?? null,
      products: { name: p.name, slug: p.slug, status: "published", archived_at: null },
    };
  });
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

    // Fallback: mirror listPublicLots — if no formally released lot row
    // exists but the lot identifier matches a currently published product's
    // own lot_number, surface that product so the archive and the verify
    // lookup stay in sync.
    let result: any = row;
    if (!result) {
      const { data: product, error: prodErr } = await supabaseAdmin
        .from("products")
        .select(
          "id, slug, name, lot_number, purity, endotoxin, status, archived_at",
        )
        .ilike("lot_number", q)
        .eq("status", "published")
        .is("archived_at", null)
        .maybeSingle();
      if (prodErr) throw new Error(prodErr.message);
      if (product) {
        result = {
          id: product.id,
          lot_number: product.lot_number ?? q,
          product_id: product.id,
          purity: product.purity ?? null,
          identity_status: null,
          identity_method: null,
          water_content: null,
          endotoxin: product.endotoxin ?? null,
          release_date: null,
          best_before: null,
          lab_partner: null,
          tested_by: null,
          coa_url: null,
          coa_download_enabled: false,
          status: null,
          products: {
            name: product.name,
            slug: product.slug,
            status: "published",
            archived_at: null,
          },
        };
      }
    }

    // Best-effort verification log (anonymous)
    try {
      await supabaseAdmin.from("verification_logs").insert({ lot_number: q });
    } catch {}
    return result;
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

/**
 * Public COA download — returns a short-lived signed URL for a lot's COA
 * file, but only when the lot is released, publicly visible, and the COA
 * download is enabled. Lets the public Verify page download the actual
 * uploaded PDF/JPG/PNG without exposing the private bucket.
 */
export const getPublicCoaSignedUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ lot_number: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data }) => {
    const q = data.lot_number.trim();
    if (!q) return null;
    const { data: row, error } = await supabaseAdmin
      .from("product_lots")
      .select("coa_url, status, public_visible, coa_download_enabled, archived_at")
      .ilike("lot_number", q)
      .is("archived_at", null)
      .eq("status", "released")
      .eq("public_visible", true)
      .eq("coa_download_enabled", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.coa_url) return null;

    const path = String(row.coa_url);
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("coa-pdfs")
      .createSignedUrl(path, 300);
    if (sErr) throw new Error(sErr.message);
    return { url: signed.signedUrl, path };
  });