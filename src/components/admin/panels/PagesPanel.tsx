import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Empty, StatusPill } from "../ui";

type PageToggle = {
  page_key: string;
  label: string;
  enabled: boolean;
  updated_at: string;
};

export function PagesPanel() {
  const [rows, setRows] = useState<PageToggle[] | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("page_toggles")
      .select("*")
      .order("label", { ascending: true });
    if (error) {
      setError(error.message);
      return;
    }
    setRows(data as PageToggle[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(row: PageToggle) {
    setSavingKey(row.page_key);
    setError(null);
    const { error } = await supabase
      .from("page_toggles")
      .update({ enabled: !row.enabled })
      .eq("page_key", row.page_key);
    setSavingKey(null);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-5">
      <Card
        title="Page visibility"
        hint="Turn site pages on or off. Disabled pages return a 'Not available' notice and are hidden from navigation."
      >
        {rows === null ? (
          <Empty>Loading…</Empty>
        ) : rows.length === 0 ? (
          <Empty>No pages configured.</Empty>
        ) : (
          <div className="divide-y divide-ink/10">
            {rows.map((r) => (
              <div
                key={r.page_key}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-ink font-medium">{r.label}</p>
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55 mt-0.5">
                    {r.page_key}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill tone={r.enabled ? "ok" : "neutral"}>
                    {r.enabled ? "Visible" : "Hidden"}
                  </StatusPill>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={r.enabled}
                    disabled={savingKey === r.page_key}
                    onClick={() => toggle(r)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      r.enabled ? "bg-ink" : "bg-ink/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                        r.enabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="px-5 pb-4 text-[12px] text-red-700 font-mono">{error}</p>
        )}
      </Card>
    </div>
  );
}