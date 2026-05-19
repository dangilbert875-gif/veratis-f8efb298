import vialMaster from "@/assets/vial-master.jpg";

export type Product = {
  slug: string;
  name: string;           // EXACT label name
  dosage: string;         // e.g. "12mg", "10,000 IU", "10mg/10mg"
  category: string;
  size: string;           // long-form, e.g. "12 mg vial"
  price: number;
  purity: string;
  image: string;          // master vial (label rendered as overlay)
  short: string;
  description: string;
  inStock?: boolean;
  classification?: string;
  lot: string;
};

export const products: Product[] = [
  // Tissue Recovery
  {
    slug: "bpc-157-12mg",
    name: "BPC-157 12mg VIAL",
    dosage: "12MG",
    category: "Tissue Recovery",
    classification: "15-amino acid synthetic peptide",
    size: "12 mg vial",
    price: 95,
    purity: "99.4%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2612",
    short: "Body Protection Compound, 12 mg lyophilized.",
    description:
      "A 15-amino acid synthetic peptide studied in research models for tissue repair and gastrointestinal protective pathways. Released only after independent HPLC and ESI-MS verification.",
  },
  {
    slug: "bpc-tb-500-blend",
    name: "BPC-157 / TB-500 10mg/10mg VIAL",
    dosage: "10MG / 10MG",
    category: "Tissue Recovery",
    classification: "Dual-compound recovery blend",
    size: "10 mg / 10 mg vial",
    price: 175,
    purity: "99.2%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2611",
    short: "Combined BPC-157 + TB-500 lyophilized blend.",
    description:
      "A pre-formulated lyophilized combination of BPC-157 and TB-500 supplied in a single nitrogen-sealed research vial. Each lot is verified for identity and purity by an independent ISO 17025 laboratory.",
  },
  {
    slug: "tb-500-fragment-12mg",
    name: "TB-500 12mg VIAL",
    dosage: "12MG",
    category: "Tissue Recovery",
    classification: "Thymosin Beta-4 active fragment",
    size: "12 mg vial",
    price: 120,
    purity: "99.1%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2610",
    short: "Active fragment of Thymosin Beta-4.",
    description:
      "The synthetic active fragment of Thymosin Beta-4 commonly referenced as TB-500. Manufactured under cGMP and released under independent HPLC and ESI-MS verification.",
  },
  {
    slug: "tb-4-full-sequence-10mg",
    name: "TB-4 (Full Sequence) 10mg VIAL",
    dosage: "10MG",
    category: "Tissue Recovery",
    classification: "Thymosin Beta-4 full 43-aa sequence",
    size: "10 mg vial",
    price: 155,
    purity: "99.0%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2609",
    short: "Full 43-amino acid Thymosin Beta-4.",
    description:
      "The complete 43-amino acid Thymosin Beta-4 polypeptide, supplied lyophilized for in-vitro tissue-recovery and cellular research.",
  },

  // Regenerative
  {
    slug: "ghk-cu-100mg",
    name: "GHK-CU 100mg VIAL",
    dosage: "100MG",
    category: "Regenerative",
    classification: "Copper-binding tripeptide",
    size: "100 mg vial",
    price: 95,
    purity: "99.6%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2608",
    short: "Copper tripeptide, 100 mg research format.",
    description:
      "A naturally occurring copper-binding tripeptide investigated for extracellular matrix remodeling and regenerative pathways. Lyophilized, nitrogen-sealed.",
  },
  {
    slug: "ghk-cu-50mg",
    name: "GHK-CU 50mg VIAL",
    dosage: "50MG",
    category: "Regenerative",
    classification: "Copper-binding tripeptide",
    size: "50 mg vial",
    price: 65,
    purity: "99.6%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2607",
    short: "Copper tripeptide, 50 mg research format.",
    description:
      "Half-format research vial of GHK-Cu for shorter studies. Independently verified for identity, copper coordination, and HPLC purity.",
  },
  {
    slug: "glow-70",
    name: "Glow 70 VIAL",
    dosage: "70MG",
    category: "Regenerative",
    classification: "Tri-compound regenerative blend",
    size: "70 mg vial",
    price: 180,
    purity: "99.2%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2606",
    short: "Tri-compound regenerative research blend.",
    description:
      "A combined lyophilized research formulation supplied as a single nitrogen-sealed vial for combination-protocol studies in regenerative and dermal pathways.",
  },

  // Growth Hormone Research
  {
    slug: "ghrp-6-10mg",
    name: "GHRP-6 10mg VIAL",
    dosage: "10MG",
    category: "Growth Hormone",
    classification: "GH-releasing hexapeptide",
    size: "10 mg vial",
    price: 60,
    purity: "99.3%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2605",
    short: "Growth-hormone-releasing hexapeptide.",
    description:
      "A synthetic hexapeptide investigated in growth-hormone signaling and appetite-regulation research. Lyophilized and lot-verified.",
  },
  {
    slug: "ipamorelin-10mg",
    name: "Ipamorelin 10mg VIAL",
    dosage: "10MG",
    category: "Growth Hormone",
    classification: "Selective GH-releasing pentapeptide",
    size: "10 mg vial",
    price: 75,
    purity: "99.5%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2604",
    short: "Selective GH-releasing pentapeptide.",
    description:
      "A selective synthetic pentapeptide studied in growth-hormone signaling research. Sealed vials with sterile rubber stopper and aluminum crimp.",
  },

  // Hormonal
  {
    slug: "hcg-10000-iu",
    name: "HCG 10,000 IU VIAL",
    dosage: "10,000 IU",
    category: "Hormonal",
    classification: "Human chorionic gonadotropin",
    size: "10,000 IU vial",
    price: 180,
    purity: "99.0%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2603",
    short: "Glycoprotein hormone, 10,000 IU format.",
    description:
      "Lyophilized human chorionic gonadotropin supplied for in-vitro endocrine research. Released only after independent identity and potency verification.",
  },
  {
    slug: "hcg-5000-iu",
    name: "HCG 5,000 IU VIAL",
    dosage: "5,000 IU",
    category: "Hormonal",
    classification: "Human chorionic gonadotropin",
    size: "5,000 IU vial",
    price: 100,
    purity: "99.0%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2602",
    short: "Glycoprotein hormone, 5,000 IU format.",
    description:
      "Smaller-format research vial of lyophilized HCG. Each lot is independently verified for identity and supplied with a signed certificate of analysis.",
  },

  // Pigmentation
  {
    slug: "melanotan-2-10mg",
    name: "Melanotan-2 10mg VIAL",
    dosage: "10MG",
    category: "Pigmentation",
    classification: "Cyclic α-MSH analogue",
    size: "10 mg vial",
    price: 60,
    purity: "99.1%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2601",
    short: "Cyclic α-MSH analogue, lyophilized.",
    description:
      "A synthetic cyclic analogue of the peptide hormone α-MSH supplied for in-vitro melanocortin-receptor research.",
  },

  // Mitochondrial
  {
    slug: "mots-c-10mg",
    name: "MOTS-C 10mg VIAL",
    dosage: "10MG",
    category: "Mitochondrial",
    classification: "Mitochondrial-derived peptide",
    size: "10 mg vial",
    price: 130,
    purity: "99.1%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2600",
    short: "Mitochondrial signaling peptide.",
    description:
      "A 16-amino acid peptide encoded within the mitochondrial genome, studied for metabolic homeostasis and aging-pathway research.",
  },
  {
    slug: "ss-31-10mg",
    name: "SS-31 10mg VIAL",
    dosage: "10MG",
    category: "Mitochondrial",
    classification: "Mitochondria-targeted tetrapeptide",
    size: "10 mg vial",
    price: 150,
    purity: "99.2%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2599",
    short: "Cardiolipin-targeted tetrapeptide.",
    description:
      "A mitochondria-targeted aromatic-cationic tetrapeptide that selectively associates with cardiolipin, studied in inner-membrane stability and bioenergetic research.",
  },

  // Metabolic Research
  {
    slug: "retatrutide-12mg",
    name: "Retatrutide 12mg VIAL",
    dosage: "12MG",
    category: "Metabolic",
    classification: "GLP-1 / GIP / glucagon triple-agonist",
    size: "12 mg vial",
    price: 165,
    purity: "99.3%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2598",
    short: "Triple-agonist metabolic analogue.",
    description:
      "A research-grade triple-receptor agonist (GLP-1 / GIP / glucagon) supplied for in-vitro studies in incretin signaling and glucose homeostasis.",
  },
  {
    slug: "retatrutide-30mg",
    name: "Retatrutide 30mg VIAL",
    dosage: "30MG",
    category: "Metabolic",
    classification: "GLP-1 / GIP / glucagon triple-agonist",
    size: "30 mg vial",
    price: 360,
    purity: "99.3%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2597",
    short: "Extended-format triple-agonist vial.",
    description:
      "Larger-format research vial of Retatrutide for extended in-vitro metabolic-pathway protocols. Each lot is independently HPLC and mass-spec verified.",
  },
  {
    slug: "retatrutide-60mg",
    name: "Retatrutide 60mg VIAL",
    dosage: "60MG",
    category: "Metabolic",
    classification: "GLP-1 / GIP / glucagon triple-agonist",
    size: "60 mg vial",
    price: 680,
    purity: "99.3%",
    image: vialMaster,
    inStock: false,
    lot: "PP-2596",
    short: "Bulk research format triple-agonist vial.",
    description:
      "Bulk-format research vial of Retatrutide. Supplied under nitrogen seal with full lot documentation and independent verification.",
  },
  {
    slug: "semaglutide-5mg",
    name: "Semaglutide 5mg VIAL",
    dosage: "5MG",
    category: "Metabolic",
    classification: "GLP-1 receptor analogue",
    size: "5 mg vial",
    price: 110,
    purity: "99.3%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2595",
    short: "GLP-1 receptor analogue, 5 mg format.",
    description:
      "Research-grade semaglutide supplied as a lyophilized cake for in-vitro studies in GLP-1 receptor signaling.",
  },
  {
    slug: "semaglutide-10mg",
    name: "Semaglutide 10mg VIAL",
    dosage: "10MG",
    category: "Metabolic",
    classification: "GLP-1 receptor analogue",
    size: "10 mg vial",
    price: 195,
    purity: "99.3%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2594",
    short: "GLP-1 receptor analogue, 10 mg format.",
    description:
      "Extended-format research vial of semaglutide for longer-duration in-vitro incretin-pathway studies.",
  },
  {
    slug: "tirzepatide-10mg",
    name: "Tirzepatide 10mg VIAL",
    dosage: "10MG",
    category: "Metabolic",
    classification: "GIP / GLP-1 dual-agonist analogue",
    size: "10 mg vial",
    price: 175,
    purity: "99.2%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2593",
    short: "Dual incretin receptor analogue.",
    description:
      "A research-grade GIP / GLP-1 dual-agonist supplied for in-vitro incretin and glucose-homeostasis research. Released after independent verification.",
  },
  {
    slug: "tirzepatide-30mg",
    name: "Tirzepatide 30mg VIAL",
    dosage: "30MG",
    category: "Metabolic",
    classification: "GIP / GLP-1 dual-agonist analogue",
    size: "30 mg vial",
    price: 460,
    purity: "99.2%",
    image: vialMaster,
    inStock: true,
    lot: "PP-2592",
    short: "Extended-format dual-agonist vial.",
    description:
      "Larger-format research vial of tirzepatide. Supplied lyophilized under nitrogen with a signed independent certificate of analysis.",
  },
];

const categoryNames = Array.from(new Set(products.map((p) => p.category)));
export const categories = categoryNames.map((name) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  count: products.filter((p) => p.category === name).length,
}));
