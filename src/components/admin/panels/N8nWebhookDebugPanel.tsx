import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listN8nWebhookDebug, sendTestN8nWebhook } from "@/lib/admin.functions";
import { Card, Empty, GhostButton, PrimaryButton } from "../ui";

function fmt(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

type WebhookDebugDetail = {
  webhook_attempted?: boolean;
  url?: string;
  payload?: unknown;
  response_status?: number | null;
  response_body?: string | null;
  error_message?: string | null;
  source?: string;
};

type WebhookDebugRow = {
  id: string;
  created_at: string;
  action: string;
  diff: WebhookDebugDetail | null;
};

export function N8nWebhookDebugPanel() {
  const qc = useQueryClient();
  const fetchRows = useServerFn(listN8nWebhookDebug);
  const sendTest = useServerFn(sendTestN8nWebhook);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const logs = useQuery({
    queryKey: ["admin-n8n-webhook-debug"],
    queryFn: () => fetchRows(),
  });

  const handleSendTest = async () => {
    setSending(true);
    try {
      const result = await sendTest();
      toast.success(
        `Test webhook sent${result.response_status ? ` · ${result.response_status}` : ""}`,
      );
      await qc.invalidateQueries({ queryKey: ["admin-n8n-webhook-debug"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test webhook failed");
    } finally {
      setSending(false);
    }
  };

  const rows = (logs.data ?? []) as WebhookDebugRow[];

  return (
    <Card
      title="n8n webhook debug"
      hint="Recent order notification webhook attempts sent to the production n8n endpoint."
      action={
        <div className="flex items-center gap-2">
          <GhostButton
            type="button"
            onClick={() => qc.invalidateQueries({ queryKey: ["admin-n8n-webhook-debug"] })}
          >
            Refresh
          </GhostButton>
          <PrimaryButton type="button" onClick={handleSendTest} disabled={sending}>
            {sending ? "Sending…" : "Send Test n8n Webhook"}
          </PrimaryButton>
        </div>
      }
    >
      {logs.isLoading ? (
        <div className="divide-y divide-ink/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Empty>No n8n webhook attempts have been recorded yet.</Empty>
      ) : (
        <ul className="divide-y divide-ink/10">
          {rows.map((row) => {
            const detail = row.diff ?? {};
            const isOpen = openId === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                  className="w-full text-left px-5 py-4 hover:bg-mist/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-foreground/55">
                      attempted: {fmt(detail.webhook_attempted)}
                    </span>
                    <span className="text-[12px] text-ink tabular-nums">
                      status {fmt(detail.response_status)}
                    </span>
                    <span className="text-[11px] text-foreground/55">
                      {detail.source ?? row.action}
                    </span>
                    <span className="ml-auto text-[11px] tabular-nums text-foreground/55">
                      {new Date(row.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-foreground/60 break-all">
                    {detail.url ?? "—"}
                  </div>
                  {detail.error_message && (
                    <div className="mt-2 text-[11px] text-red-800">
                      Error: {detail.error_message}
                    </div>
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 bg-mist/30 border-t border-ink/10">
                    <dl className="grid gap-2 py-4 text-[12px]">
                      <div>
                        <dt className="text-[9px] tracking-[0.2em] uppercase text-foreground/45">
                          Full URL used
                        </dt>
                        <dd className="mt-1 font-mono break-all text-ink">{fmt(detail.url)}</dd>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <dt className="text-[9px] tracking-[0.2em] uppercase text-foreground/45">
                            Response status
                          </dt>
                          <dd className="mt-1 font-mono text-ink">{fmt(detail.response_status)}</dd>
                        </div>
                        <div>
                          <dt className="text-[9px] tracking-[0.2em] uppercase text-foreground/45">
                            Error message
                          </dt>
                          <dd className="mt-1 font-mono text-ink">{fmt(detail.error_message)}</dd>
                        </div>
                      </div>
                    </dl>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div>
                        <div className="mb-1.5 text-[9px] tracking-[0.2em] uppercase text-foreground/45">
                          JSON payload
                        </div>
                        <pre className="max-h-[360px] overflow-auto border border-ink/10 bg-background p-3 text-[11px] leading-relaxed font-mono">
                          {JSON.stringify(detail.payload ?? null, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="mb-1.5 text-[9px] tracking-[0.2em] uppercase text-foreground/45">
                          Response body
                        </div>
                        <pre className="max-h-[360px] overflow-auto border border-ink/10 bg-background p-3 text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                          {fmt(detail.response_body)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
