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
};

export const labPartner = {
  name: "Northbridge Analytical",
  iso: "ISO/IEC 17025:2017",
  accreditation: "A2LA Cert. #4128.01",
  city: "Boston, MA",
};

export const batches: Batch[] = [
  { lot: "PP-2426", product: "BPC-157",      slug: "bpc-157",      size: "5 mg",  purity: 99.42, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.8%", appearance: "White lyophilized cake", testedOn: "2026-05-04", expiresOn: "2028-05-04", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2419", product: "TB-500",       slug: "tb-500",       size: "5 mg",  purity: 99.18, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "2.1%", appearance: "White lyophilized cake", testedOn: "2026-04-21", expiresOn: "2028-04-21", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2411", product: "GHK-Cu",       slug: "ghk-cu",       size: "50 mg", purity: 99.61, identity: "Confirmed", endotoxin: "< 0.25 EU/mg", water: "1.4%", appearance: "Blue lyophilized powder", testedOn: "2026-04-09", expiresOn: "2028-04-09", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2403", product: "Epitalon",     slug: "epitalon",     size: "10 mg", purity: 99.27, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.9%", appearance: "White lyophilized cake", testedOn: "2026-03-28", expiresOn: "2028-03-28", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2398", product: "Ipamorelin",   slug: "ipamorelin",   size: "5 mg",  purity: 99.55, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.6%", appearance: "White lyophilized cake", testedOn: "2026-03-14", expiresOn: "2028-03-14", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2391", product: "Semax",        slug: "semax",        size: "30 mg", purity: 99.03, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "2.3%", appearance: "White lyophilized cake", testedOn: "2026-03-02", expiresOn: "2028-03-02", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2384", product: "Selank",       slug: "selank",       size: "10 mg", purity: 99.31, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.7%", appearance: "White lyophilized cake", testedOn: "2026-02-19", expiresOn: "2028-02-19", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2377", product: "Melanotan II", slug: "melanotan-ii", size: "10 mg", purity: 99.12, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "2.0%", appearance: "Off-white lyophilized cake", testedOn: "2026-02-05", expiresOn: "2028-02-05", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2370", product: "BPC-157",      slug: "bpc-157",      size: "5 mg",  purity: 99.38, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.9%", appearance: "White lyophilized cake", testedOn: "2026-01-22", expiresOn: "2028-01-22", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2362", product: "TB-500",       slug: "tb-500",       size: "5 mg",  purity: 99.24, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "2.0%", appearance: "White lyophilized cake", testedOn: "2026-01-08", expiresOn: "2028-01-08", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2354", product: "GHK-Cu",       slug: "ghk-cu",       size: "50 mg", purity: 99.58, identity: "Confirmed", endotoxin: "< 0.25 EU/mg", water: "1.5%", appearance: "Blue lyophilized powder", testedOn: "2025-12-18", expiresOn: "2027-12-18", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2346", product: "Ipamorelin",   slug: "ipamorelin",   size: "5 mg",  purity: 99.49, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.7%", appearance: "White lyophilized cake", testedOn: "2025-12-04", expiresOn: "2027-12-04", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2440", product: "Sermorelin",          slug: "sermorelin",          size: "10 mg",      purity: 99.21, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.8%", appearance: "White lyophilized cake", testedOn: "2026-05-09", expiresOn: "2028-05-09", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2438", product: "CJC-1295 (No DAC)",   slug: "cjc-1295-no-dac",     size: "5 mg",       purity: 99.13, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.9%", appearance: "White lyophilized cake", testedOn: "2026-05-07", expiresOn: "2028-05-07", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2435", product: "AOD-9604",            slug: "aod-9604",            size: "10 mg",      purity: 99.04, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "2.0%", appearance: "White lyophilized cake", testedOn: "2026-05-02", expiresOn: "2028-05-02", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2433", product: "GLP-1 S",             slug: "glp-1-s-10mg",        size: "10 mg",      purity: 99.31, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.7%", appearance: "White lyophilized cake", testedOn: "2026-04-29", expiresOn: "2028-04-29", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2432", product: "GLP-1 S",             slug: "glp-1-s-5mg",         size: "5 mg",       purity: 99.28, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.7%", appearance: "White lyophilized cake", testedOn: "2026-04-28", expiresOn: "2028-04-28", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2429", product: "GLP-2 TZ",            slug: "glp-2-tz-10mg",       size: "10 mg",      purity: 99.12, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.9%", appearance: "White lyophilized cake", testedOn: "2026-04-24", expiresOn: "2028-04-24", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2428", product: "GLP-2 TZ",            slug: "glp-2-tz-30mg",       size: "30 mg",      purity: 99.10, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.9%", appearance: "White lyophilized cake", testedOn: "2026-04-23", expiresOn: "2028-04-23", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: false, notes: "Awaiting final release" },
  { lot: "PP-2425", product: "GLP-3 R",             slug: "glp-3-r-10mg",        size: "10 mg",      purity: 99.06, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "2.0%", appearance: "White lyophilized cake", testedOn: "2026-04-20", expiresOn: "2028-04-20", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2422", product: "NAD+",                slug: "nad-plus",            size: "1000 mg",    purity: 99.02, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.5%", appearance: "White lyophilized powder", testedOn: "2026-04-17", expiresOn: "2028-04-17", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2418", product: "MOTS-C",              slug: "mots-c",              size: "10 mg",      purity: 99.14, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.8%", appearance: "White lyophilized cake", testedOn: "2026-04-12", expiresOn: "2028-04-12", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2415", product: "DSIP",                slug: "dsip",                size: "5 mg",       purity: 99.05, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "2.1%", appearance: "White lyophilized cake", testedOn: "2026-04-08", expiresOn: "2028-04-08", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2412", product: "BPC-157 / TB-500",    slug: "bpc-157-tb-500",      size: "10 / 10 mg", purity: 99.22, identity: "Confirmed", endotoxin: "< 0.5 EU/mg",  water: "1.9%", appearance: "White lyophilized cake", testedOn: "2026-04-04", expiresOn: "2028-04-04", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2409", product: "GLOW Blend",          slug: "glow-blend",          size: "10/10/50 mg", purity: 99.18, identity: "Confirmed", endotoxin: "< 0.5 EU/mg", water: "1.8%", appearance: "Pale blue lyophilized cake", testedOn: "2026-04-01", expiresOn: "2028-04-01", lab: labPartner.name, method: "RP-HPLC / ESI-MS", released: true },
  { lot: "PP-2406", product: "Bacteriostatic Water", slug: "bac-water-10ml",     size: "10 mL",      purity: 100,  identity: "Confirmed", endotoxin: "< 0.25 EU/mL", water: "—",   appearance: "Clear sterile solution", testedOn: "2026-03-30", expiresOn: "2028-03-30", lab: labPartner.name, method: "USP <797>", released: true },
  { lot: "PP-2405", product: "Bacteriostatic Water", slug: "bac-water-3ml",      size: "3 mL",       purity: 100,  identity: "Confirmed", endotoxin: "< 0.25 EU/mL", water: "—",   appearance: "Clear sterile solution", testedOn: "2026-03-30", expiresOn: "2028-03-30", lab: labPartner.name, method: "USP <797>", released: true },
  { lot: "PP-2404", product: "Acetic Acid",         slug: "acetic-acid-3ml",     size: "3 mL",       purity: 100,  identity: "Confirmed", endotoxin: "—",            water: "—",   appearance: "Clear sterile solution", testedOn: "2026-03-29", expiresOn: "2028-03-29", lab: labPartner.name, method: "USP <797>", released: true },
];

export function findBatch(lot: string): Batch | undefined {
  const q = lot.trim().toUpperCase().replace(/\s+/g, "");
  if (!q) return undefined;
  return batches.find((b) => b.lot.toUpperCase() === q);
}

export const SAMPLE_LOT = "PP-2426";
