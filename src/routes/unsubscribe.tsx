import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout, PageHeader } from "@/components/site/Layout";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Unsubscribe. VERATIS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

type State =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) return setState({ kind: "invalid" });
        if (json.valid === false && json.reason === "already_unsubscribed")
          return setState({ kind: "already" });
        if (json.valid) return setState({ kind: "ready" });
        setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "invalid" }));
  }, [token]);

  async function confirm() {
    setState({ kind: "submitting" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) return setState({ kind: "error", message: json.error || "Failed" });
      if (json.success) return setState({ kind: "done" });
      if (json.reason === "already_unsubscribed") return setState({ kind: "already" });
      setState({ kind: "error", message: "Could not complete unsubscribe." });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    }
  }

  return (
    <Layout>
      <PageHeader eyebrow="Email preferences" title="Unsubscribe" />
      <section className="px-6 lg:px-12 py-16 max-w-xl mx-auto">
        <div className="border border-border rounded-[3px] bg-background p-8 space-y-5 text-center">
          {state.kind === "loading" && (
            <p className="text-sm text-foreground/70">Verifying your link…</p>
          )}
          {state.kind === "invalid" && (
            <>
              <h2 className="text-lg font-display text-ink">Invalid link</h2>
              <p className="text-sm text-foreground/70">
                This unsubscribe link is invalid or has expired. If you continue
                to receive emails, contact support@veratisbio.com.
              </p>
            </>
          )}
          {state.kind === "ready" && (
            <>
              <h2 className="text-lg font-display text-ink">
                Unsubscribe from VERATIS emails?
              </h2>
              <p className="text-sm text-foreground/70">
                You will stop receiving order confirmations, shipping updates,
                and other transactional emails from VERATIS.
              </p>
              <button
                onClick={confirm}
                className="mt-2 inline-flex items-center justify-center h-11 px-6 text-[11px] font-medium uppercase tracking-[0.18em] text-background bg-ink rounded-[3px] hover:bg-ink/90 transition-colors"
              >
                Confirm unsubscribe
              </button>
            </>
          )}
          {state.kind === "submitting" && (
            <p className="text-sm text-foreground/70">Processing…</p>
          )}
          {state.kind === "done" && (
            <>
              <h2 className="text-lg font-display text-ink">You're unsubscribed</h2>
              <p className="text-sm text-foreground/70">
                You will no longer receive emails from VERATIS at this address.
              </p>
            </>
          )}
          {state.kind === "already" && (
            <>
              <h2 className="text-lg font-display text-ink">Already unsubscribed</h2>
              <p className="text-sm text-foreground/70">
                This email address has already been removed from our mailing list.
              </p>
            </>
          )}
          {state.kind === "error" && (
            <>
              <h2 className="text-lg font-display text-ink">Something went wrong</h2>
              <p className="text-sm text-foreground/70">{state.message}</p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}