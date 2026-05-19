import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  size: string;
  price: number;
  purity: string;
  image: string;
  short: string;
  description: string;
  inStock?: boolean;
  classification?: string;
};

const images = [p1, p2, p3, p4];
const img = (i: number) => images[i % images.length];

export const products: Product[] = [
  // Tissue Recovery
  { slug: "bpc-157", name: "BPC-157", category: "Tissue Recovery", classification: "15-amino acid synthetic peptide", size: "10 mg", price: 70, purity: "99.4%", image: img(0), inStock: true, short: "Body Protection Compound, lyophilized.", description: "A 15-amino acid synthetic peptide widely studied in research settings for tissue repair and gastrointestinal protective pathways. Manufactured under cGMP and verified by independent HPLC and ESI-MS." },
  { slug: "tb-500", name: "TB-500", category: "Tissue Recovery", classification: "Thymosin Beta-4 fragment", size: "10 mg", price: 90, purity: "99.1%", image: img(1), inStock: true, short: "Thymosin Beta-4 fragment.", description: "A synthetic fragment of the naturally occurring Thymosin Beta-4 peptide. Each lot is released under independent HPLC and mass-spectrometry verification." },
  { slug: "bpc-157-tb-500", name: "BPC-157 / TB-500", category: "Stacks & Protocols", classification: "Combined recovery stack", size: "10 / 10 mg", price: 170, purity: "99.2%", image: img(2), inStock: false, short: "Dual-compound recovery stack.", description: "A pre-formulated combination of BPC-157 and TB-500 supplied in a single lyophilized vial. Provided for in-vitro tissue-recovery research." },

  // Cellular Longevity
  { slug: "ghk-cu", name: "GHK-Cu", category: "Cellular Longevity", classification: "Copper-binding tripeptide", size: "100 mg", price: 70, purity: "99.6%", image: img(2), inStock: true, short: "Copper tripeptide, research grade.", description: "A naturally occurring copper-binding tripeptide investigated for its role in extracellular matrix remodeling and cellular regeneration." },
  { slug: "epitalon", name: "Epitalon", category: "Cellular Longevity", classification: "Synthetic tetrapeptide", size: "10 mg", price: 60, purity: "99.2%", image: img(3), inStock: true, short: "Tetrapeptide, lyophilized.", description: "A synthetic tetrapeptide produced for research applications in cellular senescence and telomere-pathway studies." },
  { slug: "nad-plus", name: "NAD+", category: "Cellular Longevity", classification: "Nicotinamide adenine dinucleotide", size: "1000 mg", price: 140, purity: "99.0%", image: img(0), inStock: false, short: "Coenzyme research substrate.", description: "Lyophilized NAD+ supplied for in-vitro cellular energy and longevity research." },
  { slug: "mots-c", name: "MOTS-C", category: "Cellular Longevity", classification: "Mitochondrial-derived peptide", size: "10 mg", price: 110, purity: "99.1%", image: img(1), inStock: false, short: "Mitochondrial signaling peptide.", description: "A 16-amino acid peptide encoded within the mitochondrial genome, studied for metabolic homeostasis and aging-pathway research." },

  // Neuro Research
  { slug: "semax", name: "Semax", category: "Neuro Research", classification: "ACTH(4-10) analogue", size: "30 mg", price: 95, purity: "99.0%", image: img(0), inStock: true, short: "Heptapeptide derivative.", description: "A synthetic analogue of a fragment of adrenocorticotropic hormone, studied in neurotrophic and cognitive research models." },
  { slug: "selank", name: "Selank", category: "Neuro Research", classification: "Synthetic heptapeptide", size: "10 mg", price: 75, purity: "99.3%", image: img(1), inStock: true, short: "Synthetic heptapeptide.", description: "A synthetic anxiolytic peptide developed for laboratory neurochemistry research. Each lot is COA-verified and cold-chain dispatched." },
  { slug: "dsip", name: "DSIP", category: "Neuro Research", classification: "Delta sleep-inducing peptide", size: "5 mg", price: 60, purity: "99.0%", image: img(2), inStock: false, short: "Nonapeptide, lyophilized.", description: "Delta Sleep-Inducing Peptide, a nonapeptide investigated in sleep architecture and neuroendocrine research." },

  // Performance Research
  { slug: "ipamorelin", name: "Ipamorelin", category: "Performance Research", classification: "Selective GH-releasing pentapeptide", size: "10 mg", price: 70, purity: "99.5%", image: img(3), inStock: true, short: "Pentapeptide, lyophilized.", description: "A selective synthetic pentapeptide studied in growth-hormone signaling research. Sealed vials with sterile rubber stopper and aluminum crimp." },
  { slug: "sermorelin", name: "Sermorelin", category: "Performance Research", classification: "GHRH (1-29) analogue", size: "10 mg", price: 85, purity: "99.2%", image: img(0), inStock: true, short: "GHRH analogue.", description: "A synthetic 29-amino acid analogue of growth-hormone-releasing hormone, supplied as a lyophilized cake for endocrine research." },
  { slug: "cjc-1295-no-dac", name: "CJC-1295 (No DAC)", category: "Performance Research", classification: "Modified GRF (1-29)", size: "5 mg", price: 50, purity: "99.1%", image: img(1), inStock: true, short: "Modified GRF (1-29).", description: "A synthetic GHRH analogue without the Drug Affinity Complex (DAC) modification. Lyophilized and nitrogen-sealed." },
  { slug: "aod-9604", name: "AOD-9604", category: "Performance Research", classification: "hGH fragment 176-191", size: "10 mg", price: 90, purity: "99.0%", image: img(2), inStock: true, short: "Lipolytic GH fragment.", description: "A modified fragment of human growth hormone (residues 176-191), studied in adipose-tissue metabolism research." },

  // Metabolic Research
  { slug: "glp-1-s-10mg", name: "GLP-1 S", category: "Metabolic Research", classification: "GLP-1 receptor analogue", size: "10 mg", price: 128, purity: "99.3%", image: img(3), inStock: true, short: "GLP-1 receptor analogue.", description: "A research-grade GLP-1 receptor analogue supplied for in-vitro studies in incretin signaling and glucose homeostasis." },
  { slug: "glp-1-s-5mg", name: "GLP-1 S", category: "Metabolic Research", classification: "GLP-1 receptor analogue", size: "5 mg", price: 85, purity: "99.3%", image: img(0), inStock: true, short: "GLP-1 receptor analogue, smaller format.", description: "Half-size research format of the GLP-1 S compound for short-duration laboratory studies." },
  { slug: "glp-2-tz-10mg", name: "GLP-2 TZ", category: "Metabolic Research", classification: "GLP-2 receptor analogue", size: "10 mg", price: 100, purity: "99.1%", image: img(1), inStock: true, short: "GLP-2 receptor analogue.", description: "A research-grade GLP-2 receptor analogue investigated for intestinal-epithelial and nutrient-absorption pathways." },
  { slug: "glp-2-tz-30mg", name: "GLP-2 TZ", category: "Metabolic Research", classification: "GLP-2 receptor analogue", size: "30 mg", price: 240, purity: "99.1%", image: img(2), inStock: false, short: "Extended-format GLP-2 vial.", description: "Larger-format vial of the GLP-2 TZ compound for extended research protocols." },
  { slug: "glp-3-r-10mg", name: "GLP-3 R", category: "Metabolic Research", classification: "Triple-agonist analogue", size: "10 mg", price: 111, purity: "99.0%", image: img(3), inStock: true, short: "Triple-agonist analogue.", description: "A multi-receptor metabolic analogue supplied for advanced incretin-pathway research." },
  { slug: "melanotan-ii", name: "Melanotan II", category: "Metabolic Research", classification: "Cyclic heptapeptide α-MSH analog", size: "10 mg", price: 60, purity: "99.1%", image: img(0), inStock: false, short: "α-MSH analog, lyophilized.", description: "A synthetic analogue of the peptide hormone α-MSH supplied for melanocortin-receptor research." },

  // Research Essentials
  { slug: "bac-water-10ml", name: "Bacteriostatic Water", category: "Research Essentials", classification: "0.9% benzyl alcohol diluent", size: "10 mL", price: 18, purity: "USP", image: img(1), inStock: false, short: "Sterile diluent, 10 mL.", description: "USP-grade bacteriostatic water supplied as a reconstitution diluent for laboratory peptide research." },
  { slug: "bac-water-3ml", name: "Bacteriostatic Water", category: "Research Essentials", classification: "0.9% benzyl alcohol diluent", size: "3 mL", price: 12, purity: "USP", image: img(2), inStock: true, short: "Sterile diluent, 3 mL.", description: "Small-format USP-grade bacteriostatic water for short-duration reconstitution work." },
  { slug: "acetic-acid-3ml", name: "Acetic Acid", category: "Research Essentials", classification: "0.6% acetic acid diluent", size: "3 mL", price: 15, purity: "USP", image: img(3), inStock: true, short: "Reconstitution acid, 3 mL.", description: "Dilute acetic acid solution supplied as a reconstitution medium for peptides with low aqueous solubility." },

  // Stacks & Protocols
  { slug: "glow-blend", name: "GLOW Blend", category: "Stacks & Protocols", classification: "BPC-157 / TB-500 / GHK-Cu stack", size: "10 / 10 / 50 mg", price: 170, purity: "99.2%", image: img(0), inStock: true, short: "Tri-compound recovery + dermal stack.", description: "A combined lyophilized formulation of BPC-157, TB-500, and GHK-Cu supplied as a single research vial for combination-protocol studies." },
];

const categoryNames = Array.from(new Set(products.map((p) => p.category)));
export const categories = categoryNames.map((name) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  count: products.filter((p) => p.category === name).length,
}));