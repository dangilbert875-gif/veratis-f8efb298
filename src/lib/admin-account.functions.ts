import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

// ─── helpers ──────────────────────────────────────────────────────────────

async function getRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => r.role as string);
}

async function assertAdminRoles(userId: string): Promise<string[]> {
  const roles = await getRoles(userId);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: admin role required");
  }
  return roles;
}

async function assertSuperAdmin(userId: string): Promise<void> {
  const roles = await getRoles(userId);
  if (!roles.includes("super_admin")) {
    throw new Error("Forbidden: super_admin role required");
  }
}

async function verifyPassword(email: string, password: string): Promise<void> {
  // Use a transient client with the publishable key. no session persistence.
  const tmp = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await tmp.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Current password is incorrect");
}

async function audit(
  actor: string,
  action: string,
  target: string | null,
  diff: Record<string, unknown>,
) {
  await supabaseAdmin.rpc("log_admin_account_event", {
    _actor: actor,
    _action: action,
    _target_user: target as string,
    _diff: diff as any,
  });
}

async function superAdminCount(): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("super_admin_count");
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

// ─── viewer / overview ────────────────────────────────────────────────────

export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as any;
    const roles = await assertAdminRoles(userId);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("id", userId)
      .maybeSingle();

    // List every admin / super_admin
    const { data: rolesRows, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "super_admin"]);
    if (rolesErr) throw new Error(rolesErr.message);

    const byUser = new Map<string, Set<string>>();
    for (const r of rolesRows ?? []) {
      const set = byUser.get(r.user_id) ?? new Set<string>();
      set.add(r.role as string);
      byUser.set(r.user_id, set);
    }

    const adminIds = Array.from(byUser.keys());
    const { data: profileRows } = adminIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, email, full_name, created_at")
          .in("id", adminIds)
      : { data: [] as any[] };

    const admins = (profileRows ?? []).map((p: any) => ({
      id: p.id as string,
      email: p.email as string | null,
      fullName: p.full_name as string | null,
      createdAt: p.created_at as string | null,
      roles: Array.from(byUser.get(p.id) ?? []),
      isSelf: p.id === userId,
    }));

    return {
      viewer: {
        userId: userId as string,
        email: profile?.email ?? null,
        fullName: profile?.full_name ?? null,
        roles,
      },
      admins,
      superAdminCount: await superAdminCount(),
    };
  });

// ─── change email ─────────────────────────────────────────────────────────

export const changeAdminEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1).max(200),
        newEmail: z.string().trim().email().max(255),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await assertAdminRoles(userId);

    const { data: me } = await supabaseAdmin.auth.admin.getUserById(userId);
    const currentEmail = me.user?.email;
    if (!currentEmail) throw new Error("Current account has no email on file");
    if (currentEmail.toLowerCase() === data.newEmail.toLowerCase()) {
      throw new Error("New email is the same as the current email");
    }

    await verifyPassword(currentEmail, data.currentPassword);

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: data.newEmail,
      email_confirm: true,
    });
    if (updateErr) throw new Error(updateErr.message);

    await supabaseAdmin
      .from("profiles")
      .update({ email: data.newEmail })
      .eq("id", userId);

    await audit(userId, "admin.email_changed", userId, {
      from: currentEmail,
      to: data.newEmail,
    });

    return { ok: true, email: data.newEmail };
  });

// ─── change password ──────────────────────────────────────────────────────

export const changeAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1).max(200),
        newPassword: z.string().min(10).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await assertAdminRoles(userId);

    const { data: me } = await supabaseAdmin.auth.admin.getUserById(userId);
    const currentEmail = me.user?.email;
    if (!currentEmail) throw new Error("Current account has no email on file");

    await verifyPassword(currentEmail, data.currentPassword);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);

    await audit(userId, "admin.password_changed", userId, {});

    return { ok: true };
  });

// ─── create a new admin (migration flow) ──────────────────────────────────

export const createNewAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1).max(200),
        email: z.string().trim().email().max(255),
        password: z.string().min(10).max(200),
        fullName: z.string().trim().min(1).max(255).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await assertSuperAdmin(userId);

    const { data: me } = await supabaseAdmin.auth.admin.getUserById(userId);
    const currentEmail = me.user?.email;
    if (!currentEmail) throw new Error("Current account has no email on file");
    await verifyPassword(currentEmail, data.currentPassword);

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.fullName ? { full_name: data.fullName } : undefined,
    });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? "Could not create user");
    }
    const newId = created.user.id;

    // handle_new_user trigger seeds profile + customer role; ensure profile values
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: newId, email: data.email, full_name: data.fullName ?? null });

    // Grant both admin and super_admin
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        [
          { user_id: newId, role: "admin" as any },
          { user_id: newId, role: "super_admin" as any },
        ],
        { onConflict: "user_id,role" },
      );
    if (roleErr) throw new Error(roleErr.message);

    await audit(userId, "admin.created", newId, {
      email: data.email,
      full_name: data.fullName ?? null,
      roles: ["admin", "super_admin"],
    });

    return { ok: true, userId: newId, email: data.email };
  });

// ─── disable / remove another admin ───────────────────────────────────────

export const disableAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        currentPassword: z.string().min(1).max(200),
        targetUserId: z.string().uuid(),
        mode: z.enum(["revoke_roles", "delete_user"]).default("revoke_roles"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as any;
    await assertSuperAdmin(userId);

    const { data: me } = await supabaseAdmin.auth.admin.getUserById(userId);
    const currentEmail = me.user?.email;
    if (!currentEmail) throw new Error("Current account has no email on file");
    await verifyPassword(currentEmail, data.currentPassword);

    if (data.targetUserId === userId) {
      throw new Error("You cannot disable your own account from this screen");
    }

    const targetRoles = await getRoles(data.targetUserId);
    if (!targetRoles.includes("admin") && !targetRoles.includes("super_admin")) {
      throw new Error("Target user is not an admin");
    }

    // Safety: never let the last super_admin be removed
    if (targetRoles.includes("super_admin")) {
      const count = await superAdminCount();
      if (count <= 1) {
        throw new Error("Cannot remove the last super_admin");
      }
    }

    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", data.targetUserId)
      .maybeSingle();

    if (data.mode === "delete_user") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(data.targetUserId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.targetUserId)
        .in("role", ["admin", "super_admin"]);
      if (error) throw new Error(error.message);
    }

    await audit(userId, "admin.disabled", data.targetUserId, {
      mode: data.mode,
      target_email: targetProfile?.email ?? null,
      removed_roles: targetRoles.filter((r) => r === "admin" || r === "super_admin"),
    });

    return { ok: true };
  });