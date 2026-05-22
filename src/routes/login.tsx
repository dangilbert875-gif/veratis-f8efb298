import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — VERATIS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const signInWithGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err.message ?? "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
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
            <div className="text-[10px] tracking-[0.28em] uppercase text-foreground/50 mb-2">Restricted access</div>
            <h1 className="text-[22px] font-medium tracking-tight text-ink">
              {mode === "signin" ? "Sign in" : "Create credentials"}
            </h1>
            <p className="mt-2 text-[13px] text-foreground/60 leading-relaxed">
              Authorized personnel only. All access is logged.
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
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-ink text-background text-[11.5px] tracking-[0.2em] uppercase font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "…" : mode === "signin" ? "Enter" : "Create"}
            </button>
          </form>
          <div className="mt-5 text-center">
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