import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BOOTSTRAP_ADMIN_EMAIL = "dangilbert875@gmail.com";

export const resolveAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context as any;
    const authEmail = typeof claims?.email === "string" ? claims.email.toLowerCase() : null;
    const authUser = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authUser.error) throw new Error(`Supabase query failed: ${authUser.error.message}`);

    const email = (authUser.data.user?.email ?? authEmail ?? "").toLowerCase();
    const fullName = authUser.data.user?.user_metadata?.full_name ?? authUser.data.user?.user_metadata?.name ?? null;
    const isBootstrapAdmin = email === BOOTSTRAP_ADMIN_EMAIL;

    const profileLookup = await supabase.from("profiles").select("id, email, full_name").eq("id", userId).maybeSingle();
    if (profileLookup.error) {
      const message = profileLookup.error.message ?? "Profile lookup failed";
      if (/permission|rls|policy/i.test(message)) throw new Error(`RLS blocked profile lookup: ${message}`);
      throw new Error(`Supabase query failed: ${message}`);
    }

    if (!profileLookup.data) {
      if (!isBootstrapAdmin) {
        return { isAdmin: false, userId, email, fullName, roles: [], debug: "Profile missing" };
      }
      const { error } = await supabaseAdmin.from("profiles").upsert({ id: userId, email, full_name: fullName });
      if (error) throw new Error(`Supabase query failed: ${error.message}`);
      console.info("[Admin Auth] Profile missing; created bootstrap admin profile", { userId, email });
    }

    const roleLookup = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (roleLookup.error) {
      const message = roleLookup.error.message ?? "Role lookup failed";
      if (/permission|rls|policy/i.test(message)) throw new Error(`RLS blocked admin role validation: ${message}`);
      throw new Error(`Supabase query failed: ${message}`);
    }

    let roles = (roleLookup.data ?? []).map((row: any) => row.role as string);
    if (!roles.includes("admin") && isBootstrapAdmin) {
      const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" });
      if (error) throw new Error(`Supabase query failed: ${error.message}`);
      roles = [...roles, "admin"];
      console.info("[Admin Auth] Admin role missing; assigned bootstrap admin role", { userId, email });
    }

    return {
      isAdmin: roles.includes("admin"),
      userId,
      email,
      fullName: profileLookup.data?.full_name ?? fullName,
      roles,
      debug: roles.includes("admin") ? "Admin role validated" : "Admin role missing",
    };
  });