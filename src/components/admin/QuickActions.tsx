import type { SectionId } from "./AdminDashboard";

const actions: { label: string; section: SectionId; hint: string }[] = [
  { label: "New product", section: "products", hint: "Catalog entry" },
  { label: "Upload COA", section: "coa", hint: "Lot certificate" },
  { label: "New article", section: "articles", hint: "Education" },
  { label: "New referral", section: "referrals", hint: "Affiliate code" },
  { label: "Research partner", section: "partners", hint: "Institutional" },
  { label: "Manual order", section: "orders", hint: "Internal" },
  { label: "Customer note", section: "customers", hint: "CRM entry" },
];

export function QuickActions({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={() => onNavigate(a.section)}
          className="text-left border border-ink/12 bg-background px-3 py-3 hover:border-ink/30 hover:bg-mist/30 transition-colors group"
        >
          <div className="text-[9px] tracking-[0.28em] uppercase text-foreground/45 group-hover:text-foreground/70 transition-colors">
            {a.hint}
          </div>
          <div className="mt-1 text-[12.5px] tracking-tight text-ink flex items-center justify-between">
            <span>{a.label}</span>
            <span className="text-foreground/30 group-hover:text-ink transition-colors">+</span>
          </div>
        </button>
      ))}
    </div>
  );
}