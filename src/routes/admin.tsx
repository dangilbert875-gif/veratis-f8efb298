import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin · Veratis" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    if (location.pathname !== "/admin") return;

    (async () => {
      const result = await checkAdminRedirectTarget();
      console.info("[Admin Redirect] /admin target", result);
      if (!cancelled) {
        navigate({ to: result.target, replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  if (location.pathname !== "/admin") return <Outlet />;

  return null;
}

async function checkAdminRedirectTarget(): Promise<{ target: "/admin/dashboard" | "/admin/login"; userId: string | null; role: string | null; error: string | null }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { target: "/admin/login", userId: null, role: null, error: userError?.message ?? "No authenticated user" };
    }

    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);

    const role = (roles ?? []).map((row: any) => row.role).find((value: string) => value === "admin") ?? null;
    return {
      target: role === "admin" ? "/admin/dashboard" : "/admin/dashboard",
      userId: userData.user.id,
      role,
      error: roleError?.message ?? null,
    };
  } catch (err: any) {
    return { target: "/admin/login", userId: null, role: null, error: err?.message ?? String(err) };
  }
}