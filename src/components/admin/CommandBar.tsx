import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { commandSearch } from "@/lib/admin.functions";
import type { SectionId } from "./AdminDashboard";

const RECENT_KEY = "veratis.admin.recent";
const MAX_RECENT = 6;

type RecentItem = { key: string; label: string; section: SectionId; sub?: string };

function readRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function pushRecent(item: RecentItem) {
  if (typeof window === "undefined") return;
  const current = readRecent().filter((r) => r.key !== item.key);
  const next = [item, ...current].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function CommandBar({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (section: SectionId) => void;
}) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const search = useServerFn(commandSearch);

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  // Debounced query for server hits
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 160);
    return () => window.clearTimeout(id);
  }, [query]);

  const { data } = useQuery({
    queryKey: ["admin-command-search", debounced],
    queryFn: () => search({ data: { q: debounced } }),
    enabled: open,
    staleTime: 30_000,
  });

  const go = (item: RecentItem) => {
    pushRecent(item);
    onNavigate(item.section);
    onOpenChange(false);
    setQuery("");
  };

  const quickActions = useMemo(
    () => [
      { key: "qa:new-product", label: "New product", section: "products" as SectionId },
      { key: "qa:upload-coa", label: "Upload COA", section: "coa" as SectionId },
      { key: "qa:publish-article", label: "Publish article", section: "articles" as SectionId },
      { key: "qa:create-affiliate", label: "Create affiliate", section: "referrals" as SectionId },
      { key: "qa:create-customer-note", label: "Add customer note", section: "customers" as SectionId },
      { key: "qa:create-order", label: "Create order manually", section: "orders" as SectionId },
      { key: "qa:add-research-partner", label: "Add research partner", section: "partners" as SectionId },
    ],
    [],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-ink/40 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-[640px] border border-ink/15 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Admin command palette" shouldFilter={false}>
          <div className="border-b border-ink/10">
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search products, orders, customers, lots, articles…"
              className="w-full h-12 px-4 text-[14px] bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto py-2">
            <Command.Empty className="px-4 py-8 text-center text-[12px] text-foreground/50">
              No matches.
            </Command.Empty>

            {!query && recent.length > 0 && (
              <Command.Group heading="Recent" className="cmd-group">
                {recent.map((r) => (
                  <Command.Item
                    key={r.key}
                    value={r.key}
                    onSelect={() => go(r)}
                    className="cmd-item"
                  >
                    <span>{r.label}</span>
                    {r.sub && <span className="cmd-sub">{r.sub}</span>}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Quick actions" className="cmd-group">
              {quickActions.map((qa) => (
                <Command.Item
                  key={qa.key}
                  value={qa.key + " " + qa.label}
                  onSelect={() =>
                    go({ key: qa.key, label: qa.label, section: qa.section })
                  }
                  className="cmd-item"
                >
                  <span className="cmd-arrow">→</span>
                  <span>{qa.label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {data?.products && data.products.length > 0 && (
              <Command.Group heading="Products" className="cmd-group">
                {data.products.map((p: any) => (
                  <Command.Item
                    key={"p:" + p.id}
                    value={"p:" + p.id + " " + p.name}
                    onSelect={() =>
                      go({
                        key: "p:" + p.id,
                        label: p.name,
                        section: "products",
                        sub: p.status,
                      })
                    }
                    className="cmd-item"
                  >
                    <span>{p.name}</span>
                    <span className="cmd-sub">{p.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data?.orders && data.orders.length > 0 && (
              <Command.Group heading="Orders" className="cmd-group">
                {data.orders.map((o: any) => (
                  <Command.Item
                    key={"o:" + o.id}
                    value={"o:" + o.id + " " + o.order_number + " " + o.customer_email}
                    onSelect={() =>
                      go({
                        key: "o:" + o.id,
                        label: o.order_number,
                        section: "orders",
                        sub: o.customer_email,
                      })
                    }
                    className="cmd-item"
                  >
                    <span>{o.order_number}</span>
                    <span className="cmd-sub">{o.customer_email} · {o.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data?.customers && data.customers.length > 0 && (
              <Command.Group heading="Customers" className="cmd-group">
                {data.customers.map((c: any) => (
                  <Command.Item
                    key={"c:" + c.id}
                    value={"c:" + c.id + " " + (c.email ?? "") + " " + (c.full_name ?? "")}
                    onSelect={() =>
                      go({
                        key: "c:" + c.id,
                        label: c.full_name || c.email || "Customer",
                        section: "customers",
                        sub: c.email ?? undefined,
                      })
                    }
                    className="cmd-item"
                  >
                    <span>{c.full_name || c.email || "."}</span>
                    {c.full_name && c.email && <span className="cmd-sub">{c.email}</span>}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data?.articles && data.articles.length > 0 && (
              <Command.Group heading="Articles" className="cmd-group">
                {data.articles.map((a: any) => (
                  <Command.Item
                    key={"a:" + a.id}
                    value={"a:" + a.id + " " + a.title}
                    onSelect={() =>
                      go({
                        key: "a:" + a.id,
                        label: a.title,
                        section: "articles",
                        sub: a.status,
                      })
                    }
                    className="cmd-item"
                  >
                    <span>{a.title}</span>
                    <span className="cmd-sub">{a.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data?.lots && data.lots.length > 0 && (
              <Command.Group heading="Lots / COAs" className="cmd-group">
                {data.lots.map((l: any) => (
                  <Command.Item
                    key={"l:" + l.id}
                    value={"l:" + l.id + " " + l.lot_number}
                    onSelect={() =>
                      go({
                        key: "l:" + l.id,
                        label: "Lot " + l.lot_number,
                        section: "coa",
                        sub: l.active ? "active" : "inactive",
                      })
                    }
                    className="cmd-item"
                  >
                    <span>Lot {l.lot_number}</span>
                    <span className="cmd-sub">{l.active ? "active" : "inactive"}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data?.affiliates && data.affiliates.length > 0 && (
              <Command.Group heading="Affiliates" className="cmd-group">
                {data.affiliates.map((af: any) => (
                  <Command.Item
                    key={"af:" + af.id}
                    value={"af:" + af.id + " " + af.affiliate_code}
                    onSelect={() =>
                      go({
                        key: "af:" + af.id,
                        label: af.affiliate_code,
                        section: "referrals",
                        sub: af.status,
                      })
                    }
                    className="cmd-item"
                  >
                    <span>{af.affiliate_code}</span>
                    <span className="cmd-sub">{af.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data?.partners && data.partners.length > 0 && (
              <Command.Group heading="Research partners" className="cmd-group">
                {data.partners.map((rp: any) => (
                  <Command.Item
                    key={"rp:" + rp.id}
                    value={"rp:" + rp.id + " " + rp.institution}
                    onSelect={() =>
                      go({
                        key: "rp:" + rp.id,
                        label: rp.institution,
                        section: "partners",
                        sub: rp.status,
                      })
                    }
                    className="cmd-item"
                  >
                    <span>{rp.institution}</span>
                    <span className="cmd-sub">{rp.status}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
          <div className="border-t border-ink/10 px-4 py-2 flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-foreground/45">
            <span>Veratis · operations</span>
            <span>
              <kbd className="font-sans">↵</kbd> select &nbsp;·&nbsp;{" "}
              <kbd className="font-sans">esc</kbd> close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}