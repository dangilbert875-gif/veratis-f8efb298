import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { resolveAdminAccess } from "@/lib/admin-auth.functions";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

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
  const checkAdminAccess = useServerFn(resolveAdminAccess);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "denied"; reason: string }
    | { kind: "ready"; viewer: Awaited<ReturnType<typeof resolveAdminAccess>> }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: number | undefined;

    const validate = async (session: any, source: string) => {
      console.info("[Admin Guard] validating session", {
        source,
        hasSession: Boolean(session),
        userId: session?.user?.id ?? null,
        email: session?.user?.email ?? null,
      });
      try {
        const viewer = await withTimeout(checkAdminAccess(), 10000, "Admin role validation timed out");
        console.info("[Admin Guard] role check result", { viewer });
        if (cancelled) return;
        if (!viewer.isAdmin) {
          setState({ kind: "denied", reason: "Access denied — admin role required." });
          return;
        }
        setState({ kind: "ready", viewer });
      } catch (err: any) {
        if (cancelled) return;
        console.error("[Admin Guard] role check failed", err);
        setState({ kind: "denied", reason: err?.message ?? "Access check failed" });
      }
    };

    // Subscribe FIRST so we don't miss any auth event that fires during init.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.info("[Admin Guard] onAuthStateChange", { event, hasSession: Boolean(session), userId: session?.user?.id ?? null });
      if (cancelled) return;
      if (session) {
        if (redirectTimer) {
          window.clearTimeout(redirectTimer);
          redirectTimer = undefined;
        }
        setState({ kind: "loading" });
        validate(session, `onAuthStateChange:${event}`);
      } else if (event === "SIGNED_OUT") {
        navigate({ to: "/admin/login" });
      }
    });

    (async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "Supabase session check timed out",
        );
        if (cancelled) return;
        if (error) {
          setState({ kind: "denied", reason: `Supabase query failed: ${error.message}` });
          return;
        }
        if (data.session) {
          await validate(data.session, "getSession");
          return;
        }
        // No session yet — give onAuthStateChange a brief window to deliver
        // a restored session before redirecting to login.
        console.info("[Admin Guard] getSession returned no session; waiting briefly for restore");
        redirectTimer = window.setTimeout(() => {
          if (cancelled) return;
          console.warn("[Admin Guard] no session after wait; redirecting to /admin/login");
          setState({ kind: "denied", reason: "No active session. Redirecting to admin login." });
          navigate({ to: "/admin/login" });
        }, 1500);
      } catch (err: any) {
        if (cancelled) return;
        setState({ kind: "denied", reason: err?.message ?? "Access check failed" });
      }
    })();

    return () => {
      cancelled = true;
      if (redirectTimer) window.clearTimeout(redirectTimer);
      sub.subscription.unsubscribe();
    };
  }, [checkAdminAccess, navigate]);

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-[10px] tracking-[0.32em] uppercase text-foreground/40">Verifying credentials…</div>
      </div>
    );
  }

  if (state.kind === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center">
          <div className="text-[10px] tracking-[0.32em] uppercase text-foreground/50 mb-3">Access denied</div>
          <h1 className="text-[20px] font-medium tracking-tight text-ink mb-3">Restricted area</h1>
          <p className="text-[13px] text-foreground/60 leading-relaxed mb-6">{state.reason}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
            className="text-[11px] tracking-[0.18em] uppercase text-foreground/60 hover:text-ink border-b border-ink/30 pb-0.5"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard viewer={state.viewer} />;
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