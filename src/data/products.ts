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
};

export const products: Product[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    category: "Tissue Recovery",
    size: "5 mg",
    price: 49,
    purity: "99.4%",
    image: p1,
    short: "Body Protection Compound, lyophilized.",
    description:
      "A 15-amino acid synthetic peptide widely studied in research settings for tissue repair pathways. Each vial is lyophilized, sealed under nitrogen, and accompanied by a batch-specific certificate of analysis.",
  },
  {
    slug: "tb-500",
    name: "TB-500",
    category: "Tissue Recovery",
    size: "5 mg",
    price: 64,
    purity: "99.1%",
    image: p2,
    short: "Thymosin Beta-4 fragment.",
    description:
      "A synthetic version of the naturally occurring Thymosin Beta-4 peptide. Manufactured in cGMP facilities and verified by independent HPLC and mass spectrometry analysis.",
  },
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    category: "Cellular Longevity",
    size: "50 mg",
    price: 39,
    purity: "99.6%",
    image: p3,
    short: "Copper tripeptide, research grade.",
    description:
      "A naturally occurring copper-binding tripeptide studied for its role in extracellular matrix remodeling. Supplied as a stable lyophilized powder.",
  },
  {
    slug: "epitalon",
    name: "Epitalon",
    category: "Cellular Longevity",
    size: "10 mg",
    price: 42,
    purity: "99.2%",
    image: p4,
    short: "Tetrapeptide, lyophilized.",
    description:
      "A synthetic tetrapeptide produced for research applications. Tested by an independent ISO 17025 lab and shipped with batch documentation.",
  },
  {
    slug: "semax",
    name: "Semax",
    category: "Neuro Research",
    size: "30 mg",
    price: 55,
    purity: "99.0%",
    image: p1,
    short: "Heptapeptide derivative.",
    description:
      "A synthetic analogue of a fragment of adrenocorticotropic hormone. Provided for in-vitro and laboratory research use only.",
  },
  {
    slug: "selank",
    name: "Selank",
    category: "Neuro Research",
    size: "10 mg",
    price: 48,
    purity: "99.3%",
    image: p2,
    short: "Synthetic heptapeptide.",
    description:
      "A synthetic anxiolytic peptide developed for laboratory research. Each batch is COA-verified and stored at –20 °C until dispatch.",
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    category: "Performance Research",
    size: "5 mg",
    price: 52,
    purity: "99.5%",
    image: p3,
    short: "Pentapeptide, lyophilized.",
    description:
      "A selective synthetic pentapeptide investigated in growth-hormone signaling research. Sealed vials, sterile rubber stopper, aluminum crimp.",
  },
  {
    slug: "melanotan-ii",
    name: "Melanotan II",
    category: "Cellular Longevity",
    size: "10 mg",
    price: 36,
    purity: "99.1%",
    image: p4,
    short: "Cyclic heptapeptide analog.",
    description:
      "A synthetic analogue of the peptide hormone α-MSH supplied for research. Each lot is verified for identity and purity.",
  },
];

export const categories = [
  { name: "Tissue Recovery", slug: "tissue-recovery", count: 6 },
  { name: "Performance Research", slug: "performance-research", count: 5 },
  { name: "Neuro Research", slug: "neuro-research", count: 4 },
  { name: "Cellular Longevity", slug: "cellular-longevity", count: 7 },
  { name: "Metabolic Support", slug: "metabolic-support", count: 3 },
  { name: "Longevity Protocols", slug: "longevity-protocols", count: 8 },
];