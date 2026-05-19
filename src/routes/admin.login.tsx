import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminDebugState = {
  userId: string | null;
  sessionExists: boolean;
  profileRole: string | null;
  routeStatus: string;
  lastAuthError: string | null;
};

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Admin sign-in — VERATIS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<AdminDebugState>({
    userId: null,
    sessionExists: false,
    profileRole: null,
    routeStatus: "Login page ready",
    lastAuthError: null,
  });

  useEffect(() => {
    logSupabaseConnectionStatus();
    supabase.auth.getSession().then(({ data, error }) => {
      console.info("[Admin Auth] Existing session check", {
        hasSession: Boolean(data.session),
        userId: data.session?.user?.id ?? null,
        email: data.session?.user?.email ?? null,
        error: error ? sanitizeAuthError(error) : null,
      });
      setDebug((current) => ({
        ...current,
        userId: data.session?.user?.id ?? null,
        sessionExists: Boolean(data.session),
        routeStatus: data.session ? "Existing session found" : "No session on login page",
        lastAuthError: error?.message ?? null,
      }));
    }).catch((err) => {
      console.error("[Admin Auth] Session check failed", sanitizeAuthError(err));
      setDebug((current) => ({ ...current, lastAuthError: err?.message ?? String(err), routeStatus: "Session check failed" }));
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    setDebug((current) => ({ ...current, routeStatus: "Signing in", lastAuthError: null }));
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.info("[Admin Auth] signInWithPassword request", {
        email: normalizedEmail,
        passwordProvided: Boolean(password),
        passwordLength: password.length,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      console.info("[Admin Auth] signInWithPassword response", sanitizeAuthResponse(data, error));
      if (error) throw error;

      const sessionCheck = await supabase.auth.getSession();
      const role = data.user ? await getAdminRoleForDebug(data.user.id) : null;
      console.info("[Admin Auth] login success", {
        userId: data.user?.id ?? null,
        email: data.user?.email ?? null,
        sessionPresent: Boolean(sessionCheck.data.session),
        role,
      });

      setDebug({
        userId: data.user?.id ?? null,
        sessionExists: Boolean(sessionCheck.data.session),
        profileRole: role,
        routeStatus: "Login success — redirecting to dashboard",
        lastAuthError: null,
      });
      setInfo("Login successful. Opening dashboard…");
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err: any) {
      console.error("[Admin Auth] Authentication flow failed", sanitizeAuthError(err));
      setError(mapAuthError(err));
      setDebug((current) => ({
        ...current,
        routeStatus: "Login failed",
        lastAuthError: err?.message ?? String(err),
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    setError(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setDebug({ userId: null, sessionExists: false, profileRole: null, routeStatus: "Signed out", lastAuthError: null });
      setInfo("Signed out. You can log in again now.");
    } catch (err: any) {
      console.error("[Admin Auth] Sign out failed", sanitizeAuthError(err));
      setDebug((current) => ({ ...current, routeStatus: "Sign out failed", lastAuthError: err?.message ?? String(err) }));
      setError(err?.message ?? "Unable to sign out. Refresh and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-10 text-[10px] tracking-[0.32em] uppercase text-foreground/50 hover:text-ink transition-colors">
          ← Veratis
        </Link>
        <div className="border border-ink/12 bg-background p-8">
          <div className="mb-7">
            <div className="text-[10px] tracking-[0.28em] uppercase text-foreground/50 mb-2">Operations console</div>
            <h1 className="text-[22px] font-medium tracking-tight text-ink">Administrator sign-in</h1>
            <p className="mt-2 text-[13px] text-foreground/60 leading-relaxed">
              Restricted to authorized personnel. All access is logged and auditable.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[0.24em] uppercase text-foreground/60 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-[13px] border border-ink/15 bg-background focus:border-ink/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.24em] uppercase text-foreground/60 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-[13px] border border-ink/15 bg-background focus:border-ink/40 outline-none"
              />
            </div>
            {error && (
              <div className="text-[12px] text-red-700 border-l-2 border-red-700/40 pl-3 py-1">{error}</div>
            )}
            {info && (
              <div className="text-[12px] text-emerald-800 border-l-2 border-emerald-700/40 pl-3 py-1">{info}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-ink text-background text-[11.5px] tracking-[0.2em] uppercase font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "…" : "Enter console"}
            </button>
          </form>
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={clearSession}
              className="text-[11px] tracking-[0.12em] uppercase text-foreground/50 hover:text-ink transition-colors"
            >
              Clear session
            </button>
          </div>
          <AdminAuthDebugPanel debug={debug} />
        </div>
      </div>
    </div>
  );
}

async function getAdminRoleForDebug(userId: string): Promise<string | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("id", userId)
    .maybeSingle();
  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const role = (roles ?? []).map((row: any) => row.role).find((value: string) => value === "admin") ?? null;
  console.info("[Admin Auth] profile lookup result", { profile, error: profileError ? sanitizeAuthError(profileError) : null });
  console.info("[Admin Auth] role value", { role, roles, error: roleError ? sanitizeAuthError(roleError) : null });
  return role;
}

function AdminAuthDebugPanel({ debug }: { debug: AdminDebugState }) {
  return (
    <div className="mt-6 border border-ink/10 bg-mist/25 p-3 text-left text-[11px] leading-relaxed text-foreground/65">
      <div className="mb-2 text-[9px] tracking-[0.24em] uppercase text-foreground/45">Auth debug</div>
      <div>Supabase user id: {debug.userId ?? "—"}</div>
      <div>Session exists: {debug.sessionExists ? "true" : "false"}</div>
      <div>Profile role: {debug.profileRole ?? "—"}</div>
      <div>Route status: {debug.routeStatus}</div>
      <div>Last auth error: {debug.lastAuthError ?? "—"}</div>
    </div>
  );
}

function mapAuthError(err: any): string {
  const raw: string = (err?.message ?? "").toString();
  const code: string = (err?.code ?? err?.error_code ?? "").toString();
  if (raw === "MISSING_ADMIN_ROLE") {
    return "This account is not authorized for the admin console. Contact an existing administrator to grant the admin role.";
  }
  if (code === "email_not_confirmed" || /not confirmed/i.test(raw)) {
    return "Email not confirmed. Check your inbox for the verification link before signing in.";
  }
  if (code === "user_not_found" || /user not found/i.test(raw)) {
    return "No account exists for that email. Use ‘Need credentials?’ to create one.";
  }
  if (code === "invalid_credentials" || /invalid login credentials/i.test(raw)) {
    return "Email or password is incorrect. If you just created the account, confirm your email first; otherwise reset your password.";
  }
  if (code === "over_email_send_rate_limit" || /rate limit/i.test(raw)) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (/fetch|network|failed to fetch/i.test(raw)) {
    return "Cannot reach the authentication server. Check your network connection or the backend configuration.";
  }
  if (/weak.?password|password.*short/i.test(raw)) {
    return "Password is too weak. Use at least 8 characters with a mix of letters and numbers.";
  }
  return raw || "Authentication failed. Please try again.";
}

function logSupabaseConnectionStatus() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const projectRefFromUrl = parseProjectRefFromUrl(url);
  const projectRefFromKey = parseProjectRefFromJwt(publicKey);

  console.info("[Admin Auth] Supabase connection status", {
    urlConfigured: Boolean(url),
    urlHost: getUrlHost(url),
    publicKeyConfigured: Boolean(publicKey),
    projectRefFromUrl,
    projectRefFromKey,
    projectRefsMatch: Boolean(projectRefFromUrl && projectRefFromKey && projectRefFromUrl === projectRefFromKey),
  });
}

function sanitizeAuthResponse(data: any, error: any) {
  return {
    hasUser: Boolean(data?.user),
    userId: data?.user?.id ?? null,
    email: data?.user?.email ?? null,
    emailConfirmedAt: data?.user?.email_confirmed_at ?? null,
    sessionPresent: Boolean(data?.session),
    accessTokenPresent: Boolean(data?.session?.access_token),
    refreshTokenPresent: Boolean(data?.session?.refresh_token),
    expiresAt: data?.session?.expires_at ?? null,
    error: error ? sanitizeAuthError(error) : null,
  };
}

function sanitizeAuthError(err: any) {
  return {
    name: err?.name ?? null,
    message: err?.message ?? String(err ?? ""),
    status: err?.status ?? null,
    code: err?.code ?? err?.error_code ?? null,
  };
}

function parseProjectRefFromUrl(url: string | undefined) {
  const host = getUrlHost(url);
  return host?.endsWith(".supabase.co") ? host.split(".")[0] : null;
}

function getUrlHost(url: string | undefined) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function parseProjectRefFromJwt(token: string | undefined) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload?.ref === "string" ? payload.ref : null;
  } catch {
    return null;
  }
}
