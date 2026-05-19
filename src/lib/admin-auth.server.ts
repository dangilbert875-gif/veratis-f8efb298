// Server-only helpers for admin permission checks.
// Use inside createServerFn handlers protected by requireSupabaseAuth.

export async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function requireAdmin(supabase: any, userId: string): Promise<void> {
  if (!(await isAdmin(supabase, userId))) {
    throw new Error("Forbidden: admin role required");
  }
}

/**
 * Soft-delete a row in any archivable table via the public.soft_delete()
 * SQL function. The function itself re-checks admin role.
 */
export async function softDelete(
  supabase: any,
  table:
    | "products"
    | "educational_articles"
    | "product_lots"
    | "orders"
    | "affiliates"
    | "customer_meta"
    | "research_partners",
  id: string,
): Promise<void> {
  const { error } = await supabase.rpc("soft_delete", { _table: table, _id: id });
  if (error) throw new Error(error.message);
}

export async function restore(
  supabase: any,
  table:
    | "products"
    | "educational_articles"
    | "product_lots"
    | "orders"
    | "affiliates"
    | "customer_meta"
    | "research_partners",
  id: string,
): Promise<void> {
  const { error } = await supabase.rpc("restore", { _table: table, _id: id });
  if (error) throw new Error(error.message);
}

/** Convenience: extract { supabase, userId } from a server-fn context. */
export function authCtx(context: unknown): { supabase: any; userId: string } {
  const c = context as any;
  return { supabase: c.supabase, userId: c.userId };
}