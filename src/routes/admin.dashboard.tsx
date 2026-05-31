import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboard, type AdminDebugState, type Viewer } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [
      { title: "Admin dashboard. VERATIS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type AdminState =
  | { kind: "checking"; debug: AdminDebugState }
  | { kind: "denied"; reason: string; debug: AdminDebugState }
  | { kind: "ready"; viewer: Viewer; debug: AdminDebugState };

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminState>({
    kind: "checking",
    debug: {
      userId: null,
      sessionExists: false,
      profileRole: null,
      routeStatus: "Checking admin access",
      lastAuthError: null,
    },
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const { data: userData, error: userError } = await withTimeout(
          supabase.auth.getUser(),
          8000,
          "Authentication check timed out",
        );

        console.info("[Admin Dashboard] session object", {
          hasSession: Boolean(sessionData.session),
          userId: sessionData.session?.user?.id ?? null,
        });
        console.info("[Admin Dashboard] user id", userData.user?.id ?? null);

        if (cancelled) return;
        if (userError || !userData.user) {
          console.warn("[Admin Dashboard] no authenticated user", userError);
          navigate({ to: "/admin/login", replace: true });
          return;
        }

        const userId = userData.user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("id", userId)
          .maybeSingle();
        console.info("[Admin Dashboard] profile lookup result", { profile, error: profileError });

        if (cancelled) return;
        if (profileError) {
          setState({
            kind: "denied",
            reason: profileError.message,
            debug: {
              userId,
              sessionExists: Boolean(sessionData.session),
              profileRole: null,
              routeStatus: "Supabase query failed",
              lastAuthError: profileError.message,
            },
          });
          return;
        }

        if (!profile) {
          setState({
            kind: "denied",
            reason: "Profile missing for authenticated user.",
            debug: {
              userId,
              sessionExists: Boolean(sessionData.session),
              profileRole: null,
              routeStatus: "Profile missing",
              lastAuthError: null,
            },
          });
          return;
        }

        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        const role = (roles ?? []).map((row: any) => row.role).find((value: string) => value === "admin") ?? null;
        console.info("[Admin Dashboard] role value", { role, roles, error: roleError });

        if (cancelled) return;
        if (roleError) {
          setState({
            kind: "denied",
            reason: roleError.message,
            debug: {
              userId,
              sessionExists: Boolean(sessionData.session),
              profileRole: null,
              routeStatus: "Admin role lookup failed",
              lastAuthError: roleError.message,
            },
          });
          return;
        }

        const debug: AdminDebugState = {
          userId,
          sessionExists: Boolean(sessionData.session),
          profileRole: role,
          routeStatus: role === "admin" ? "Admin role verified" : "Admin role missing",
          lastAuthError: null,
        };

        if (role !== "admin") {
          setState({ kind: "denied", reason: "Access denied. admin role required.", debug });
          return;
        }

        setState({
          kind: "ready",
          viewer: {
            userId,
            email: profile.email ?? userData.user.email ?? null,
            fullName: profile.full_name ?? null,
          },
          debug,
        });
      } catch (err: any) {
        if (cancelled) return;
        console.error("[Admin Dashboard] auth flow failed", err);
        setState((current) => ({
          kind: "denied",
          reason: err?.message ?? "Admin authentication failed.",
          debug: {
            ...current.debug,
            routeStatus: "Auth check failed",
            lastAuthError: err?.message ?? String(err),
          },
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (state.kind === "ready") {
    const showDebug =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debug") === "1";
    return (
      <AdminDashboard
        viewer={state.viewer}
        debug={showDebug ? state.debug : undefined}
      />
    );
  }

  if (state.kind === "denied") {
    return <AdminAccessDenied reason={state.reason} debug={state.debug} />;
  }

  return <AdminChecking debug={state.debug} />;
}

function AdminChecking({ debug }: { debug: AdminDebugState }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-[10px] tracking-[0.32em] uppercase text-foreground/50 mb-3">Admin access</div>
        <h1 className="text-[20px] font-medium tracking-tight text-ink mb-3">Checking access</h1>
        <AdminAuthDebugPanel debug={debug} />
      </div>
    </div>
  );
}

function AdminAccessDenied({ reason, debug }: { reason: string; debug: AdminDebugState }) {
  const navigate = useNavigate();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[Admin Auth] Sign out failed", error);
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <div className="text-[10px] tracking-[0.32em] uppercase text-foreground/50 mb-3">Access denied</div>
        <h1 className="text-[20px] font-medium tracking-tight text-ink mb-3">Restricted area</h1>
        <p className="text-[13px] text-foreground/60 leading-relaxed mb-6">{reason}</p>
        <button
          type="button"
          onClick={signOut}
          className="text-[11px] tracking-[0.18em] uppercase text-foreground/60 hover:text-ink border-b border-ink/30 pb-0.5"
        >
          Sign out
        </button>
        <AdminAuthDebugPanel debug={debug} />
      </div>
    </div>
  );
}

function AdminAuthDebugPanel({ debug }: { debug: AdminDebugState }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="mt-6 border border-ink/10 bg-mist/25 p-3 text-left text-[11px] leading-relaxed text-foreground/65">
      <div className="mb-2 text-[9px] tracking-[0.24em] uppercase text-foreground/45">Auth debug</div>
      <div>Supabase user id: {debug.userId ?? "."}</div>
      <div>Session exists: {debug.sessionExists ? "true" : "false"}</div>
      <div>Profile role: {debug.profileRole ?? "."}</div>
      <div>Route status: {debug.routeStatus}</div>
      <div>Last auth error: {debug.lastAuthError ?? "."}</div>
    </div>
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}
