import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Card,
  Empty,
  Field,
  GhostButton,
  PrimaryButton,
  SelectInput,
  StatusPill,
  TextArea,
  TextInput,
  formatDate,
} from "../ui";
import {
  archiveLot,
  getSignedAssetUrl,
  listLots,
  listProductsLite,
  setLotActive,
  setLotStatus,
  uploadAsset,
  upsertLot,
} from "@/lib/catalog.functions";

type Lot = any;

// ── status model (mirrors DB enum public.lot_status) ──────────────
export type LotStatus =
  | "draft" | "pending_assay" | "awaiting_coa" | "released"
  | "archived" | "deactivated" | "failed" | "retest_required";

function statusOf(l: Lot): LotStatus {
  return (l?.status as LotStatus) ?? "draft";
}

const STATUS_LABEL: Record<LotStatus, string> = {
  draft: "Draft",
  pending_assay: "Pending assay",
  awaiting_coa: "Awaiting COA",
  released: "Released",
  archived: "Archived",
  deactivated: "Deactivated",
  failed: "Failed / Rejected",
  retest_required: "Retest required",
};

// muted, premium tones — green / amber / gray / red
const STATUS_TONE: Record<LotStatus, "ok" | "warn" | "neutral" | "bad"> = {
  released: "ok",
  awaiting_coa: "warn",
  pending_assay: "warn",
  retest_required: "warn",
  draft: "neutral",
  archived: "neutral",
  deactivated: "neutral",
  failed: "bad",
};

const STATUS_OPTIONS: LotStatus[] = [
  "draft","pending_assay","awaiting_coa","released",
  "retest_required","failed","archived","deactivated",
];

