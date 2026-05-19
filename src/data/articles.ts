import lab from "@/assets/lab.jpg";

export type ArticleCategory =
  | "HPLC Analysis"
  | "Storage & Stability"
  | "Lyophilization"
  | "Cold Chain Handling"
  | "Endotoxin Standards"
  | "Verification Systems"
  | "Mass Spectrometry"
  | "Laboratory Protocol"
  | "Compound Reference";

export type ArticleSection =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "quote"; text: string; cite?: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "definition"; term: string; body: string }
  | { kind: "figure"; figure: "chromatogram" | "peptide" | "timeline"; caption?: string };

export type Article = {
  slug: string;
  title: string;
  deck: string;            // 1–2 sentence dek
  category: ArticleCategory;
  readMinutes: number;
  publishedOn: string;     // ISO
  updatedOn: string;       // ISO
  author: string;
  reviewedBy?: string;     // e.g. "VERATIS Analytical"
  revision?: string;       // e.g. "1.3"
  image: string;
  featured?: boolean;
  mostReferenced?: boolean;
  recentlyUpdated?: boolean;
  featuredMethod?: boolean;
  pullQuote?: string;
  relatedCompounds?: string[]; // product slugs
  archiveLots?: string[];      // batch lots
  references: string[];
  faq?: { q: string; a: string }[];
  body: ArticleSection[];
};

export const categories: ArticleCategory[] = [
  "HPLC Analysis",
  "Mass Spectrometry",
  "Lyophilization",
  "Storage & Stability",
  "Cold Chain Handling",
  "Endotoxin Standards",
  "Verification Systems",
  "Laboratory Protocol",
  "Compound Reference",
];

