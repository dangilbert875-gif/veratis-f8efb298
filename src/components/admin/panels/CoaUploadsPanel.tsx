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
  listVerificationLogs,
  setLotActive,
  uploadAsset,
  upsertLot,
} from "@/lib/catalog.functions";

type Lot = any;

export function CoaUploadsPanel() {
  const list = useServerFn(listLots);
  const listVerif = useServerFn(listVerificationLogs);
  const setActive = useServerFn(setLotActive);
  const archive = useServerFn(archiveLot);

  const [rows, setRows] = useState<Lot[]>([]);
  const [verif, setVerif] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Lot | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [lots, logs] = await Promise.all([list(), listVerif()]);
      setRows(lots);
      setVerif(logs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.lot_number?.toLowerCase().includes(q) ||
        r.products?.name?.toLowerCase().includes(q) ||
        r.lab_partner?.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="space-y-5">
      <Card
        title="Lot register"
        hint={`${rows.length} lot${rows.length === 1 ? "" : "s"}`}
        action={<PrimaryButton onClick={() => setCreating(true)}>New lot</PrimaryButton>}
      >
        <div className="px-5 py-3 border-b border-ink/10 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lot, product, lab"
            className="h-8 px-2 text-[12.5px] border border-ink/15 bg-background min-w-[280px]"
          />
        </div>
        {loading ? (
          <Empty>Loading…</Empty>
        ) : !filtered.length ? (
          <Empty>No lots.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Lot</th>
                  <th className="text-left font-medium px-5 py-3">Product</th>
                  <th className="text-left font-medium px-5 py-3">Purity</th>
                  <th className="text-left font-medium px-5 py-3">Lab</th>
                  <th className="text-left font-medium px-5 py-3">Released</th>
                  <th className="text-left font-medium px-5 py-3">State</th>
                  <th className="text-right font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5">
                    <td className="px-5 py-3 font-mono">{r.lot_number}</td>
                    <td className="px-5 py-3">{r.products?.name ?? "—"}</td>
                    <td className="px-5 py-3 tabular-nums">{r.purity ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground/70">{r.lab_partner ?? r.tested_by ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground/70">{formatDate(r.release_date)}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={r.active ? "ok" : "neutral"}>
                        {r.active ? "Active" : "Inactive"}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <GhostButton onClick={() => setEditing(r)}>Edit</GhostButton>{" "}
                      <GhostButton
                        onClick={async () => {
                          await setActive({ data: { id: r.id, active: !r.active } });
                          await reload();
                        }}
                      >
                        {r.active ? "Deactivate" : "Activate"}
                      </GhostButton>{" "}
                      <GhostButton
                        onClick={async () => {
                          if (!confirm("Archive this lot?")) return;
                          await archive({ data: { id: r.id } });
                          await reload();
                        }}
                      >
                        Archive
                      </GhostButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent verification lookups" hint="Public /verify queries">
        {!verif.length ? (
          <Empty>No lookups yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Lot</th>
                  <th className="text-left font-medium px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {verif.map((v) => (
                  <tr key={v.id} className="border-b border-ink/5">
                    <td className="px-5 py-3 font-mono">{v.lot_number}</td>
                    <td className="px-5 py-3 text-foreground/70">
                      {new Date(v.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(editing || creating) && (
        <LotEditor
          lot={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={async () => { setEditing(null); setCreating(false); await reload(); }}
        />
      )}
    </div>
  );
}

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
};

function LotEditor({
  lot,
  onClose,
  onSaved,
}: {
  lot: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useServerFn(upsertLot);
  const upload = useServerFn(uploadAsset);
  const sign = useServerFn(getSignedAssetUrl);
  const listProducts = useServerFn(listProductsLite);

  const [form, setForm] = useState<any>(lot ? { ...lotEmpty, ...lot } : lotEmpty);
  const [products, setProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { listProducts().then(setProducts).catch(() => {}); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleUpload = async (
    file: File,
    bucket: "coa-pdfs" | "chromatograms" | "raw-lab-data",
    field: "coa_url" | "lcms_url" | "hplc_url",
  ) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const path = `${form.lot_number || "tmp"}/${field}-${Date.now()}-${file.name}`;
      const res = await upload({
        data: {
          bucket,
          path,
          contentBase64: b64,
          contentType: file.type || "application/pdf",
        },
      });
      // For private buckets, we store the path so we can re-sign on demand.
      set(field, res.signed ? path : res.url);
    };
    reader.readAsDataURL(file);
  };

  const peek = async (
    bucket: "coa-pdfs" | "chromatograms" | "raw-lab-data",
    path: string,
  ) => {
    try {
      const r = await sign({ data: { bucket, path } });
      window.open(r.url, "_blank", "noopener");
    } catch (e: any) {
      alert(e?.message ?? "Could not open file");
    }
  };

  const submit = async () => {
    setError(null);
    if (!form.lot_number) {
      setError("Lot number is required.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      ["purity", "identity_status", "identity_method", "water_content",
        "endotoxin", "tested_by", "lab_partner", "coa_url", "lcms_url",
        "hplc_url", "notes"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (payload.release_date === "") payload.release_date = null;
      if (payload.best_before === "") payload.best_before = null;
      if (payload.product_id === "") payload.product_id = null;
      // Strip joined fields
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

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink/40" onClick={onClose} />
      <div className="w-full max-w-[640px] h-full overflow-y-auto bg-background border-l border-ink/15">
        <header className="sticky top-0 bg-background border-b border-ink/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-[9px] tracking-[0.32em] uppercase text-foreground/50">
              {lot ? "Edit lot" : "New lot"}
            </div>
            <h2 className="mt-1 text-[16px] font-medium tracking-tight font-mono">
              {form.lot_number || "—"}
            </h2>
          </div>
          <div className="flex gap-2">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </header>
        <div className="p-6 space-y-5">
          {error && (
            <div className="border border-red-700/30 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>
          )}

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
            <Field label="Purity">
              <TextInput value={form.purity ?? ""} onChange={(e) => set("purity", e.target.value)} />
            </Field>
            <Field label="Identity status">
              <TextInput value={form.identity_status ?? ""} onChange={(e) => set("identity_status", e.target.value)} />
            </Field>
            <Field label="Identity method">
              <TextInput value={form.identity_method ?? ""} onChange={(e) => set("identity_method", e.target.value)} placeholder="LC-MS, HPLC…" />
            </Field>
            <Field label="Water content">
              <TextInput value={form.water_content ?? ""} onChange={(e) => set("water_content", e.target.value)} />
            </Field>
            <Field label="Endotoxin">
              <TextInput value={form.endotoxin ?? ""} onChange={(e) => set("endotoxin", e.target.value)} />
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
            <Field label="Active">
              <SelectInput value={form.active ? "yes" : "no"} onChange={(e) => set("active", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </SelectInput>
            </Field>
          </div>

          <div className="space-y-3 border-t border-ink/10 pt-4">
            <FileSlot
              label="COA (PDF, PNG, JPG)"
              path={form.coa_url}
              onUpload={(f) => handleUpload(f, "coa-pdfs", "coa_url")}
              onPeek={(p) => peek("coa-pdfs", p)}
              onClear={() => set("coa_url", "")}
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              getPreviewUrl={async (p) => {
                const r = await sign({ data: { bucket: "coa-pdfs", path: p } });
                return (r as any).url as string;
              }}
            />
            <FileSlot
              label="LC-MS chromatogram"
              path={form.lcms_url}
              onUpload={(f) => handleUpload(f, "chromatograms", "lcms_url")}
              onPeek={(p) => peek("chromatograms", p)}
              onClear={() => set("lcms_url", "")}
              accept="application/pdf,image/*"
            />
            <FileSlot
              label="HPLC chromatogram"
              path={form.hplc_url}
              onUpload={(f) => handleUpload(f, "chromatograms", "hplc_url")}
              onPeek={(p) => peek("chromatograms", p)}
              onClear={() => set("hplc_url", "")}
              accept="application/pdf,image/*"
            />
          </div>

          <Field label="Notes">
            <TextArea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={4} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function FileSlot({
  label,
  path,
  onUpload,
  onPeek,
  onClear,
  accept,
}: {
  label: string;
  path: string | null;
  onUpload: (f: File) => void;
  onPeek: (path: string) => void;
  onClear: () => void;
  accept: string;
}) {
  return (
    <div>
      <div className="text-[9.5px] tracking-[0.24em] uppercase text-foreground/55 mb-1.5">{label}</div>
      <div className="flex items-center gap-3 flex-wrap">
        {path ? (
          <>
            <span className="text-[11.5px] font-mono text-foreground/70 truncate max-w-[260px]">{path}</span>
            <GhostButton onClick={() => onPeek(path)}>Open</GhostButton>
            <GhostButton onClick={onClear}>Remove</GhostButton>
          </>
        ) : (
          <span className="text-[12px] text-foreground/50">No file attached.</span>
        )}
        <input
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          className="text-[12px]"
        />
      </div>
    </div>
  );
}