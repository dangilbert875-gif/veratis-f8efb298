import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Field,
  GhostButton,
  PrimaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "../ui";
import {
  listArticlesLite,
  listProductsLite,
  upsertProduct,
  uploadAsset,
} from "@/lib/catalog.functions";

type Props = {
  product: any | null;
  onClose: () => void;
  onSaved: () => void;
  onNavigate?: (s: any) => void;
};

const empty = {
  name: "",
  slug: "",
  category: "",
  short_description: "",
  full_description: "",
  molecular_class: "",
  storage_guidance: "",
  lyophilized: false,
  featured_image: "",
  gallery_images: [] as string[],
  price_usd: 0,
  compare_at_price: null as number | null,
  inventory_count: 0,
  low_stock_threshold: 5,
  purity: "",
  endotoxin: "",
  tags: [] as string[],
  meta_keywords: [] as string[],
  seo_title: "",
  seo_description: "",
  status: "draft" as "draft" | "published" | "archived" | "out_of_stock",
  featured: false,
  related_product_ids: [] as string[],
  related_article_ids: [] as string[],
};

export function ProductEditor({ product, onClose, onSaved, onNavigate }: Props) {
  const save = useServerFn(upsertProduct);
  const upload = useServerFn(uploadAsset);
  const listProducts = useServerFn(listProductsLite);
  const listArticles = useServerFn(listArticlesLite);

  const [form, setForm] = useState<any>(product ? { ...empty, ...product } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    listProducts().then(setProducts).catch(() => {});
    listArticles().then(setArticles).catch(() => {});
  }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleImageUpload = async (file: File, target: "featured" | "gallery") => {
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const path = `${form.slug || "tmp"}/${Date.now()}-${file.name}`;
      const res = await upload({
        data: {
          bucket: "product-images",
          path,
          contentBase64: b64,
          contentType: file.type || "image/jpeg",
        },
      });
      if (target === "featured") set("featured_image", res.url);
      else set("gallery_images", [...(form.gallery_images ?? []), res.url]);
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setError(null);
    if (!form.name || !form.slug) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        price_usd: Number(form.price_usd ?? 0),
        compare_at_price: form.compare_at_price === "" || form.compare_at_price == null
          ? null
          : Number(form.compare_at_price),
        inventory_count: Number(form.inventory_count ?? 0),
        low_stock_threshold: Number(form.low_stock_threshold ?? 5),
      };
      // strip empty strings on nullable text fields
      ["category", "short_description", "full_description", "molecular_class",
        "storage_guidance", "featured_image", "purity", "endotoxin",
        "seo_title", "seo_description"].forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });
      if (!product) delete payload.id;
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
              {product ? "Edit product" : "New product"}
            </div>
            <h2 className="mt-1 text-[16px] font-medium tracking-tight">{form.name || "Untitled"}</h2>
          </div>
          <div className="flex gap-2">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {error && (
            <div className="border border-red-700/30 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</div>
          )}

          <Section title="Identity">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <TextInput
                  value={form.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!product && !form.slug) set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Slug">
                <TextInput value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
              </Field>
              <Field label="Category">
                <TextInput value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} />
              </Field>
              <Field label="Molecular class">
                <TextInput value={form.molecular_class ?? ""} onChange={(e) => set("molecular_class", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Descriptions">
            <Field label="Short description">
              <TextArea
                value={form.short_description ?? ""}
                onChange={(e) => set("short_description", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Full description">
              <TextArea
                value={form.full_description ?? ""}
                onChange={(e) => set("full_description", e.target.value)}
                rows={8}
              />
            </Field>
          </Section>

          <Section title="Media">
            <Field label="Featured image">
              <div className="flex items-center gap-3">
                {form.featured_image && (
                  <img src={form.featured_image} alt="" className="w-14 h-14 object-cover border border-ink/10" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "featured")}
                  className="text-[12px]"
                />
                {form.featured_image && (
                  <GhostButton onClick={() => set("featured_image", "")}>Remove</GhostButton>
                )}
              </div>
            </Field>
            <Field label="Gallery">
              <div className="flex flex-wrap gap-2">
                {(form.gallery_images ?? []).map((url: string, i: number) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-14 h-14 object-cover border border-ink/10" />
                    <button
                      type="button"
                      onClick={() => set("gallery_images", form.gallery_images.filter((_: string, j: number) => j !== i))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-ink text-background text-[10px] leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "gallery")}
                  className="text-[12px]"
                />
              </div>
            </Field>
          </Section>

          <Section title="Pricing & Inventory">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (USD)">
                <TextInput
                  type="number"
                  step="0.01"
                  value={form.price_usd ?? 0}
                  onChange={(e) => set("price_usd", e.target.value)}
                />
              </Field>
              <Field label="Compare-at price">
                <TextInput
                  type="number"
                  step="0.01"
                  value={form.compare_at_price ?? ""}
                  onChange={(e) => set("compare_at_price", e.target.value)}
                />
              </Field>
              <Field label="Inventory count">
                <TextInput
                  type="number"
                  value={form.inventory_count ?? 0}
                  onChange={(e) => set("inventory_count", e.target.value)}
                />
              </Field>
              <Field label="Low-stock threshold">
                <TextInput
                  type="number"
                  value={form.low_stock_threshold ?? 5}
                  onChange={(e) => set("low_stock_threshold", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Specifications">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purity">
                <TextInput value={form.purity ?? ""} onChange={(e) => set("purity", e.target.value)} />
              </Field>
              <Field label="Endotoxin">
                <TextInput value={form.endotoxin ?? ""} onChange={(e) => set("endotoxin", e.target.value)} />
              </Field>
              <Field label="Storage guidance">
                <TextInput value={form.storage_guidance ?? ""} onChange={(e) => set("storage_guidance", e.target.value)} />
              </Field>
              <Field label="Lyophilized">
                <SelectInput
                  value={form.lyophilized ? "yes" : "no"}
                  onChange={(e) => set("lyophilized", e.target.value === "yes")}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </SelectInput>
              </Field>
            </div>
          </Section>

          <Section title="Tags & SEO">
            <Field label="Tags (comma separated)">
              <TextInput
                value={(form.tags ?? []).join(", ")}
                onChange={(e) =>
                  set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SEO title">
                <TextInput value={form.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} />
              </Field>
              <Field label="SEO description">
                <TextInput value={form.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} />
              </Field>
            </div>
            <Field label="Meta keywords (comma separated)">
              <TextInput
                value={(form.meta_keywords ?? []).join(", ")}
                onChange={(e) =>
                  set("meta_keywords", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                }
              />
            </Field>
          </Section>

          <Section title="Related">
            <Field label="Related products">
              <MultiPicker
                options={products.filter((p) => p.id !== form.id).map((p) => ({ id: p.id, label: p.name }))}
                value={form.related_product_ids ?? []}
                onChange={(v) => set("related_product_ids", v)}
              />
            </Field>
            <Field label="Related articles">
              <MultiPicker
                options={articles.map((a) => ({ id: a.id, label: a.title }))}
                value={form.related_article_ids ?? []}
                onChange={(v) => set("related_article_ids", v)}
              />
            </Field>
          </Section>

          <Section title="Visibility">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <SelectInput value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="archived">Archived</option>
                </SelectInput>
              </Field>
              <Field label="Featured">
                <SelectInput
                  value={form.featured ? "yes" : "no"}
                  onChange={(e) => set("featured", e.target.value === "yes")}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </SelectInput>
              </Field>
            </div>
          </Section>

          {product?.id && (
            <>
              <Section title="Linked records">
                <ProductRelatedLinks productId={product.id} onNavigate={onNavigate} />
              </Section>
              <Section title="Operational notes">
                <InternalNotes entityType="product" entityId={product.id} />
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="text-[9.5px] tracking-[0.28em] uppercase text-foreground/55 border-b border-ink/10 pb-2">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function MultiPicker({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  if (!options.length) {
    return <div className="text-[12px] text-foreground/50">None available.</div>;
  }
  return (
    <div className="max-h-40 overflow-y-auto border border-ink/10 divide-y divide-ink/5">
      {options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 px-3 py-1.5 text-[12.5px] hover:bg-mist/30 cursor-pointer">
          <input
            type="checkbox"
            checked={value.includes(o.id)}
            onChange={() => toggle(o.id)}
          />
          <span className="truncate">{o.label}</span>
        </label>
      ))}
    </div>
  );
}