export const articles: Article[] = [
  {
    slug: "hplc-purity-readings",
    title: "Understanding HPLC purity readings",
    deck: "What 99.4% actually measures — and what it deliberately leaves out of the result.",
    category: "HPLC Analysis",
    readMinutes: 6,
    publishedOn: "2026-02-11",
    updatedOn: "2026-05-04",
    author: "Northbridge Analytical · Method group",
    reviewedBy: "VERATIS Analytical",
    revision: "1.4",
    image: lab,
    featured: true,
    mostReferenced: true,
    featuredMethod: true,
    pullQuote:
      "A purity number is a statement about what the detector saw at one wavelength — nothing more, nothing less.",
    relatedCompounds: ["bpc-157-12mg", "bpc-tb-500-blend"],
    archiveLots: ["PP-2612", "PP-2608"],
    references: [
      "ICH Q2(R2) — Validation of Analytical Procedures (2023).",
      "USP <621> Chromatography, United States Pharmacopeia.",
      "Snyder, Kirkland & Dolan, Introduction to Modern Liquid Chromatography, 3rd ed.",
    ],
    body: [
      { kind: "p", text: "Reverse-phase HPLC with UV detection is the working standard for peptide purity. The number printed on a certificate of analysis is the integrated area of the main peak divided by the total integrated area across the chromatogram, expressed as a percentage." },
      { kind: "figure", figure: "chromatogram", caption: "Representative RP-HPLC trace at 214 nm. Main peak integrated at Rt 12.84 min; satellite peaks visible at 8.3, 16.3, and 19.4 min are summed into the denominator of the purity calculation." },
      { kind: "definition", term: "Area-percent purity", body: "Integrated UV area of the main peak divided by the total integrated UV area between the void volume and the gradient wash, at a stated detection wavelength." },
      { kind: "h", text: "What the number includes" },
      { kind: "p", text: "Every UV-absorbing species eluting between the void volume and the gradient wash is counted toward total area. Truncations, deamidated isomers, oxidation products, residual scavengers — if it absorbs at the detection wavelength and elutes in the integration window, it appears in the denominator." },
      { kind: "quote", text: "A purity number is a statement about what the detector saw at one wavelength — nothing more, nothing less." },
      { kind: "h", text: "What it does not include" },
      { kind: "list", items: [
        "Counter-ions and residual salts (quantified separately by ion chromatography).",
        "Residual solvents (headspace GC).",
        "Water content (Karl Fischer titration).",
        "Endotoxin (LAL kinetic chromogenic).",
        "Bacterial bioburden (membrane filtration, plate count).",
      ]},
      { kind: "p", text: "This is why a single HPLC percentage, taken alone, is incomplete. A lot released against a published specification is released against the full panel — purity is one column of the table, not the table itself." },
      { kind: "h", text: "Reading the chromatogram" },
      { kind: "table", head: ["Field", "What it tells you"], rows: [
        ["Retention time", "Identity check vs. reference standard."],
        ["Peak symmetry", "Column condition, sample overload, secondary interactions."],
        ["Baseline", "Solvent quality, gradient stability, detector drift."],
        ["Wavelength", "What classes of impurity are visible. 214 nm sees the amide bond; 280 nm sees aromatic residues only."],
      ]},
      { kind: "p", text: "On every VERATIS lot the chromatogram is archived alongside the COA. Reviewing the trace, not just the number, is the difference between trusting a vendor and verifying one." },
    ],
  },
  {
    slug: "reading-a-coa",
    title: "Reading a certificate of analysis",
    deck: "Every section of a COA explained — and the red flags that justify refusing a lot.",
    category: "Verification Systems",
    readMinutes: 7,
    publishedOn: "2026-01-22",
    updatedOn: "2026-04-30",
    author: "VERATIS Standards desk",
    reviewedBy: "VERATIS Analytical",
    revision: "2.1",
    image: lab,
    mostReferenced: true,
    pullQuote: "A COA without a lot number is a marketing document, not a release record.",
    relatedCompounds: ["bpc-157-12mg"],
    archiveLots: ["PP-2612"],
    references: [
      "ISO/IEC 17025:2017 — General requirements for the competence of testing and calibration laboratories.",
      "WHO Technical Report Series No. 957, Annex 3.",
    ],
    body: [
      { kind: "p", text: "A certificate of analysis is the formal release record for a single, finite quantity of material. Every field on it exists to make the lot reproducible, refusable, and traceable years after it has shipped." },
      { kind: "h", text: "The minimum responsible fields" },
      { kind: "list", items: [
        "Product name, internal code, and molecular formula.",
        "Lot number — unique, never reused, never recycled across batches.",
        "Date of manufacture and date of release (these are not the same date).",
        "Identity result with method (e.g. ESI-MS, observed vs. theoretical mass).",
        "Purity result with method, column, wavelength, and gradient summary.",
        "Endotoxin result with method and specification limit.",
        "Water content, appearance, and storage condition.",
        "Two analyst signatures, accreditation number of the testing laboratory.",
      ]},
      { kind: "quote", text: "A COA without a lot number is a marketing document, not a release record." },
      { kind: "h", text: "Red flags" },
      { kind: "list", items: [
        "The same COA appears across multiple lots or shipments.",
        "No laboratory name, no accreditation number, no signature.",
        "Method is described only as “HPLC” with no column, wavelength, or gradient.",
        "Specification limits are absent — only results, with nothing to fail against.",
        "Release date predates manufacture date, or expiry exceeds compound stability data.",
      ]},
      { kind: "p", text: "Every VERATIS certificate is signed against a published specification, archived permanently, and resolvable by lot number from any device. If a lot does not resolve, the vial was not produced here." },
    ],
  },
  {
    slug: "mass-spec-identity",
    title: "Mass spectrometry for peptide identity",
    deck: "How ESI-MS confirms that the molecule in the vial matches the molecule on the label.",
    category: "Mass Spectrometry",
    readMinutes: 9,
    publishedOn: "2026-03-04",
    updatedOn: "2026-05-10",
    author: "Northbridge Analytical · MS group",
    reviewedBy: "VERATIS Analytical",
    revision: "1.2",
    image: lab,
    featuredMethod: true,
    pullQuote: "Purity tells you how much. Mass spec tells you what.",
    relatedCompounds: ["bpc-tb-500-blend"],
    archiveLots: ["PP-2611"],
    references: [
      "de Hoffmann & Stroobant, Mass Spectrometry: Principles and Applications, 3rd ed.",
      "ICH Q6A — Specifications for new drug substances and products.",
    ],
    body: [
      { kind: "p", text: "HPLC quantifies. Mass spectrometry identifies. The two tests answer different questions and a release record needs both." },
      { kind: "figure", figure: "peptide", caption: "Schematic of a 15-residue peptide sequence. ESI-MS reports the deconvoluted intact mass; the sequence below is the molecule the released mass is compared against." },
      { kind: "h", text: "The measurement" },
      { kind: "p", text: "Electrospray ionization (ESI) produces a series of multiply-charged ions from the intact peptide. Deconvolution yields a monoisotopic or average mass that is compared against the theoretical mass calculated from the sequence." },
      { kind: "quote", text: "Purity tells you how much. Mass spec tells you what." },
      { kind: "h", text: "Acceptance" },
      { kind: "list", items: [
        "Observed mass within ±1 Da of theoretical for routine release.",
        "Charge envelope consistent with expected pI and solvent system.",
        "No unexpected satellite peaks at +16 (oxidation) or +22 (sodium adduct artifacts above threshold).",
      ]},
      { kind: "p", text: "Identity is recorded as Confirmed only when the deconvoluted mass and the charge envelope both match. A failing identity result halts release regardless of how clean the chromatogram looks." },
    ],
  },
  {
    slug: "cold-storage-lyophilized",
    title: "Cold storage for lyophilized peptides",
    deck: "Why −20 °C matters, when −80 °C is overkill, and how to plan a defrost cycle.",
    category: "Storage & Stability",
    readMinutes: 5,
    publishedOn: "2025-11-18",
    updatedOn: "2026-03-14",
    author: "VERATIS Quality",
    reviewedBy: "VERATIS Analytical",
    revision: "1.1",
    image: lab,
    pullQuote: "Most peptide degradation in a research freezer is caused by the freezer, not the peptide.",
    references: [
      "ICH Q1A(R2) — Stability testing of new drug substances and products.",
      "Wang, W. Lyophilization and development of solid protein pharmaceuticals. Int. J. Pharm. 2000.",
    ],
    body: [
      { kind: "p", text: "A correctly lyophilized peptide is a low-water, low-mobility solid. At −20 °C, sealed under inert headspace, most sequences are stable for years. The risks are almost entirely operational." },
      { kind: "h", text: "Operational rules" },
      { kind: "list", items: [
        "Store sealed vials at −20 °C in a non-defrost (manual) freezer.",
        "Allow vials to equilibrate to room temperature before opening — condensation on a cold vial introduces water into the cake.",
        "Aliquot reconstituted material; do not freeze-thaw the working solution repeatedly.",
        "Log every freezer excursion. A single excursion is not a release-defeating event; an unlogged one is.",
      ]},
      { kind: "quote", text: "Most peptide degradation in a research freezer is caused by the freezer, not the peptide." },
    ],
  },
  {
    slug: "lyophilization-cake-quality",
    title: "Lyophilization: reading cake quality",
    deck: "Pharmaceutical-elegant cake, collapsed cake, and what each tells you about the cycle.",
    category: "Lyophilization",
    readMinutes: 6,
    publishedOn: "2026-02-03",
    updatedOn: "2026-04-18",
    author: "VERATIS Manufacturing",
    reviewedBy: "VERATIS Analytical",
    revision: "1.0",
    image: lab,
    recentlyUpdated: true,
    pullQuote: "A collapsed cake is not cosmetic. It is a stability problem you can see from across the bench.",
    references: [
      "Pikal, M. J. Freeze-drying of proteins. ACS Symp. Ser. 1994.",
      "Tang & Pikal, Design of freeze-drying processes for pharmaceuticals. Pharm. Res. 2004.",
    ],
    body: [
      { kind: "p", text: "Visual inspection is the first quality gate after secondary drying. The cake is read against documented acceptance images, not memory." },
      { kind: "h", text: "Acceptable" },
      { kind: "list", items: [
        "Uniform white-to-off-white solid filling the bottom of the vial.",
        "Slight matte surface, smooth top, no visible meltback.",
        "Reconstitution within 30 seconds at room temperature with gentle swirling.",
      ]},
      { kind: "h", text: "Reject" },
      { kind: "list", items: [
        "Collapsed, retracted, or glassy cake — indicates primary drying above the collapse temperature.",
        "Splatter or material on the stopper — vial overfilled or vacuum ramp too aggressive.",
        "Discoloration or pink/brown tinge — oxidation event in formulation.",
      ]},
      { kind: "quote", text: "A collapsed cake is not cosmetic. It is a stability problem you can see from across the bench." },
    ],
  },
  {
    slug: "endotoxin-limits",
    title: "Endotoxin thresholds for research peptides",
    deck: "Why LAL is non-negotiable, and how the EU/mg threshold gets set.",
    category: "Endotoxin Standards",
    readMinutes: 5,
    publishedOn: "2026-01-09",
    updatedOn: "2026-04-02",
    author: "Northbridge Analytical · Microbiology",
    reviewedBy: "VERATIS Analytical",
    revision: "1.0",
    image: lab,
    references: [
      "USP <85> Bacterial Endotoxins Test.",
      "FDA Guidance for Industry: Pyrogen and Endotoxins Testing (2012).",
    ],
    body: [
      { kind: "p", text: "Endotoxin is a stable lipopolysaccharide fragment of Gram-negative bacterial cell walls. It survives autoclaving and most sterilization protocols. It does not show up on HPLC and it does not show up on mass spec." },
      { kind: "h", text: "Why we test it separately" },
      { kind: "p", text: "A peptide can be 99.7% pure by HPLC, identity-confirmed by MS, and still carry an endotoxin load that invalidates any in vitro inflammation assay performed with it. The only way to know is the kinetic chromogenic LAL test, run against a quantified standard curve." },
      { kind: "h", text: "Specification" },
      { kind: "list", items: [
        "Release specification: < 0.5 EU/mg for all lyophilized peptide lots.",
        "Reported per lot on the COA with method, sensitivity, and standard curve range.",
        "Out-of-spec lots are quarantined; they are not relabeled, repackaged, or sold downgraded.",
      ]},
    ],
  },
  {
    slug: "verification-architecture",
    title: "How the verification archive works",
    deck: "Append-only records, signed certificates, and why a lot number resolves the same way ten years from now.",
    category: "Verification Systems",
    readMinutes: 8,
    publishedOn: "2026-03-21",
    updatedOn: "2026-05-12",
    author: "VERATIS Engineering",
    reviewedBy: "VERATIS Analytical",
    revision: "1.3",
    image: lab,
    featured: true,
    recentlyUpdated: true,
    pullQuote: "An archive that can be edited is not an archive. It is a draft.",
    archiveLots: ["PP-2612", "PP-2611", "PP-2608"],
    references: [
      "ISO/IEC 17025:2017 §7.5 — Technical records.",
      "21 CFR Part 11 — Electronic Records and Electronic Signatures.",
    ],
    body: [
      { kind: "p", text: "The verification system has one job: given a lot number, return the exact certificate that was released for that lot — unchanged, signed, dated, and resolvable indefinitely." },
      { kind: "figure", figure: "timeline", caption: "Release timeline for a representative lot. Each event is recorded as an append-only entry; corrections issue a new revision rather than overwriting the previous one." },
      { kind: "h", text: "Architecture" },
      { kind: "list", items: [
        "Records are append-only. A correction creates a new revision; the previous revision is retained.",
        "Each release is signed at issuance and the signature is stored alongside the record.",
        "Lot numbers are unique and never reused. A withdrawn lot does not free its identifier.",
        "Public lookup endpoint is read-only and decoupled from the production database.",
      ]},
      { kind: "quote", text: "An archive that can be edited is not an archive. It is a draft." },
      { kind: "h", text: "What this means for you" },
      { kind: "p", text: "Every vial that leaves the facility can be authenticated from any device, by anyone, at any time, against the original signed record. There is no logged-in version of the truth — there is only the record." },
    ],
  },
  {
    slug: "in-vitro-best-practice",
    title: "Best practice for in-vitro experiments",
    deck: "Controls, replicates, and the documentation habits that make results defensible.",
    category: "Laboratory Protocol",
    readMinutes: 10,
    publishedOn: "2025-12-12",
    updatedOn: "2026-03-30",
    author: "VERATIS Standards desk",
    reviewedBy: "VERATIS Analytical",
    revision: "1.0",
    image: lab,
    references: [
      "Curtis et al., Experimental design and analysis and their reporting II. Br. J. Pharmacol. 2018.",
      "NIH Rigor and Reproducibility Guidance.",
    ],
    body: [
      { kind: "p", text: "An in-vitro result is only as good as the controls around it and the record behind it. Reproducibility is a documentation problem long before it is a biology problem." },
      { kind: "h", text: "Controls" },
      { kind: "list", items: [
        "Vehicle control: reconstitution solvent at the highest concentration used in any treatment well.",
        "Positive control: a reference compound with a known, published response in the same assay.",
        "Negative control: untreated cells from the same passage and seeding density.",
      ]},
      { kind: "h", text: "Documentation" },
      { kind: "list", items: [
        "Record the lot number of the peptide, not just the compound name.",
        "Record the reconstitution date, solvent, and storage condition of the working stock.",
        "Photograph plate layouts before reading. Layouts reconstructed from memory are layouts you cannot defend.",
      ]},
    ],
  },
];

export function findArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string, category: ArticleCategory) {
  return articles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => (a.category === category ? -1 : 1) - (b.category === category ? -1 : 1))
    .slice(0, 3);
}