import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { OverviewPanel } from "./panels/OverviewPanel";
import { OrdersPanel } from "./panels/OrdersPanel";
import { ReferralsPanel } from "./panels/ReferralsPanel";
import { PayoutsPanel } from "./panels/PayoutsPanel";
import { ProductsPanel } from "./panels/ProductsPanel";
import { ArchivePanel } from "./panels/ArchivePanel";
import { ArticlesPanel } from "./panels/ArticlesPanel";
import { CustomersPanel } from "./panels/CustomersPanel";
import { CoaUploadsPanel } from "./panels/CoaUploadsPanel";
import { PartnersPanel } from "./panels/PartnersPanel";
import { CommandBar } from "./CommandBar";
import { ActivityPanel } from "./panels/ActivityPanel";
import { AuditLogPanel } from "./panels/AuditLogPanel";
import { PaymentMethodsPanel } from "./panels/PaymentMethodsPanel";
import { N8nWebhookDebugPanel } from "./panels/N8nWebhookDebugPanel";
import { PagesPanel } from "./panels/PagesPanel";

export type AdminDebugState = {
  userId: string | null;
  sessionExists: boolean;
  profileRole: string | null;
  routeStatus: string;
  lastAuthError: string | null;
};

export type Viewer = { email: string | null; fullName: string | null; userId: string };

