import { useState } from "react";
import {
  Package,
  FlaskConical,
  FileText,
  Ticket,
  Microscope,
  Receipt,
  UserPlus,
  Printer,
  ClipboardList,
  Truck,
  RefreshCcw,
  Boxes,
  PackagePlus,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { SectionId } from "./AdminDashboard";
import { toast } from "sonner";

type Counts = {
  todayLabels?: number;
  picking?: number;
  refunds?: number;
  coaPending?: number;
};

type Action = {
  label: string;
  hint: string;
  icon: LucideIcon;
  badge?: number;
  section?: SectionId;
  onClick?: () => void;
};

export function QuickActions({
  onNavigate,
  counts = {},
}: {
  onNavigate: (s: SectionId) => void;
  counts?: Counts;
}) {
  const [adminOpen, setAdminOpen] = useState(false);

  const fulfillment: Action[] = [
    {
      label: "Print today's labels",
      hint: "Fulfillment",
      icon: Printer,
      badge: counts.todayLabels,
      onClick: () => {
        toast.message("Label printing", {
          description: "Opens the day's shipping labels in a print-ready view (Phase 2).",
        });
      },
    },
    {
      label: "Today's picking list",
      hint: "Fulfillment",
      icon: ClipboardList,
      badge: counts.picking,
      onClick: () => {
        toast.message("Picking list", {
          description: "Aggregated pull sheet ships in Phase 4.",
        });
      },
    },
    {
      label: "Mark batch shipped",
      hint: "Fulfillment",
      icon: Truck,
      onClick: () => onNavigate("orders"),
    },
    {
      label: "Process refunds",
      hint: "Fulfillment",
      icon: RefreshCcw,
      badge: counts.refunds,
      onClick: () => onNavigate("orders"),
    },
  ];

  const inventory: Action[] = [
    {
      label: "Upload COA",
      hint: "Inventory",
      icon: FlaskConical,
      badge: counts.coaPending,
      section: "coa",
    },
    {
      label: "Add new lot",
      hint: "Inventory",
      icon: PackagePlus,
      section: "archive",
    },
    {
      label: "Adjust stock",
      hint: "Inventory",
      icon: Boxes,
      section: "products",
    },
  ];

  const admin: Action[] = [
    { label: "New product", hint: "Catalog", icon: Package, section: "products" },
    { label: "New article", hint: "Education", icon: FileText, section: "articles" },
    { label: "Manual order", hint: "Internal", icon: Receipt, section: "orders" },
    { label: "Customer note", hint: "CRM", icon: UserPlus, section: "customers" },
    { label: "New referral", hint: "Affiliate", icon: Ticket, section: "referrals" },
    { label: "Research partner", hint: "Institutional", icon: Microscope, section: "partners" },
  ];

  return (
    <div className="space-y-4">
      <ActionRow heading="Fulfillment" actions={fulfillment} onNavigate={onNavigate} cols={4} />
      <ActionRow heading="Inventory" actions={inventory} onNavigate={onNavigate} cols={3} />

      <div className="border-t border-ink/8 pt-3">
        <button
          type="button"
          onClick={() => setAdminOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-foreground/55 hover:text-ink transition-colors"
        >
          {adminOpen ? (
            <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
          )}
          Admin actions
          <span className="text-foreground/35 normal-case tracking-normal">
            {adminOpen ? "" : `· ${admin.length} hidden`}
          </span>
        </button>
        {adminOpen && (
          <div className="mt-3">
            <ActionRow heading="" actions={admin} onNavigate={onNavigate} cols={6} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionRow({
  heading,
  actions,
  onNavigate,
  cols,
}: {
  heading: string;
  actions: Action[];
  onNavigate: (s: SectionId) => void;
  cols: number;
}) {
  const colsClass =
    cols === 6
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      : cols === 4
        ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3";
  return (
    <div>
      {heading && (
        <div className="mb-2 text-[9px] tracking-[0.28em] uppercase text-foreground/40">
          {heading}
        </div>
      )}
      <div className={`grid ${colsClass} gap-2`}>
        {actions.map((a) => {
          const Icon = a.icon;
          const handle = a.onClick ?? (() => a.section && onNavigate(a.section));
          return (
            <button
              key={a.label}
              type="button"
              onClick={handle}
              className="group relative text-left border border-ink/12 bg-background px-3 py-3 hover:border-ink/30 hover:bg-mist/40 transition-colors"
            >
              {typeof a.badge === "number" && a.badge > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] tabular-nums tracking-normal border border-amber-700/40 text-amber-900 bg-amber-50/60">
                  {a.badge}
                </span>
              )}
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
    </div>
  );
}