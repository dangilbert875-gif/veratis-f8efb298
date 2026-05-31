import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listNotes, upsertNote, deleteNote } from "@/lib/admin-ops.functions";
import { GhostButton, PrimaryButton, TextArea } from "./ui";

type EntityType =
  | "product"
  | "order"
  | "customer"
  | "lot"
  | "article"
  | "affiliate"
  | "research_partner";

function renderMarkdown(md: string) {
  // Minimal, safe markdown: bold, italic, code, line breaks. No HTML.
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-mist/60 border border-ink/10 text-[11px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function relTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function InternalNotes({
  entityType,
  entityId,
}: {
  entityType: EntityType;
  entityId: string;
}) {
  const qc = useQueryClient();
  const fetchNotes = useServerFn(listNotes);
  const upsert = useServerFn(upsertNote);
  const remove = useServerFn(deleteNote);
  const [draft, setDraft] = useState("");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const key = ["internal-notes", entityType, entityId];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchNotes({ data: { entity_type: entityType, entity_id: entityId } }),
    enabled: Boolean(entityId),
  });

  const save = async () => {
    const body = draft.trim();
    if (!body) return;
    setSaving(true);
    try {
      await upsert({
        data: {
          entity_type: entityType,
          entity_id: entityId,
          body_md: body,
          pinned,
        },
      });
      setDraft("");
      setPinned(false);
      await qc.invalidateQueries({ queryKey: key });
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (n: any) => {
    await upsert({
      data: {
        id: n.id,
        entity_type: entityType,
        entity_id: entityId,
        body_md: n.body_md,
        pinned: !n.pinned,
      },
    });
    await qc.invalidateQueries({ queryKey: key });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await remove({ data: { id } });
    await qc.invalidateQueries({ queryKey: key });
  };

  return (
    <section className="border border-ink/10 bg-background">
      <header className="px-4 py-3 border-b border-ink/10 flex items-center justify-between">
        <div className="text-[12px] font-medium tracking-tight text-ink">Internal notes</div>
        <div className="text-[10px] tracking-[0.18em] uppercase text-foreground/45">
          {data?.length ?? 0} note{(data?.length ?? 0) === 1 ? "" : "s"}
        </div>
      </header>

      <div className="p-4 border-b border-ink/10 space-y-2">
        <TextArea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Operational note. supports *italic*, **bold**, `code`."
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[11px] text-foreground/65">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            Pin to top
          </label>
          <PrimaryButton onClick={save} disabled={saving || !draft.trim()}>
            {saving ? "Saving…" : "Add note"}
          </PrimaryButton>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-[12px] text-foreground/50">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="p-5 text-[12px] text-foreground/50">
          No notes yet. Use this space for internal context that should travel with the record.
        </div>
      ) : (
        <ul className="divide-y divide-ink/10">
          {data.map((n: any) => (
            <li key={n.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 text-[12.5px] leading-relaxed text-ink"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(n.body_md) }}
                />
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <GhostButton
                    onClick={() => togglePin(n)}
                    className="!h-7 !px-2 !text-[10px]"
                  >
                    {n.pinned ? "Unpin" : "Pin"}
                  </GhostButton>
                  <button
                    type="button"
                    onClick={() => del(n.id)}
                    className="text-[10px] tracking-[0.16em] uppercase text-foreground/50 hover:text-[var(--state-danger)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-1.5 text-[10.5px] tracking-[0.04em] text-foreground/50 flex gap-3">
                {n.pinned && (
                  <span className="uppercase tracking-[0.18em] text-foreground/60">Pinned</span>
                )}
                <span>{n.author_label ?? "."}</span>
                <span className="tabular-nums">{relTime(n.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}