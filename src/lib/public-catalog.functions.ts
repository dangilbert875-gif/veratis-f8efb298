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