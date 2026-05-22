import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Empty, StatusPill } from "../ui";

type PaymentMethod = {
  id: string;
  label: string;
  enabled: boolean;
  sort_order: number;
  updated_at: string;
};

export function PaymentMethodsPanel() {
  const [rows, setRows] = useState<PaymentMethod[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setError(error.message);
      return;
    }
    setRows(data as PaymentMethod[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(method: PaymentMethod) {
    setSavingId(method.id);
    setError(null);
    const { error } = await supabase
      .from("payment_methods")
      .update({ enabled: !method.enabled })
      .eq("id", method.id);
    setSavingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-5">
      <Card
        title="Payment methods"
        hint="Enable or disable checkout payment options. Disabled methods are hidden from customers."
      >
        {rows === null ? (
          <Empty>Loading…</Empty>
        ) : rows.length === 0 ? (
          <Empty>No payment methods configured.</Empty>
        ) : (
          <div className="divide-y divide-ink/10">
            {rows.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-ink font-medium">{m.label}</p>
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/55 mt-0.5">
                    {m.id}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill tone={m.enabled ? "ok" : "neutral"}>
                    {m.enabled ? "Enabled" : "Disabled"}
                  </StatusPill>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={m.enabled}
                    disabled={savingId === m.id}
                    onClick={() => toggle(m)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      m.enabled ? "bg-ink" : "bg-ink/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                        m.enabled ? "translate-x-5" : "translate-x-0.5"
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