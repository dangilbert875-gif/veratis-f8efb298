import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAccountOverview,
  changeAdminEmail,
  changeAdminPassword,
  createNewAdmin,
  disableAdmin,
} from "@/lib/admin-account.functions";

export const Route = createFileRoute("/admin/account")({
  component: AdminAccountPage,
  head: () => ({
    meta: [
      { title: "Admin account. VERATIS" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Overview = Awaited<ReturnType<typeof getAccountOverview>>;

function AdminAccountPage() {
  const navigate = useNavigate();
  const fetchOverview = useServerFn(getAccountOverview);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "denied"; reason: string }
    | { kind: "ready"; data: Overview }
  >({ kind: "loading" });

  const reload = async () => {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      const data = await fetchOverview();
      setState({ kind: "ready", data });
    } catch (err: any) {
      setState({ kind: "denied", reason: err?.message ?? "Access denied" });
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "loading") {
    return <Shell title="Loading account"><p className="text-[12px] text-foreground/55">Verifying session…</p></Shell>;
  }
  if (state.kind === "denied") {
    return (
      <Shell title="Access denied">
        <p className="text-[12.5px] text-foreground/65 leading-relaxed">{state.reason}</p>
        <div className="mt-4 text-[11px] tracking-[0.18em] uppercase">
          <Link to="/admin/dashboard" className="text-foreground/60 hover:text-ink border-b border-ink/30 pb-0.5">Back to dashboard</Link>
        </div>
      </Shell>
    );
  }

  const { viewer, admins, superAdminCount } = state.data;
  const isSuper = viewer.roles.includes("super_admin");

  return (
    <Shell title="Admin account">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Identity viewer={viewer} superAdminCount={superAdminCount} />
        <EmailCard currentEmail={viewer.email ?? ""} onDone={reload} />
        <PasswordCard onDone={reload} />
        {isSuper && <CreateAdminCard onDone={reload} />}
        {isSuper && <AdminListCard admins={admins} viewerId={viewer.userId} onDone={reload} />}
      </div>
    </Shell>
  );
}

// ─── shell + primitives ───────────────────────────────────────────────────

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-ink/10 px-6 lg:px-10 py-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[0.32em] uppercase text-foreground/55">VERATIS Admin</div>
          <h1 className="mt-1 text-[20px] font-medium tracking-tight">{title}</h1>
        </div>
        <nav className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 flex items-center gap-5">
          <Link to="/admin/dashboard" className="hover:text-ink">Dashboard</Link>
        </nav>
      </header>
      <main className="px-6 lg:px-10 py-8 max-w-6xl">{children}</main>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink/10 bg-background">
      <header className="px-5 py-3.5 border-b border-ink/10">
        <div className="text-[12.5px] font-medium tracking-tight text-ink">{title}</div>
        {hint && <div className="mt-0.5 text-[11px] text-foreground/55">{hint}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[9.5px] tracking-[0.28em] uppercase text-foreground/55 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-background border border-ink/15 px-3 py-2 text-[13px] text-ink placeholder:text-foreground/35 focus:outline-none focus:border-ink/50 transition-colors";

function Btn({
  children,
  disabled,
  variant = "primary",
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  const base = "text-[11px] tracking-[0.18em] uppercase px-4 py-2 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const cls =
    variant === "primary"
      ? `${base} bg-ink text-background border-ink hover:bg-ink/90`
      : variant === "danger"
      ? `${base} bg-background text-ink border-ink/40 hover:border-ink hover:bg-ink/5`
      : `${base} bg-background text-foreground/70 border-ink/15 hover:text-ink hover:border-ink/40`;
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function Note({ tone, children }: { tone: "ok" | "err"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "text-[11.5px] text-emerald-700 dark:text-emerald-400"
      : "text-[11.5px] text-red-700 dark:text-red-400";
  return <p className={cls}>{children}</p>;
}

// ─── identity ─────────────────────────────────────────────────────────────

function Identity({ viewer, superAdminCount }: { viewer: Overview["viewer"]; superAdminCount: number }) {
  return (
    <Card title="Signed in as" hint="Current admin session">
      <dl className="text-[12.5px] space-y-2">
        <Row k="Email" v={viewer.email ?? "."} />
        <Row k="Full name" v={viewer.fullName ?? "."} />
        <Row k="Roles" v={viewer.roles.join(", ") || "."} />
        <Row k="Super admins" v={String(superAdminCount)} />
      </dl>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/5 pb-1.5 last:border-0">
      <dt className="text-[10px] tracking-[0.24em] uppercase text-foreground/55">{k}</dt>
      <dd className="font-mono text-[12px] text-ink text-right break-all">{v}</dd>
    </div>
  );
}

// ─── change email ─────────────────────────────────────────────────────────

function EmailCard({ currentEmail, onDone }: { currentEmail: string; onDone: () => void }) {
  const fn = useServerFn(changeAdminEmail);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  return (
    <Card title="Change login email" hint="Confirms with current password.">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMsg(null);
          try {
            await fn({ data: { newEmail, currentPassword } });
            setMsg({ tone: "ok", text: `Email updated. Sign in again with ${newEmail}.` });
            setNewEmail("");
            setCurrentPassword("");
            onDone();
          } catch (err: any) {
            setMsg({ tone: "err", text: err?.message ?? "Update failed" });
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Current email"><input className={inputCls} value={currentEmail} readOnly /></Field>
        <Field label="New email"><input className={inputCls} type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></Field>
        <Field label="Current password"><input className={inputCls} type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></Field>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Btn disabled={busy}>{busy ? "Updating…" : "Update email"}</Btn>
          {msg && <Note tone={msg.tone}>{msg.text}</Note>}
        </div>
      </form>
    </Card>
  );
}

// ─── change password ──────────────────────────────────────────────────────

function PasswordCard({ onDone }: { onDone: () => void }) {
  const fn = useServerFn(changeAdminPassword);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  return (
    <Card title="Change password" hint="Minimum 10 characters.">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          if (next !== confirm) { setMsg({ tone: "err", text: "New passwords do not match" }); return; }
          if (next.length < 10) { setMsg({ tone: "err", text: "Password must be at least 10 characters" }); return; }
          setBusy(true);
          try {
            await fn({ data: { currentPassword: cur, newPassword: next } });
            setMsg({ tone: "ok", text: "Password updated." });
            setCur(""); setNext(""); setConfirm("");
            onDone();
          } catch (err: any) {
            setMsg({ tone: "err", text: err?.message ?? "Update failed" });
          } finally { setBusy(false); }
        }}
      >
        <Field label="Current password"><input className={inputCls} type="password" required value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
        <Field label="New password"><input className={inputCls} type="password" required value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Field label="Confirm new password"><input className={inputCls} type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Btn disabled={busy}>{busy ? "Updating…" : "Update password"}</Btn>
          {msg && <Note tone={msg.tone}>{msg.text}</Note>}
        </div>
      </form>
    </Card>
  );
}

// ─── create new admin ─────────────────────────────────────────────────────

function CreateAdminCard({ onDone }: { onDone: () => void }) {
  const fn = useServerFn(createNewAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cur, setCur] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  return (
    <Card title="Create new super admin" hint="Safer migration: provision the new login, verify it, then disable the old one.">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true); setMsg(null);
          try {
            const res = await fn({ data: { email, password, fullName: fullName || undefined, currentPassword: cur } });
            setMsg({ tone: "ok", text: `Created ${res.email}. Sign in with the new credentials to verify, then disable the old account below.` });
            setEmail(""); setPassword(""); setFullName(""); setCur("");
            onDone();
          } catch (err: any) {
            setMsg({ tone: "err", text: err?.message ?? "Create failed" });
          } finally { setBusy(false); }
        }}
      >
        <Field label="New admin email"><input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Initial password"><input className={inputCls} type="password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Field label="Full name (optional)"><input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
        <Field label="Your current password"><input className={inputCls} type="password" required value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Btn disabled={busy}>{busy ? "Creating…" : "Create admin"}</Btn>
          {msg && <Note tone={msg.tone}>{msg.text}</Note>}
        </div>
      </form>
    </Card>
  );
}

// ─── admin list ───────────────────────────────────────────────────────────

function AdminListCard({
  admins,
  viewerId,
  onDone,
}: {
  admins: Overview["admins"];
  viewerId: string;
  onDone: () => void;
}) {
  const fn = useServerFn(disableAdmin);
  const [cur, setCur] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const run = async (id: string, mode: "revoke_roles" | "delete_user") => {
    if (!cur) { setMsg({ tone: "err", text: "Enter your current password first" }); return; }
    if (mode === "delete_user" && !confirm("Delete this admin user permanently? This cannot be undone.")) return;
    setBusyId(id); setMsg(null);
    try {
      await fn({ data: { targetUserId: id, currentPassword: cur, mode } });
      setMsg({ tone: "ok", text: mode === "delete_user" ? "User deleted." : "Admin roles revoked." });
      onDone();
    } catch (err: any) {
      setMsg({ tone: "err", text: err?.message ?? "Action failed" });
    } finally { setBusyId(null); }
  };

  return (
    <Card title="Admin users" hint="Disable the old admin only after the new login is verified. The last super_admin cannot be removed.">
      <Field label="Your current password (required to disable)">
        <input className={inputCls} type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
      </Field>
      <ul className="mt-4 divide-y divide-ink/10 border border-ink/10">
        {admins.map((a) => (
          <li key={a.id} className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12.5px] text-ink truncate">{a.email ?? "(no email)"}</div>
              <div className="text-[10.5px] text-foreground/55 mt-0.5">
                {a.roles.join(" · ")}{a.isSelf ? " · you" : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Btn variant="ghost" type="button" disabled={a.isSelf || busyId === a.id} onClick={() => run(a.id, "revoke_roles")}>
                {busyId === a.id ? "Working…" : "Revoke roles"}
              </Btn>
              <Btn variant="danger" type="button" disabled={a.isSelf || busyId === a.id} onClick={() => run(a.id, "delete_user")}>
                Delete user
              </Btn>
            </div>
          </li>
        ))}
      </ul>
      {msg && <div className="mt-3"><Note tone={msg.tone}>{msg.text}</Note></div>}
    </Card>
  );
}