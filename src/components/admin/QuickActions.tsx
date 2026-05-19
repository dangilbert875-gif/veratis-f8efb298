import {
  Package,
  FlaskConical,
  FileText,
  Ticket,
  Microscope,
  Receipt,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { SectionId } from "./AdminDashboard";

const actions: {
  label: string;
  section: SectionId;
  hint: string;
  icon: LucideIcon;
}[] = [
  { label: "New product", section: "products", hint: "Catalog", icon: Package },
  { label: "Upload COA", section: "coa", hint: "Lot certificate", icon: FlaskConical },
  { label: "New article", section: "articles", hint: "Education", icon: FileText },
  { label: "New referral", section: "referrals", hint: "Affiliate", icon: Ticket },
  { label: "Research partner", section: "partners", hint: "Institutional", icon: Microscope },
  { label: "Manual order", section: "orders", hint: "Internal", icon: Receipt },
  { label: "Customer note", section: "customers", hint: "CRM", icon: UserPlus },
];

export function QuickActions({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            type="button"
            onClick={() => onNavigate(a.section)}
            className="group text-left border border-ink/12 bg-background px-3 py-3 hover:border-ink/30 hover:bg-mist/40 transition-colors"
          >
            <Icon
              className="w-4 h-4 text-foreground/45 group-hover:text-ink transition-colors"
              strokeWidth={1.25}
            />
            <div className="mt-2 text-[9px] tracking-[0.28em] uppercase text-foreground/45 group-hover:text-foreground/65 transition-colors">
              {a.hint}
            </div>
            <div className="mt-0.5 text-[12.5px] tracking-tight text-ink">
              {a.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}