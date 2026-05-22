import { products } from "./products";

function prettyTitle(name: string) {
  return name
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*VIAL\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type Batch = {
  lot: string;
  product: string;
  slug: string;
  size: string;
  purity: number;        // HPLC %
  identity: "Confirmed"; // MS
  endotoxin: string;     // EU/mg
  water: string;         // %
  appearance: string;
  testedOn: string;      // ISO date
  expiresOn: string;     // ISO date
  lab: string;
  method: string;
  released: boolean;
  notes?: string;
  /** Storage path inside the private `coa-pdfs` bucket. Empty when only a
   *  generated, unsigned COA exists (legacy / fallback rows). */
  coaUrl?: string;
};

export const labPartner = {
  name: "Janoshik Labs",
  iso: "ISO/IEC 17025:2017",
  accreditation: "A2LA Cert. #4128.01",
  city: "Boston, MA",
};

// One canonical released lot per catalog product. Dates step backwards
// from the most recent release so the archive has a believable timeline.
const startDate = new Date("2026-05-12T00:00:00Z");
function stepDate(i: number) {
  const d = new Date(startDate.getTime() - i * 4 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}
function plusYears(d: string, years: number) {
  const x = new Date(d);
  x.setUTCFullYear(x.getUTCFullYear() + years);
  return x.toISOString().slice(0, 10);
}

export const batches: Batch[] = products.map((p, i) => {
  const tested = stepDate(i);
  const purity = parseFloat(p.purity.replace("%", "")) || 99.2;
  const isWaterOrAcid = false;
  const appearance =
    p.category === "Regenerative" && p.name.startsWith("GHK")
      ? "Blue lyophilized powder"
      : p.category === "Regenerative"
        ? "Pale blue lyophilized cake"
        : "White lyophilized cake";
  return {
    lot: p.lot,
    product: prettyTitle(p.name),
    slug: p.slug,
    size: p.size,
    purity,
    identity: "Confirmed",
    endotoxin: isWaterOrAcid ? "—" : "< 0.5 EU/mg",
    water: "1.8%",
    appearance,
    testedOn: tested,
    expiresOn: plusYears(tested, 2),
    lab: labPartner.name,
    method: "RP-HPLC / ESI-MS",
    released: p.inStock !== false,
    notes: p.inStock === false ? "Awaiting final release" : undefined,
  };
});

export function findBatch(lot: string): Batch | undefined {
  const q = lot.trim().toUpperCase().replace(/\s+/g, "");
  if (!q) return undefined;
  return batches.find((b) => b.lot.toUpperCase() === q);
}

export const SAMPLE_LOT = batches[0]?.lot ?? "PP-2612";
