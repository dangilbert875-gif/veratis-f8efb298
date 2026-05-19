import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Empty, GhostButton, PrimaryButton, StatusPill, formatUSD } from "../ui";
import {
  archiveProduct,
  duplicateProduct,
  listProducts,
  reorderProducts,
  setProductStatus,
} from "@/lib/catalog.functions";
import { ProductEditor } from "./ProductEditor";

type Product = any;

export function ProductsPanel() {
  const list = useServerFn(listProducts);
  const reorder = useServerFn(reorderProducts);
  const setStatus = useServerFn(setProductStatus);
  const archive = useServerFn(archiveProduct);
  const duplicate = useServerFn(duplicateProduct);

  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await list();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.slug ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const handleDragEnd = async (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIndex = filtered.findIndex((r) => r.id === e.active.id);
    const newIndex = filtered.findIndex((r) => r.id === e.over!.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(filtered, oldIndex, newIndex);
    // Merge ordering back into full rows list preserving non-filtered position-by-id ordering
    const visibleIds = new Set(filtered.map((r) => r.id));
    const merged: Product[] = [];
    let nIdx = 0;
    for (const r of rows) {
      if (visibleIds.has(r.id)) {
        merged.push(next[nIdx++]);
      } else {
        merged.push(r);
      }
    }
    setRows(merged);
    await reorder({ data: { orderedIds: merged.map((m) => m.id) } });
  };

  const handleStatus = async (id: string, status: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    await setStatus({ data: { id, status: status as any } });
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this product? It will be removed from the public catalog.")) return;
    await archive({ data: { id } });
    await reload();
  };

  const handleDuplicate = async (id: string) => {
    await duplicate({ data: { id } });
    await reload();
  };

  return (
    <>
      <Card
        title="Catalog"
        hint={`${rows.length} item${rows.length === 1 ? "" : "s"} · drag to reorder`}
        action={<PrimaryButton onClick={() => setCreating(true)}>New product</PrimaryButton>}
      >
        <div className="px-5 py-3 border-b border-ink/10 flex flex-wrap gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, slug, category"
            className="h-8 px-2 text-[12.5px] border border-ink/15 bg-background min-w-[240px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 text-[12px] border border-ink/15 bg-background"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        {loading ? (
          <Empty>Loading…</Empty>
        ) : !filtered.length ? (
          <Empty>No products.</Empty>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-ink/5">
                {filtered.map((r) => (
                  <ProductRow
                    key={r.id}
                    row={r}
                    onEdit={() => setEditing(r)}
                    onDuplicate={() => handleDuplicate(r.id)}
                    onArchive={() => handleArchive(r.id)}
                    onStatusChange={(s) => handleStatus(r.id, s)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {(editing || creating) && (
        <ProductEditor
          product={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={async () => { setEditing(null); setCreating(false); await reload(); }}
        />
      )}
    </>
  );
}

function ProductRow({
  row,
  onEdit,
  onDuplicate,
  onArchive,
  onStatusChange,
}: {
  row: any;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onStatusChange: (s: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const tone =
    row.status === "published" ? "ok" :
    row.status === "draft" ? "neutral" :
    row.status === "out_of_stock" ? "warn" : "bad";

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-5 py-3 hover:bg-mist/30">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-foreground/40 hover:text-ink px-1 text-[14px]"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <button onClick={onEdit} className="text-[13px] font-medium tracking-tight text-ink hover:underline truncate">
            {row.name}
          </button>
          <StatusPill tone={tone as any}>{row.status}</StatusPill>
          {row.featured && <StatusPill tone="neutral">Featured</StatusPill>}
        </div>
        <div className="mt-0.5 text-[11px] text-foreground/55 font-mono truncate">
          {row.slug} · {row.category ?? "uncategorised"}
        </div>
      </div>
      <div className="text-right tabular-nums text-[12.5px] w-24">{formatUSD(row.price_usd)}</div>
      <div className="text-right tabular-nums text-[11px] text-foreground/60 w-16">
        {row.inventory_count ?? 0}
      </div>
      <select
        value={row.status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-8 px-2 text-[11px] border border-ink/15 bg-background"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="out_of_stock">Out of stock</option>
        <option value="archived">Archived</option>
      </select>
      <GhostButton onClick={onEdit}>Edit</GhostButton>
      <GhostButton onClick={onDuplicate}>Copy</GhostButton>
      <GhostButton onClick={onArchive}>Archive</GhostButton>
    </div>
  );
}