function puritynum(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = String(s).match(/[\d.]+/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return Number.isFinite(n) ? n : null;
}

// ── main panel ────────────────────────────────────────────────────
export function ArchivePanel() {
  const list = useServerFn(listLots);
  const setActive = useServerFn(setLotActive);
  const changeStatus = useServerFn(setLotStatus);
  const archive = useServerFn(archiveLot);
  const save = useServerFn(upsertLot);

  const [rows, setRows] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LotStatus>("all");
  const [missingCoaOnly, setMissingCoaOnly] = useState(false);
  const [sort, setSort] = useState<
    "newest" | "oldest" | "purity_desc" | "purity_asc" | "lot_az"
  >("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Lot | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await list();
      setRows(data);
      setSelected(new Set());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load verification archive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  // health metrics
  const health = useMemo(() => {
    const total = rows.length;
    let released = 0, missingCoa = 0, pending = 0, missingProduct = 0;
    let puritySum = 0, purityCount = 0;
    let lastUpdated = 0;
    for (const r of rows) {
      const s = statusOf(r);
      if (s === "released") released++;
      if (s === "released" && !r.coa_url) missingCoa++;
      if (s === "pending_assay") pending++;
      if (!r.product_id) missingProduct++;
      // Avg purity = released + public_visible lots only
      if (s === "released" && r.public_visible) {
        const p = puritynum(r.purity);
        if (p != null) { puritySum += p; purityCount++; }
      }
      const t = new Date(r.updated_at ?? r.created_at ?? 0).getTime();
      if (t > lastUpdated) lastUpdated = t;
    }
    return {
      total,
      released,
      missingCoa,
      pending,
      missingProduct,
      avgPurity: purityCount ? (puritySum / purityCount).toFixed(2) : "—",
      lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
    };
  }, [rows]);

  // filter + sort
  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (q) {
        const hay = [
          r.lot_number,
          r.products?.name,
          r.products?.slug,
          r.lab_partner,
          r.tested_by,
          r.identity_method,
        ].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== "all" && statusOf(r) !== statusFilter) return false;
      if (missingCoaOnly && r.coa_url) return false;
      return true;
    });
    out = [...out];
    switch (sort) {
      case "newest":
        out.sort((a, b) => +new Date(b.release_date ?? b.created_at) - +new Date(a.release_date ?? a.created_at));
        break;
      case "oldest":
        out.sort((a, b) => +new Date(a.release_date ?? a.created_at) - +new Date(b.release_date ?? b.created_at));
        break;
      case "purity_desc":
        out.sort((a, b) => (puritynum(b.purity) ?? -1) - (puritynum(a.purity) ?? -1));
        break;
      case "purity_asc":
        out.sort((a, b) => (puritynum(a.purity) ?? 1e9) - (puritynum(b.purity) ?? 1e9));
        break;
      case "lot_az":
        out.sort((a, b) => String(a.lot_number).localeCompare(String(b.lot_number)));
        break;
    }
    return out;
  }, [rows, query, statusFilter, missingCoaOnly, sort]);

  const allOnPageSelected = view.length > 0 && view.every((r) => selected.has(r.id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) view.forEach((r) => next.delete(r.id));
    else view.forEach((r) => next.add(r.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const verifyUrl = (lot: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/verify?lot=${encodeURIComponent(lot)}` : `/verify?lot=${lot}`;

  const copyLink = async (lot: string) => {
    try { await navigator.clipboard.writeText(verifyUrl(lot)); } catch {}
  };

  const duplicateLot = async (r: Lot) => {
    const suffix = `-COPY-${Math.floor(Math.random() * 9000 + 1000)}`;
    const payload: any = {
      product_id: r.product_id ?? null,
      lot_number: `${r.lot_number}${suffix}`,
      purity: r.purity ?? null,
      identity_status: r.identity_status ?? null,
      identity_method: r.identity_method ?? null,
      water_content: r.water_content ?? null,
      endotoxin: r.endotoxin ?? null,
      release_date: null,
      best_before: r.best_before ?? null,
      tested_by: r.tested_by ?? null,
      lab_partner: r.lab_partner ?? null,
      notes: r.notes ?? null,
      active: false,
    };
    await save({ data: payload });
    await reload();
  };

  const bulkArchive = async () => {
    if (!selected.size) return;
    if (!confirm(`Archive ${selected.size} lot${selected.size === 1 ? "" : "s"}? This hides them from the public archive.`)) return;
    for (const id of selected) {
      try { await changeStatus({ data: { id, status: "archived" } }); } catch {}
    }
    await reload();
  };

  const bulkRelease = async () => {
    if (!selected.size) return;
    if (!confirm(`Mark ${selected.size} lot${selected.size === 1 ? "" : "s"} as Released?\n\nLots without a COA will still be released — verify each one before publishing.`)) return;
    for (const id of selected) {
      try { await changeStatus({ data: { id, status: "released" } }); } catch {}
    }
    await reload();
  };

  const exportCsv = (which: "all" | "selected") => {
    const target = which === "selected"
      ? view.filter((r) => selected.has(r.id))
      : view;
    const head = [
      "lot_number","product","status","purity","release_date","best_before",
      "lab_partner","tested_by","identity_method","coa_url","lcms_url","hplc_url",
    ];
    const rows = target.map((r) => [
      r.lot_number ?? "",
      r.products?.name ?? "",
      STATUS_LABEL[statusOf(r)],
      r.purity ?? "",
      r.release_date ?? "",
      r.best_before ?? "",
      r.lab_partner ?? "",
      r.tested_by ?? "",
      r.identity_method ?? "",
      r.coa_url ?? "",
      r.lcms_url ?? "",
      r.hplc_url ?? "",
    ]);
    const esc = (v: any) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [head, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-archive-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Health strip */}
      <Card title="Archive health" hint={health.lastUpdated ? `Last update ${health.lastUpdated.toLocaleString()}` : "—"}>
        <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-ink/10 border-t border-ink/10">
          <HealthCell label="Total lots" value={health.total} />
          <HealthCell label="Released" value={health.released} />
          <HealthCell label="Missing COA" value={health.missingCoa} tone={health.missingCoa ? "warn" : "neutral"} />
          <HealthCell label="Pending assay" value={health.pending} tone={health.pending ? "warn" : "neutral"} />
          <HealthCell label="Unlinked product" value={health.missingProduct} tone={health.missingProduct ? "warn" : "neutral"} />
          <HealthCell label="Avg purity %" value={health.avgPurity} />
        </div>
      </Card>

      {/* Lot table */}
      <Card
        title="Verification lots"
        hint={`${view.length} of ${rows.length} shown`}
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => exportCsv("all")}>Export CSV</GhostButton>
            <GhostButton onClick={reload}>Sync</GhostButton>
            <PrimaryButton onClick={() => setCreating(true)}>+ New verification lot</PrimaryButton>
          </div>
        }
      >
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-ink/10 flex flex-wrap gap-2 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lot, product, lab partner…"
            className="h-8 px-2 text-[12.5px] border border-ink/15 bg-background min-w-[260px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 px-2 text-[12.5px] border border-ink/15 bg-background"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-8 px-2 text-[12.5px] border border-ink/15 bg-background"
          >
            <option value="newest">Newest release</option>
            <option value="oldest">Oldest release</option>
            <option value="purity_desc">Highest purity</option>
            <option value="purity_asc">Lowest purity</option>
            <option value="lot_az">Lot A–Z</option>
          </select>
          <label className="text-[11.5px] tracking-[0.12em] uppercase text-foreground/65 flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={missingCoaOnly}
              onChange={(e) => setMissingCoaOnly(e.target.checked)}
            />
            Missing COA only
          </label>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="px-5 py-2 border-b border-ink/10 bg-ink/[0.025] flex items-center gap-2 text-[12px]">
            <span className="text-foreground/70">{selected.size} selected</span>
            <span className="text-foreground/30">·</span>
            <GhostButton onClick={bulkRelease}>Mark released</GhostButton>
            <GhostButton onClick={bulkArchive}>Archive</GhostButton>
            <GhostButton onClick={() => exportCsv("selected")}>Export</GhostButton>
            <GhostButton onClick={() => setSelected(new Set())}>Clear</GhostButton>
          </div>
        )}

        {error && (
          <div className="mx-5 my-3 border border-red-700/30 bg-red-50 px-3 py-2 text-[12px] text-red-800">
            {error} <button className="underline ml-2" onClick={reload}>Retry</button>
          </div>
        )}

        {loading ? (
          <Empty>Loading verification archive…</Empty>
        ) : !view.length ? (
          rows.length === 0 ? (
            <div className="px-5 py-10 text-center space-y-3">
              <div className="text-[12.5px] text-foreground/65 max-w-md mx-auto">
                No verification lots have been created yet. Create a lot record or upload a COA to begin building the archive.
              </div>
              <div className="flex items-center justify-center gap-2">
                <PrimaryButton onClick={() => setCreating(true)}>+ New verification lot</PrimaryButton>
              </div>
            </div>
          ) : (
            <Empty>No lots match the current filters.</Empty>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
                <tr>
                  <th className="w-8 px-3 py-3">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} />
                  </th>
                  <th className="text-left font-medium px-3 py-3">Lot</th>
                  <th className="text-left font-medium px-3 py-3">Product</th>
                  <th className="text-right font-medium px-3 py-3">Purity</th>
                  <th className="text-left font-medium px-3 py-3">COA</th>
                  <th className="text-left font-medium px-3 py-3">Lab</th>
                  <th className="text-left font-medium px-3 py-3">Released</th>
                  <th className="text-left font-medium px-3 py-3">Status</th>
                  <th className="text-right font-medium px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {view.map((r) => {
                  const s = statusOf(r);
                  return (
                    <tr key={r.id} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                      </td>
                      <td className="px-3 py-3 font-mono">
                        <button className="hover:underline" onClick={() => setEditing(r)}>{r.lot_number}</button>
                      </td>
                      <td className="px-3 py-3">
                        {r.products?.name ?? <span className="text-foreground/40">— Unlinked —</span>}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{r.purity ?? "—"}</td>
                      <td className="px-3 py-3">
                        {r.coa_url
                          ? <StatusPill tone="ok">On file</StatusPill>
                          : <StatusPill tone="warn">Missing</StatusPill>}
                      </td>
                      <td className="px-3 py-3 text-foreground/70">{r.lab_partner ?? r.tested_by ?? "—"}</td>
                      <td className="px-3 py-3 text-foreground/70">{formatDate(r.release_date)}</td>
                      <td className="px-3 py-3">
                        <StatusPill tone={STATUS_TONE[s]}>{STATUS_LABEL[s]}</StatusPill>
                        {r.visibility_override && (
                          <span className="ml-1.5 text-[9px] tracking-[0.2em] uppercase text-foreground/45">override</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <GhostButton onClick={() => setEditing(r)}>Edit</GhostButton>{" "}
                        <GhostButton onClick={() => copyLink(r.lot_number)} title="Copy public verification URL">Copy URL</GhostButton>{" "}
                        <GhostButton onClick={() => duplicateLot(r)}>Duplicate</GhostButton>{" "}
                        <GhostButton
                          onClick={async () => {
                            const next: LotStatus = r.status === "deactivated" ? "released" : "deactivated";
                            if (next === "deactivated" && r.status === "released" &&
                                !confirm(`Deactivate released lot ${r.lot_number}?\n\nIt will be removed from the public archive and become un-verifiable.`)) return;
                            await changeStatus({ data: { id: r.id, status: next } });
                            await reload();
                          }}
                        >
                          {r.status === "deactivated" ? "Reactivate" : "Deactivate"}
                        </GhostButton>{" "}
                        <GhostButton
                          onClick={async () => {
                            const msg = r.status === "released"
                              ? `Archive released lot ${r.lot_number}?\n\nIt will disappear from the public archive.`
                              : `Archive lot ${r.lot_number}?`;
                            if (!confirm(msg)) return;
                            await changeStatus({ data: { id: r.id, status: "archived" } });
                            await reload();
                          }}
                        >
                          Archive
                        </GhostButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(editing || creating) && (
        <LotDrawer
          lot={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={async () => { setEditing(null); setCreating(false); await reload(); }}
        />
      )}
    </div>
  );
}

function HealthCell({ label, value, tone = "neutral" }: { label: string; value: any; tone?: "neutral" | "warn" }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[9.5px] tracking-[0.24em] uppercase text-foreground/55">{label}</div>
      <div className={`mt-1 text-[18px] font-medium tabular-nums ${tone === "warn" && value ? "text-amber-700" : ""}`}>{value}</div>
    </div>
  );
}

// ── editor drawer ─────────────────────────────────────────────────
const lotEmpty = {
  product_id: null as string | null,
  lot_number: "",
  purity: "",
  identity_status: "",
  identity_method: "",
  water_content: "",
  endotoxin: "",
  release_date: "",
  best_before: "",
  tested_by: "",
  lab_partner: "",
  coa_url: "",
  lcms_url: "",
  hplc_url: "",
  notes: "",
  active: true,
  status: "draft" as LotStatus,
  public_visible: false,
  verify_lookup_enabled: false,
  product_page_visible: false,
  coa_download_enabled: false,
  visibility_override: false,
};

function LotDrawer({ lot, onClose, onSaved }: { lot: Lot | null; onClose: () => void; onSaved: () => void }) {
  const save = useServerFn(upsertLot);
  const upload = useServerFn(uploadAsset);
  const sign = useServerFn(getSignedAssetUrl);
  const listProducts = useServerFn(listProductsLite);

  const [form, setForm] = useState<any>(lot ? { ...lotEmpty, ...lot } : lotEmpty);
  const [products, setProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => { listProducts().then(setProducts).catch(() => {}); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleUpload = async (
    file: File,
    bucket: "coa-pdfs" | "chromatograms" | "raw-lab-data",
    field: "coa_url" | "lcms_url" | "hplc_url",
  ) => {
    setUploading(field);
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const path = `${form.lot_number || "tmp"}/${field}-${Date.now()}-${file.name}`;
      const res = await upload({
        data: {
          bucket,
          path,
          contentBase64: b64,
          contentType: file.type || "application/pdf",
        },
      });
      set(field, (res as any).signed ? path : (res as any).url);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const peek = async (
    bucket: "coa-pdfs" | "chromatograms" | "raw-lab-data",
    path: string,
  ) => {
    try {
      const r = await sign({ data: { bucket, path } });
      window.open((r as any).url, "_blank", "noopener");
    } catch (e: any) {
      alert(e?.message ?? "Could not open file");
    }
  };

  const submit = async () => {
    setError(null);
    if (!form.lot_number) { setError("Lot number is required."); return; }
    if (form.status === "released" && !form.coa_url &&
        !confirm("This lot has no COA. Publish as Released anyway?\n\nThe lot will be public but its COA will not be downloadable.")) {
      return;
    }
    if ((form.status === "failed") &&
        !confirm(`Mark lot ${form.lot_number} as Failed / Rejected?\n\nIt will be hidden from the storefront and public archive.`)) {
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      ["purity","identity_status","identity_method","water_content",
       "endotoxin","tested_by","lab_partner","coa_url","lcms_url",
       "hplc_url","notes"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (payload.release_date === "") payload.release_date = null;
      if (payload.best_before === "") payload.best_before = null;
      if (payload.product_id === "") payload.product_id = null;
      delete payload.products;
      if (!lot) delete payload.id;
      await save({ data: payload });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const derivedStatus = statusOf(form);

  // When admin toggles a flag manually, mark override on.
  const setFlag = (k: string, v: boolean) =>
    setForm((f: any) => ({ ...f, [k]: v, visibility_override: true }));

  // When status changes from the drawer, clear override so DB trigger re-derives.
  const setStatus = (s: LotStatus) =>
    setForm((f: any) => ({ ...f, status: s, visibility_override: false }));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink/40" onClick={onClose} />
      <div className="w-full max-w-[680px] h-full overflow-y-auto bg-background border-l border-ink/15">
        <header className="sticky top-0 bg-background border-b border-ink/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-[9px] tracking-[0.32em] uppercase text-foreground/50">
              {lot ? "Edit lot" : "New verification lot"}
            </div>
            <h2 className="mt-1 text-[16px] font-medium tracking-tight font-mono">
              {form.lot_number || "—"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone={STATUS_TONE[derivedStatus]}>{STATUS_LABEL[derivedStatus]}</StatusPill>
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save lot"}
            </PrimaryButton>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {error && (
            <div className="border border-red-700/30 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>
          )}

          <Section title="Core information">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lot number">
                <TextInput value={form.lot_number} onChange={(e) => set("lot_number", e.target.value)} />
              </Field>
              <Field label="Product">
                <SelectInput
                  value={form.product_id ?? ""}
                  onChange={(e) => set("product_id", e.target.value || null)}
                >
                  <option value="">— Unassigned —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Lab partner">
                <TextInput value={form.lab_partner ?? ""} onChange={(e) => set("lab_partner", e.target.value)} />
              </Field>
              <Field label="Tested by">
                <TextInput value={form.tested_by ?? ""} onChange={(e) => set("tested_by", e.target.value)} />
              </Field>
              <Field label="Release date">
                <TextInput type="date" value={form.release_date ?? ""} onChange={(e) => set("release_date", e.target.value)} />
              </Field>
              <Field label="Best before">
                <TextInput type="date" value={form.best_before ?? ""} onChange={(e) => set("best_before", e.target.value)} />
              </Field>
              <Field label="Status">
                <SelectInput value={form.status ?? "draft"} onChange={(e) => setStatus(e.target.value as LotStatus)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
          </Section>

          <Section title="Public visibility">
            <div className="space-y-2.5">
              {form.visibility_override ? (
                <div className="text-[11px] tracking-[0.16em] uppercase text-amber-700 flex items-center justify-between">
                  <span>Manual visibility override active</span>
                  <button
                    type="button"
                    className="underline normal-case tracking-normal text-[12px] text-foreground/70 hover:text-ink"
                    onClick={() => setForm((f: any) => ({ ...f, visibility_override: false }))}
                  >
                    Reset to status defaults
                  </button>
                </div>
              ) : (
                <div className="text-[11px] tracking-[0.16em] uppercase text-foreground/55">
                  Visibility follows status — toggle a flag to override.
                </div>
              )}
              <Toggle
                label="Public archive visible"
                checked={!!form.public_visible}
                onChange={(v) => setFlag("public_visible", v)}
              />
              <Toggle
                label="Verify lookup enabled"
                checked={!!form.verify_lookup_enabled}
                onChange={(v) => setFlag("verify_lookup_enabled", v)}
              />
              <Toggle
                label="Product page visible"
                checked={!!form.product_page_visible}
                onChange={(v) => setFlag("product_page_visible", v)}
              />
              <Toggle
                label="COA download enabled"
                checked={!!form.coa_download_enabled}
                onChange={(v) => setFlag("coa_download_enabled", v)}
                disabled={!form.coa_url}
                hint={!form.coa_url ? "No COA uploaded yet" : undefined}
              />
            </div>
          </Section>

          <Section title="Testing data">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purity (HPLC %)">
                <TextInput value={form.purity ?? ""} onChange={(e) => set("purity", e.target.value)} placeholder="99.4%" />
              </Field>
              <Field label="Identity method">
                <TextInput value={form.identity_method ?? ""} onChange={(e) => set("identity_method", e.target.value)} placeholder="LC-MS, HPLC…" />
              </Field>
              <Field label="Identity status">
                <TextInput value={form.identity_status ?? ""} onChange={(e) => set("identity_status", e.target.value)} placeholder="Confirmed" />
              </Field>
              <Field label="Endotoxin">
                <TextInput value={form.endotoxin ?? ""} onChange={(e) => set("endotoxin", e.target.value)} placeholder="< 0.5 EU/mg" />
              </Field>
              <Field label="Water content">
                <TextInput value={form.water_content ?? ""} onChange={(e) => set("water_content", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Documentation">
            <div className="space-y-3">
              <FileSlot
                label="COA (PDF)"
                path={form.coa_url}
                busy={uploading === "coa_url"}
                onUpload={(f) => handleUpload(f, "coa-pdfs", "coa_url")}
                onPeek={(p) => peek("coa-pdfs", p)}
                onClear={() => set("coa_url", "")}
                accept="application/pdf"
              />
              <FileSlot
                label="LC-MS chromatogram"
                path={form.lcms_url}
                busy={uploading === "lcms_url"}
                onUpload={(f) => handleUpload(f, "chromatograms", "lcms_url")}
                onPeek={(p) => peek("chromatograms", p)}
                onClear={() => set("lcms_url", "")}
                accept="application/pdf,image/*"
              />
              <FileSlot
                label="HPLC chromatogram"
                path={form.hplc_url}
                busy={uploading === "hplc_url"}
                onUpload={(f) => handleUpload(f, "chromatograms", "hplc_url")}
                onPeek={(p) => peek("chromatograms", p)}
                onClear={() => set("hplc_url", "")}
                accept="application/pdf,image/*"
              />
              {form.lot_number && (
                <div className="pt-2 text-[11.5px] text-foreground/60">
                  Public verification URL:{" "}
                  <code className="font-mono text-foreground/80">/verify?lot={form.lot_number}</code>{" "}
                  <button
                    className="underline ml-1"
                    onClick={() => {
                      const u = `${window.location.origin}/verify?lot=${encodeURIComponent(form.lot_number)}`;
                      navigator.clipboard?.writeText(u).catch(() => {});
                    }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          </Section>

          <Section title="Internal notes">
            <Field label="Notes (admin-only)">
              <TextArea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={4} />
            </Field>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-[10px] tracking-[0.28em] uppercase text-foreground/55 mb-3 border-b border-ink/10 pb-1.5">{title}</div>
      {children}
    </section>
  );
}

function Toggle({
  label, checked, onChange, disabled, hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className={`flex items-center justify-between py-1.5 ${disabled ? "opacity-50" : ""}`}>
      <span className="text-[12.5px] text-ink">
        {label}
        {hint && <span className="ml-2 text-[10.5px] tracking-[0.14em] uppercase text-foreground/45">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-[18px] w-[34px] rounded-full border transition-colors ${
          checked ? "bg-ink border-ink" : "bg-background border-ink/25"
        }`}
      >
        <span
          className={`absolute top-[1px] h-[14px] w-[14px] rounded-full bg-background border border-ink/15 transition-transform ${
            checked ? "translate-x-[17px] bg-background" : "translate-x-[1px]"
          }`}
        />
      </button>
    </label>
  );
}

function FileSlot({
  label, path, onUpload, onPeek, onClear, accept, busy,
}: {
  label: string;
  path: string | null;
  onUpload: (f: File) => void;
  onPeek: (path: string) => void;
  onClear: () => void;
  accept: string;
  busy?: boolean;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`border border-dashed px-4 py-3 transition-colors ${drag ? "border-ink/60 bg-ink/[0.04]" : "border-ink/15"}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onUpload(f);
      }}
    >
      <div className="text-[9.5px] tracking-[0.24em] uppercase text-foreground/55 mb-1.5">{label}</div>
      <div className="flex items-center gap-3 flex-wrap">
        {path ? (
          <>
            <span className="text-[11.5px] font-mono text-foreground/70 truncate max-w-[280px]">{path}</span>
            <GhostButton onClick={() => onPeek(path)}>Open</GhostButton>
            <GhostButton onClick={onClear}>Remove</GhostButton>
          </>
        ) : (
          <span className="text-[12px] text-foreground/50">
            {busy ? "Uploading…" : "Drop file here or choose below."}
          </span>
        )}
        <input
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          className="text-[12px]"
          disabled={busy}
        />
      </div>
    </div>
  );
}