// Grouped navigation: operational laboratory structure.
const sectionGroups = [
  {
    heading: "Console",
    items: [
      { id: "overview", label: "Overview" },
      { id: "activity", label: "Activity" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { id: "orders", label: "Orders" },
      { id: "customers", label: "Customers" },
      { id: "products", label: "Inventory" },
    ],
  },
  {
    heading: "Verification",
    items: [
      { id: "archive", label: "Verification Archive" },
      { id: "coa", label: "COA Uploads" },
    ],
  },
  {
    heading: "Content",
    items: [
      { id: "articles", label: "Education" },
      { id: "partners", label: "Research Partners" },
    ],
  },
  {
    heading: "Affiliates",
    items: [
      { id: "referrals", label: "Referrals" },
      { id: "payouts", label: "Payouts" },
    ],
  },
  {
    heading: "System",
    items: [
      { id: "audit", label: "Audit Log" },
      { id: "n8n-debug", label: "n8n Debug" },
      { id: "payment-methods", label: "Payment Methods" },
      { id: "pages", label: "Pages" },
    ],
  },
] as const;

export type SectionId =
  | "overview"
  | "activity"
  | "audit"
  | "products"
  | "orders"
  | "archive"
  | "coa"
  | "articles"
  | "partners"
  | "referrals"
  | "payouts"
  | "customers"
  | "n8n-debug"
  | "payment-methods"
  | "pages";

type SectionItem = { id: SectionId; label: string };
const sections: SectionItem[] = sectionGroups.flatMap((g) => g.items as readonly SectionItem[]);

export function AdminDashboard({ viewer, debug }: { viewer: Viewer; debug?: AdminDebugState }) {
  const [active, setActive] = useState<SectionId>("overview");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [diagOpen, setDiagOpen] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(() => new Date());
  const [, force] = useState(0);
  const [ordersInitialFilter, setOrdersInitialFilter] = useState<
    "all" | "unpaid" | "unshipped" | "flagged" | "refunded"
  >("all");
  const navigate = useNavigate();

  // Re-render every 10s so the "last synchronized" timestamp ticks.
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);

  // When user re-enters Overview, refresh the synchronized stamp.
  useEffect(() => {
    if (active === "overview") setLastSync(new Date());
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  const signOut = async () => {
    console.info("[Admin Auth] Sign out requested", { userId: viewer.userId });
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[Admin Auth] Sign out failed", error);
    navigate({ to: "/admin/login", replace: true });
  };

  const handleNavigate = (
    s: SectionId,
    opts?: { ordersFilter?: "unshipped" | "unpaid" | "flagged" | "refunded" },
  ) => {
    if (s === "orders" && opts?.ordersFilter) {
      setOrdersInitialFilter(opts.ordersFilter);
    }
    setActive(s);
  };

  return (
    <div className="min-h-screen bg-background text-ink flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[244px] shrink-0 flex-col border-r border-ink/10 bg-mist/30">
        <div className="px-6 py-7 border-b border-ink/10">
          <div className="text-[9px] tracking-[0.32em] uppercase text-foreground/45">Veratis</div>
          <div className="mt-1 text-[14px] font-medium tracking-tight">Operations Console</div>
        </div>
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          {sectionGroups.map((g, gi) => (
            <div key={g.heading} className={gi > 0 ? "mt-5 pt-5 border-t border-ink/8" : ""}>
              <div className="px-3 mb-2 text-[9px] tracking-[0.3em] uppercase text-foreground/40">
                {g.heading}
              </div>
              <div className="space-y-0.5">
                {g.items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id as SectionId)}
                    className={[
                      "w-full text-left px-3 py-2 text-[12.5px] tracking-[0.02em] transition-colors relative",
                      active === s.id
                        ? "bg-ink text-background"
                        : "text-foreground/65 hover:text-ink hover:bg-background/80",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-ink/10 text-[11px] text-foreground/60">
          <div className="truncate">{viewer.email}</div>
          <div className="mt-2 flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase">
            <a href="/admin/account" className="text-foreground/50 hover:text-ink">
              Account
            </a>
            <span className="text-foreground/20">·</span>
            <button type="button" onClick={signOut} className="text-foreground/50 hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="border-b border-ink/10 px-6 md:px-10 py-5 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.32em] uppercase text-foreground/45">
              {sections.find((s) => s.id === active)?.label}
            </div>
            <h1 className="mt-1 text-[20px] font-medium tracking-tight">{titleFor(active)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <SystemStatus lastSync={lastSync} />
            {/* Wider search button on lg+, compact ⌘K hint on smaller widths */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden lg:inline-flex items-center gap-3 h-9 pl-3 pr-2 border border-ink/15 bg-background text-[12px] text-foreground/55 hover:border-ink/30 hover:text-ink transition-colors"
              title="Open command bar"
            >
              <span>Search anything…</span>
              <kbd className="border border-ink/15 px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-foreground/50">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:inline-flex lg:hidden items-center gap-2 h-9 px-2.5 border border-ink/15 bg-background text-[11px] font-mono text-foreground/55 hover:border-ink/30 hover:text-ink transition-colors"
              title="Open command bar"
            >
              <span className="tracking-[0.1em]">⌘K</span>
              <span className="text-foreground/40">to search</span>
            </button>
            {/* Mobile section switcher */}
            <select
              className="md:hidden h-9 px-2 text-[12px] border border-ink/15 bg-background"
              value={active}
              onChange={(e) => setActive(e.target.value as SectionId)}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center h-9 px-3 border border-ink/15 bg-background text-[11px] tracking-[0.18em] uppercase text-foreground/70 hover:bg-ink hover:text-background hover:border-ink transition-colors"
              title="Sign out of admin"
            >
              Sign out
            </button>
          </div>
        </header>
        <div className="p-6 md:p-10">
          {debug && (
            <div className="mb-6 border border-ink/10">
              <button
                type="button"
                onClick={() => setDiagOpen((v) => !v)}
                className="w-full text-left px-4 py-2.5 flex items-center justify-between text-[10px] tracking-[0.24em] uppercase text-foreground/50 hover:text-ink hover:bg-mist/30 transition-colors"
              >
                <span>System diagnostics</span>
                <span className="text-foreground/40">{diagOpen ? "Hide" : "Show"}</span>
              </button>
              {diagOpen && <AdminAuthDebugPanel debug={debug} />}
            </div>
          )}
          {active === "overview" && <OverviewPanel onNavigate={handleNavigate} />}
          {active === "activity" && <ActivityPanel />}
          {active === "audit" && <AuditLogPanel />}
          {active === "n8n-debug" && <N8nWebhookDebugPanel />}
          {active === "orders" && <OrdersPanel initialQuickFilter={ordersInitialFilter} />}
          {active === "referrals" && <ReferralsPanel />}
          {active === "payouts" && <PayoutsPanel />}
          {active === "products" && <ProductsPanel />}
          {active === "archive" && <ArchivePanel />}
          {active === "coa" && <CoaUploadsPanel />}
          {active === "articles" && <ArticlesPanel />}
          {active === "partners" && <PartnersPanel />}
          {active === "customers" && <CustomersPanel />}
          {active === "payment-methods" && <PaymentMethodsPanel />}
          {active === "pages" && <PagesPanel />}
        </div>
      </main>

      <CommandBar
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={(s) => setActive(s)}
      />
    </div>
  );
}

function relSync(d: Date) {
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function SystemStatus({ lastSync }: { lastSync: Date }) {
  return (
    <div className="hidden lg:flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-foreground/50">
      <span className="relative inline-flex w-1.5 h-1.5">
        <span className="absolute inset-0 rounded-full bg-[var(--state-success)] opacity-60 animate-ping" />
        <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-[var(--state-success)]" />
      </span>
      <span>Archive online</span>
      <span className="text-foreground/30">·</span>
      <span className="tabular-nums normal-case tracking-normal text-[11px] text-foreground/55">
        synchronized {relSync(lastSync)}
      </span>
    </div>
  );
}

function AdminAuthDebugPanel({ debug }: { debug: AdminDebugState }) {
  return (
    <div className="border-t border-ink/10 bg-mist/25 p-3 text-[11px] leading-relaxed text-foreground/65">
      <div className="mb-2 text-[9px] tracking-[0.24em] uppercase text-foreground/45">
        Auth debug
      </div>
      <div>Supabase user id: {debug.userId ?? "—"}</div>
      <div>Session exists: {debug.sessionExists ? "true" : "false"}</div>
      <div>Profile role: {debug.profileRole ?? "—"}</div>
      <div>Route status: {debug.routeStatus}</div>
      <div>Last auth error: {debug.lastAuthError ?? "—"}</div>
    </div>
  );
}

function titleFor(id: SectionId): string {
  switch (id) {
    case "overview":
      return "Operational overview";
    case "activity":
      return "Operational activity";
    case "audit":
      return "Audit log";
    case "n8n-debug":
      return "n8n webhook debug";
    case "orders":
      return "Order management";
    case "referrals":
      return "Research-partner referrals";
    case "payouts":
      return "Partner payouts";
    case "products":
      return "Catalog";
    case "archive":
      return "Verification archive";
    case "coa":
      return "Certificate uploads";
    case "articles":
      return "Educational publications";
    case "partners":
      return "Research partners";
    case "customers":
      return "Customer registry";
    default:
      return "Operations";
  }
}
