import { useState } from "react";
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

type Viewer = { email: string | null; fullName: string | null; userId: string };

const sections = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "referrals", label: "Referrals" },
  { id: "payouts", label: "Payouts" },
  { id: "products", label: "Products" },
  { id: "archive", label: "Verification Archive" },
  { id: "articles", label: "Education" },
  { id: "customers", label: "Customers" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AdminDashboard({ viewer }: { viewer: Viewer }) {
  const [active, setActive] = useState<SectionId>("overview");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-ink flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-ink/10 bg-mist/30">
        <div className="px-6 py-7 border-b border-ink/10">
          <div className="text-[9px] tracking-[0.32em] uppercase text-foreground/45">Veratis</div>
          <div className="mt-1 text-[14px] font-medium tracking-tight">Operations Console</div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={[
                "w-full text-left px-3 py-2 text-[12.5px] tracking-[0.02em] transition-colors",
                active === s.id
                  ? "bg-ink text-background"
                  : "text-foreground/70 hover:text-ink hover:bg-background",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-ink/10 text-[11px] text-foreground/60">
          <div className="truncate">{viewer.email}</div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
            className="mt-2 text-[10px] tracking-[0.2em] uppercase text-foreground/50 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="border-b border-ink/10 px-6 md:px-10 py-5 flex items-center justify-between">
          <div>
            <div className="text-[9px] tracking-[0.32em] uppercase text-foreground/45">
              {sections.find((s) => s.id === active)?.label}
            </div>
            <h1 className="mt-1 text-[20px] font-medium tracking-tight">
              {titleFor(active)}
            </h1>
          </div>
          {/* Mobile section switcher */}
          <select
            className="md:hidden h-9 px-2 text-[12px] border border-ink/15 bg-background"
            value={active}
            onChange={(e) => setActive(e.target.value as SectionId)}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </header>
        <div className="p-6 md:p-10">
          {active === "overview" && <OverviewPanel />}
          {active === "orders" && <OrdersPanel />}
          {active === "referrals" && <ReferralsPanel />}
          {active === "payouts" && <PayoutsPanel />}
          {active === "products" && <ProductsPanel />}
          {active === "archive" && <ArchivePanel />}
          {active === "articles" && <ArticlesPanel />}
          {active === "customers" && <CustomersPanel />}
        </div>
      </main>
    </div>
  );
}

function titleFor(id: SectionId): string {
  switch (id) {
    case "overview": return "Operational overview";
    case "orders": return "Order management";
    case "referrals": return "Research-partner referrals";
    case "payouts": return "Partner payouts";
    case "products": return "Catalog";
    case "archive": return "Verification archive";
    case "articles": return "Educational publications";
    case "customers": return "Customer registry";
  }
}