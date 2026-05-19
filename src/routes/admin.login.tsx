import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    logSupabaseConnectionStatus();
    supabase.auth.getSession().then(({ data }) => {
      console.info("[Admin Auth] Existing session check", {
        hasSession: Boolean(data.session),
        userId: data.session?.user?.id ?? null,
        email: data.session?.user?.email ?? null,
      });
      if (data.session) navigate({ to: "/admin" });
    }).catch((err) => {
      console.error("[Admin Auth] Session check failed", sanitizeAuthError(err));
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
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
        // Verify admin role before redirecting
        if (data.user) {
          const { data: roles, error: roleErr } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id);
          console.info("[Admin Auth] Admin role verification response", {
            userId: data.user.id,
            roles: (roles ?? []).map((r: any) => r.role),
            error: roleErr ? sanitizeAuthError(roleErr) : null,
          });
          if (roleErr) throw new Error("Could not verify account role. " + roleErr.message);
          const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
          if (!isAdmin) {
            await supabase.auth.signOut();
            throw new Error("MISSING_ADMIN_ROLE");
          }
        }
      } else {
        console.info("[Admin Auth] signUp request", {
          email: email.trim().toLowerCase(),
          passwordProvided: Boolean(password),
          passwordLength: password.length,
        });
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        console.info("[Admin Auth] signUp response", { error: error ? sanitizeAuthError(error) : null });
        if (error) throw error;
        setInfo("Account created. If email confirmation is required, check your inbox before signing in.");
        setMode("signin");
        setLoading(false);
        return;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      console.error("[Admin Auth] Authentication flow failed", sanitizeAuthError(err));
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const sendReset = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email above, then tap reset password.");
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + "/admin/login",
      });
      if (error) throw error;
      setInfo("Password reset link sent. Check your inbox.");
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setResetting(false);
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
            <h1 className="text-[22px] font-medium tracking-tight text-ink">
              {mode === "signin" ? "Administrator sign-in" : "Create credentials"}
            </h1>
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
              {loading ? "…" : mode === "signin" ? "Enter console" : "Create"}
            </button>
          </form>
          <div className="mt-5 text-center space-y-2">
            {mode === "signin" && (
              <div>
                <button
                  onClick={sendReset}
                  disabled={resetting}
                  className="text-[11px] tracking-[0.12em] uppercase text-foreground/50 hover:text-ink transition-colors disabled:opacity-50"
                >
                  {resetting ? "Sending…" : "Reset password"}
                </button>
              </div>
            )}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-[11px] tracking-[0.12em] uppercase text-foreground/50 hover:text-ink transition-colors"
            >
              {mode === "signin" ? "Need credentials?" : "Already enrolled?"}
            </button>
          </div>
        </div>
      </div>
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

  if (!url || !publicKey) return;

  fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
    headers: { apikey: publicKey },
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      console.info("[Admin Auth] Auth settings response", {
        status: response.status,
        ok: response.ok,
        emailPasswordEnabled: Boolean(payload?.external?.email),
        signupDisabled: Boolean(payload?.disable_signup),
        emailAutoConfirm: Boolean(payload?.mailer_autoconfirm),
      });
    })
    .catch((err) => {
      console.error("[Admin Auth] Auth settings request failed", sanitizeAuthError(err));
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