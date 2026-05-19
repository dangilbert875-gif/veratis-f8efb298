/**
 * Compound dossiers — long-form, research-only educational content surfaced
 * on every product detail page. Keyed by compound family so multiple SKUs
 * of the same molecule (e.g. retatrutide 12/30/60 mg) share one dossier.
 *
 * Editorial rules (do not relax):
 *  - Research-use language only. Never "treats", "cures", "improves".
 *  - Phrasings: "investigated for", "has been studied in", "explored as".
 *  - No dosing, no protocols, no clinical recommendations.
 */

export type CompoundKey =
  | "bpc-157"
  | "tb-500"
  | "tb-4"
  | "ghk-cu"
  | "glow-70"
  | "ghrp-6"
  | "ipamorelin"
  | "hcg"
  | "melanotan-2"
  | "mots-c"
  | "ss-31"
  | "retatrutide"
  | "semaglutide"
  | "tirzepatide";

export type Dossier = {
  key: CompoundKey;
  displayName: string;
  classification: string;
  sequenceNote?: string;
  overview: string[];
  origin: string;
  researchInterest: string[];
  mechanism: string[];
  sourcing: string;
  verification: string;
  storage: string;
  related: CompoundKey[];
  faq: { q: string; a: string }[];
  /** Long-tail SEO terms — used as keywords meta, not as visible copy. */
  keywords: string[];
};

const VERIFY_LINE =
  "Every released lot of this compound is independently assayed by an ISO/IEC 17025:2017 accredited laboratory for identity (ESI-MS), purity (RP-HPLC), endotoxin (kinetic chromogenic LAL), and water content (Karl Fischer). The signed certificate is archived under the lot number printed on the vial and remains permanently resolvable through the VERATIS verification system.";

const SOURCING_LINE_PEPTIDE =
  "Produced by solid-phase peptide synthesis using Fmoc chemistry on a resin support, followed by global deprotection, preparative reverse-phase HPLC purification, sequence verification by mass spectrometry, and controlled lyophilization into a nitrogen-sealed glass vial. Counter-ions and residual solvents are quantified separately from the area-percent purity figure.";

const STORAGE_LINE_LYO =
  "Sealed, lyophilized vials are stable for years at −20 °C, protected from light. Allow vials to equilibrate to room temperature before opening to prevent condensation of atmospheric water into the cake. Aliquot reconstituted material; do not subject the working solution to repeated freeze-thaw cycles.";

export const dossiers: Record<CompoundKey, Dossier> = {
  "bpc-157": {
    key: "bpc-157",
    displayName: "BPC-157",
    classification: "15-amino acid synthetic pentadecapeptide",
    sequenceNote: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    overview: [
      "BPC-157 is a stable 15-residue synthetic pentadecapeptide derived from a sequence first identified in human gastric juice. The acronym stands for Body Protection Compound, the name given to the parent protein from which the fragment was originally characterized in the early 1990s.",
      "Unlike many peptides studied in research models, BPC-157 is notably stable in aqueous conditions and resistant to gastric enzymatic degradation in vitro — a property that has shaped much of the experimental literature around it.",
    ],
    origin:
      "BPC-157 was first described by a group at the University of Zagreb investigating cytoprotective fractions of gastric juice. The pentadecapeptide fragment was synthesized and used as a research tool to probe tissue-protective pathways. It has no endogenous receptor confirmed in the literature; mechanistic work remains active.",
    researchInterest: [
      "Investigated for its effects on collagen organization and tendon-derived fibroblast behavior in vitro.",
      "Studied in relation to angiogenic signaling and vascular network formation in animal models.",
      "Explored in models of gastrointestinal mucosal stress and ulcer formation.",
      "Commonly paired in research literature with TB-500 / Thymosin β-4 fragments to compare regenerative pathway activity.",
    ],
    mechanism: [
      "BPC-157 has been associated in the literature with modulation of the nitric oxide system, with experimental evidence pointing to interaction with both NO synthase activity and downstream vasoactive signaling. The compound does not appear to act through a single canonical receptor.",
      "Additional research has examined its influence on VEGF-A expression and FAK-paxillin signaling in fibroblasts, pathways relevant to angiogenesis and cell migration. These remain areas of active mechanistic inquiry rather than settled biology.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["tb-500", "tb-4", "ghk-cu"],
    faq: [
      {
        q: "What is BPC-157?",
        a: "BPC-157 is a synthetic 15-amino acid pentadecapeptide derived from a sequence identified in gastric juice. It is supplied as a lyophilized powder for in-vitro research.",
      },
      {
        q: "What has BPC-157 been studied for?",
        a: "Research literature has examined BPC-157 in the context of collagen and tendon fibroblast behavior, angiogenic signaling, and gastrointestinal mucosal models. It is not approved for human use.",
      },
      {
        q: "Why is BPC-157 often paired with TB-500 in research?",
        a: "Both peptides have been investigated for their effects on tissue remodeling and cell migration, though through distinct mechanisms. Studies pair them to compare and contrast regenerative pathway activity in the same model.",
      },
    ],
    keywords: [
      "what is BPC-157",
      "BPC-157 mechanism",
      "BPC-157 research peptide",
      "BPC-157 sequence",
      "BPC-157 HPLC purity",
    ],
  },

  "tb-500": {
    key: "tb-500",
    displayName: "TB-500",
    classification: "Synthetic 17-amino acid active fragment of Thymosin β-4",
    sequenceNote: "Active fragment commonly written as LKKTETQ-containing sequence of Thymosin β-4",
    overview: [
      "TB-500 is a synthetic peptide corresponding to the actin-binding active region of Thymosin β-4 (Tβ4), a 43-amino acid protein found broadly in mammalian tissues. The fragment retains the LKKTETQ motif that mediates much of Tβ4's actin-sequestration activity.",
      "TB-500 is used in research as a more tractable analogue of the full sequence, allowing investigators to probe Tβ4-relevant pathways without the production complexity of the full-length protein.",
    ],
    origin:
      "Thymosin β-4 was first isolated from calf thymus in the 1960s and later shown to be the principal G-actin sequestering peptide in most cells. The TB-500 fragment was developed as a synthetic surrogate of the active region for laboratory work.",
    researchInterest: [
      "Investigated for its effects on actin dynamics, cytoskeletal reorganization, and cell migration in vitro.",
      "Studied in models of cardiac and dermal wound repair in animal literature.",
      "Explored in relation to endothelial cell migration and capillary network formation.",
      "Frequently compared against the full Thymosin β-4 sequence to evaluate fragment vs. full-length activity.",
    ],
    mechanism: [
      "Tβ4 binds monomeric G-actin and modulates the G-actin / F-actin equilibrium, influencing how cells reorganize their cytoskeleton during migration. The TB-500 fragment retains the residues most directly implicated in this binding.",
      "Downstream effects observed in the literature include changes in cell motility and indirect modulation of inflammatory and angiogenic markers. Mechanistic interpretation should account for fragment vs. full-length differences.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["tb-4", "bpc-157", "ghk-cu"],
    faq: [
      {
        q: "What is TB-500?",
        a: "TB-500 is a synthetic peptide corresponding to the active actin-binding region of Thymosin β-4. It is supplied lyophilized for in-vitro research use only.",
      },
      {
        q: "What is the difference between TB-500 and TB-4 full sequence?",
        a: "TB-4 is the full 43-residue Thymosin β-4 protein. TB-500 is a shorter synthetic fragment containing the active actin-binding region. Researchers compare them to study fragment vs. full-length activity.",
      },
    ],
    keywords: ["what is TB-500", "TB-500 vs TB-4", "TB-500 actin binding", "TB-500 sequence", "TB-500 research"],
  },

  "tb-4": {
    key: "tb-4",
    displayName: "TB-4 (Thymosin β-4, full sequence)",
    classification: "Full-length 43-amino acid Thymosin β-4 peptide",
    overview: [
      "TB-4 in this catalog refers to the full 43-residue Thymosin β-4 sequence, supplied as a lyophilized synthetic peptide. Thymosin β-4 is the principal intracellular G-actin sequestering peptide in most mammalian cells.",
      "The full-length sequence is used in research where the truncated TB-500 fragment is not representative of the biological activity under investigation.",
    ],
    origin:
      "Thymosin β-4 was first isolated from calf thymus and subsequently characterized in skin, platelets, neutrophils, and many other tissues. Its role in actin dynamics was established through decades of cytoskeletal research.",
    researchInterest: [
      "Studied for its role in actin sequestration and cytoskeletal turnover.",
      "Investigated in dermal wound-healing and corneal repair models.",
      "Explored in relation to cardiac tissue repair and endothelial migration.",
      "Used in mechanistic studies as a reference against shorter fragments such as TB-500.",
    ],
    mechanism: [
      "Thymosin β-4 binds G-actin with high affinity, preventing spontaneous polymerization into F-actin and providing a regulated pool that the cell can draw on during migration, division, and repair.",
      "Secondary literature has reported effects on inflammatory mediators, angiogenic signaling, and stem-cell mobilization, although these are downstream of the primary actin-binding role.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["tb-500", "bpc-157", "ghk-cu"],
    faq: [
      {
        q: "What is TB-4?",
        a: "TB-4 is the full 43-residue Thymosin β-4 peptide, supplied lyophilized for in-vitro research.",
      },
      {
        q: "Why use the full TB-4 sequence instead of TB-500?",
        a: "Researchers select the full sequence when they want to study Thymosin β-4 activity that depends on residues outside the truncated TB-500 fragment, or to compare full-length vs fragment behavior in the same assay.",
      },
    ],
    keywords: ["what is TB-4", "Thymosin beta-4 research", "TB-4 full sequence", "TB-4 vs TB-500"],
  },

  "ghk-cu": {
    key: "ghk-cu",
    displayName: "GHK-Cu",
    classification: "Naturally occurring copper-binding tripeptide (Gly-His-Lys) complexed with Cu²⁺",
    sequenceNote: "Gly-His-Lys",
    overview: [
      "GHK-Cu is the copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine, a sequence that occurs naturally in human plasma, saliva, and urine and whose concentration is known to decline with age. The peptide has a high natural affinity for divalent copper.",
      "It is one of the most extensively studied small peptides in regenerative and cosmetic research, with a literature spanning collagen biology, wound repair, and gene-expression profiling.",
    ],
    origin:
      "GHK was first isolated from human plasma in the 1970s and shown to influence hepatic gene expression. Subsequent work characterized its copper-binding behavior and the distinct biological profile of the GHK-Cu complex.",
    researchInterest: [
      "Investigated for its effects on dermal fibroblast collagen and glycosaminoglycan synthesis in vitro.",
      "Studied in wound-healing and tissue-remodeling models.",
      "Explored in cosmetic and hair-follicle research literature.",
      "Examined in gene-expression studies for broad modulatory effects on regenerative pathways.",
    ],
    mechanism: [
      "The GHK sequence binds Cu²⁺ with sub-nanomolar affinity. The resulting complex is a recognized carrier of bioavailable copper into cells, which is itself a cofactor for enzymes involved in collagen cross-linking and antioxidant defense.",
      "Downstream effects reported in the literature include modulation of TGF-β signaling, MMP/TIMP balance, and the expression of genes associated with skin remodeling.",
    ],
    sourcing:
      "The GHK peptide is produced by solid-phase peptide synthesis and complexed with copper(II) under controlled stoichiometry. The blue colour of the lyophilized cake is a direct consequence of the Cu²⁺ d-d transition and is part of the visual release specification.",
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["glow-70", "bpc-157", "tb-4"],
    faq: [
      {
        q: "What is GHK-Cu?",
        a: "GHK-Cu is the copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine. It is supplied lyophilized for in-vitro research use only.",
      },
      {
        q: "Why is GHK-Cu blue?",
        a: "The blue colour comes from the copper(II) ion bound to the peptide. It is a chemical feature of the complex, not a dye, and is one of the visual checks at release.",
      },
    ],
    keywords: ["what is GHK-Cu", "GHK copper peptide", "GHK-Cu collagen research", "GHK-Cu wound healing"],
  },

  "glow-70": {
    key: "glow-70",
    displayName: "GLOW 70 (regenerative research blend)",
    classification: "Lyophilized research blend of peptides studied in regenerative and dermal contexts",
    overview: [
      "GLOW 70 is a research-blend vial combining peptides whose individual literatures sit in adjacent regenerative and dermal research areas. It is intended for in-vitro investigators who want to study these compounds under a single reconstitution rather than in separate vials.",
      "Each component of the blend is released against the same identity, purity, endotoxin, and water specifications as a single-compound lot.",
    ],
    origin:
      "The composition is built on peptides individually well-represented in the regenerative-research literature. The blend itself is a manufacturing convenience for research workflows; it is not a clinical formulation.",
    researchInterest: [
      "Used in comparative studies of regenerative-pathway activity.",
      "Selected by laboratories standardizing multi-component handling in dermal-research models.",
      "Explored as a single-vial substitute for parallel reconstitutions of related peptides.",
    ],
    mechanism: [
      "Mechanistic interpretation should reference the individual literatures of each component peptide. The blend itself has no novel pharmacology beyond the sum of its parts.",
    ],
    sourcing:
      "Components are individually synthesized by solid-phase peptide synthesis, purified by preparative HPLC, combined in a controlled ratio, then co-lyophilized into a nitrogen-sealed vial.",
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["ghk-cu", "bpc-157", "tb-4"],
    faq: [
      {
        q: "What is GLOW 70?",
        a: "GLOW 70 is a lyophilized research blend of peptides studied in regenerative and dermal research contexts. It is supplied for in-vitro use only.",
      },
    ],
    keywords: ["GLOW 70 peptide blend", "regenerative peptide blend research"],
  },

  "ghrp-6": {
    key: "ghrp-6",
    displayName: "GHRP-6",
    classification: "Synthetic hexapeptide growth-hormone secretagogue",
    sequenceNote: "His-D-Trp-Ala-Trp-D-Phe-Lys",
    overview: [
      "GHRP-6 (Growth Hormone Releasing Peptide-6) is a synthetic six-residue peptide developed in the 1980s as an early example of a growth-hormone secretagogue. It binds the ghrelin receptor (GHS-R1a) and was one of the foundational tools in the discovery of that receptor system.",
    ],
    origin:
      "GHRP-6 was synthesized in the laboratory of Cyril Bowers and colleagues as part of structure-activity work on enkephalin analogues that unexpectedly elicited growth-hormone release. It predates the identification of ghrelin as the endogenous ligand of GHS-R1a.",
    researchInterest: [
      "Studied as a research tool for the ghrelin receptor (GHS-R1a).",
      "Investigated in models of growth-hormone pulse architecture.",
      "Examined for appetite-pathway research in animal literature.",
    ],
    mechanism: [
      "GHRP-6 acts as an agonist at GHS-R1a, the receptor later shown to be the endogenous target of ghrelin. Receptor activation triggers a Gq-coupled cascade that, in pituitary somatotrophs, contributes to growth-hormone release.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["ipamorelin", "mots-c"],
    faq: [
      {
        q: "What is GHRP-6?",
        a: "GHRP-6 is a synthetic hexapeptide and an early growth-hormone secretagogue acting on the ghrelin receptor. It is supplied lyophilized for in-vitro research only.",
      },
    ],
    keywords: ["what is GHRP-6", "GHRP-6 ghrelin receptor", "growth hormone secretagogue research"],
  },

  "ipamorelin": {
    key: "ipamorelin",
    displayName: "Ipamorelin",
    classification: "Synthetic pentapeptide growth-hormone secretagogue",
    sequenceNote: "Aib-His-D-2-Nal-D-Phe-Lys",
    overview: [
      "Ipamorelin is a selective synthetic pentapeptide developed as a more specific successor to early GHRPs. Its design emphasized growth-hormone secretagogue activity at GHS-R1a with reduced off-target activity on the cortisol and prolactin axes characteristic of older compounds.",
    ],
    origin:
      "Ipamorelin was first reported in the late 1990s by researchers at Novo Nordisk during structure-activity work aimed at improving the selectivity of growth-hormone secretagogues over the earlier GHRP series.",
    researchInterest: [
      "Investigated as a research probe for GHS-R1a selectivity.",
      "Compared in literature with GHRP-2 and GHRP-6 for selectivity profile.",
      "Studied in animal models of growth-hormone pulse architecture.",
    ],
    mechanism: [
      "Like other GHRPs, ipamorelin agonizes the ghrelin receptor (GHS-R1a) and activates Gq-coupled signaling. Its design profile distinguishes it from earlier GHRPs primarily in selectivity rather than primary mechanism.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["ghrp-6", "mots-c"],
    faq: [
      {
        q: "What is Ipamorelin?",
        a: "Ipamorelin is a synthetic pentapeptide growth-hormone secretagogue acting at GHS-R1a. It is supplied lyophilized for in-vitro research only.",
      },
      {
        q: "How is Ipamorelin different from GHRP-6?",
        a: "Ipamorelin was developed for greater selectivity at GHS-R1a relative to earlier GHRP analogues, with a reduced reported effect on prolactin and cortisol pathways in animal literature.",
      },
    ],
    keywords: ["what is ipamorelin", "ipamorelin GHS-R1a", "ipamorelin vs GHRP-6"],
  },

  "hcg": {
    key: "hcg",
    displayName: "HCG (human chorionic gonadotropin)",
    classification: "Glycoprotein hormone — α/β heterodimer",
    overview: [
      "Human chorionic gonadotropin is a heterodimeric glycoprotein hormone composed of an α-subunit shared with other pituitary glycoproteins (LH, FSH, TSH) and a β-subunit specific to HCG. It is studied extensively in endocrine and reproductive biology research.",
      "Because HCG is a glycoprotein rather than a short synthetic peptide, the dosage unit on the vial is reported in International Units (IU) rather than milligrams.",
    ],
    origin:
      "HCG was first characterized in the early 20th century as a placental hormone responsible for the maintenance of the corpus luteum in early pregnancy. Its cloning and structural characterization in the 1980s opened decades of detailed receptor and signaling work.",
    researchInterest: [
      "Studied as a reference ligand for the LH/CG receptor (LHCGR).",
      "Investigated in reproductive-endocrinology research models.",
      "Used in receptor pharmacology as a long-acting LHCGR agonist surrogate.",
    ],
    mechanism: [
      "HCG binds and activates the LH/CG receptor (LHCGR), a Gs-coupled GPCR. Receptor activation drives cAMP-dependent steroidogenesis in target tissues such as Leydig and luteal cells.",
    ],
    sourcing:
      "Research-grade HCG is produced under controlled biotech processes, lyophilized into IU-standardized vials, and held to identity, purity, and endotoxin specifications prior to release.",
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["ipamorelin", "ghrp-6"],
    faq: [
      {
        q: "What is HCG?",
        a: "Human chorionic gonadotropin is a glycoprotein hormone. It is studied as a reference ligand for the LH/CG receptor in research models. It is supplied lyophilized for in-vitro research use only.",
      },
      {
        q: "Why is HCG measured in IU instead of mg?",
        a: "HCG is a glycoprotein hormone, so its biological activity per unit mass varies with glycoform. International Units standardize biological potency rather than raw mass.",
      },
    ],
    keywords: ["what is HCG", "HCG glycoprotein research", "HCG IU vial"],
  },

  "melanotan-2": {
    key: "melanotan-2",
    displayName: "Melanotan-2",
    classification: "Cyclic synthetic analogue of α-MSH",
    overview: [
      "Melanotan-2 is a cyclic synthetic heptapeptide analogue of α-melanocyte-stimulating hormone (α-MSH), designed to be more stable and broadly active across melanocortin receptor subtypes than the endogenous ligand.",
    ],
    origin:
      "Melanotan-2 was developed in the 1980s at the University of Arizona during structure-activity work on α-MSH analogues for pigmentation research.",
    researchInterest: [
      "Studied as a non-selective melanocortin receptor (MC1R–MC5R) agonist research tool.",
      "Investigated in pigmentation-pathway research.",
      "Used in receptor pharmacology to characterize melanocortin subtype activity.",
    ],
    mechanism: [
      "Melanotan-2 acts as an agonist across multiple melanocortin receptor subtypes (notably MC1R, MC3R, MC4R, and MC5R), each Gs-coupled. Pigmentation-related signaling is driven primarily through MC1R activation on melanocytes.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["ghk-cu"],
    faq: [
      {
        q: "What is Melanotan-2?",
        a: "Melanotan-2 is a cyclic synthetic analogue of α-MSH. It is supplied lyophilized for in-vitro research use only.",
      },
    ],
    keywords: ["what is melanotan-2", "MT-2 melanocortin research", "alpha-MSH analogue"],
  },

  "mots-c": {
    key: "mots-c",
    displayName: "MOTS-c",
    classification: "16-amino acid mitochondrial-derived peptide",
    overview: [
      "MOTS-c (Mitochondrial Open Reading frame of the Twelve S rRNA-c) is a 16-residue peptide encoded within the mitochondrial 12S rRNA region. It is one of the most studied members of the mitochondrial-derived peptide family.",
    ],
    origin:
      "MOTS-c was characterized in 2015 by Cohen and colleagues, who demonstrated that a short open reading frame within mitochondrial DNA produced a translated peptide with measurable cellular activity.",
    researchInterest: [
      "Investigated for its role in metabolic and mitochondrial signaling.",
      "Studied in models of insulin sensitivity and AMPK pathway activity.",
      "Examined in exercise-physiology and ageing research.",
    ],
    mechanism: [
      "MOTS-c has been associated in the literature with activation of the AMPK pathway and downstream effects on glucose metabolism. Its precise upstream receptor remains under investigation.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["ss-31", "ghrp-6"],
    faq: [
      {
        q: "What is MOTS-c?",
        a: "MOTS-c is a 16-residue mitochondrial-derived peptide encoded within the 12S rRNA region. It is supplied lyophilized for in-vitro research use only.",
      },
    ],
    keywords: ["what is MOTS-c", "MOTS-c mitochondrial peptide", "MOTS-c AMPK research"],
  },

  "ss-31": {
    key: "ss-31",
    displayName: "SS-31",
    classification: "Mitochondria-targeted aromatic-cationic tetrapeptide",
    sequenceNote: "D-Arg-2',6'-dimethylTyr-Lys-Phe-NH₂ (Szeto-Schiller series)",
    overview: [
      "SS-31 (also known by the developmental name elamipretide) is a small synthetic aromatic-cationic peptide from the Szeto-Schiller series, designed to concentrate selectively at the inner mitochondrial membrane through interaction with cardiolipin.",
    ],
    origin:
      "SS-31 was developed by Hazel Szeto and Peter Schiller in the early 2000s as part of a program designing peptides that cross the mitochondrial membrane and modulate cardiolipin-dependent processes.",
    researchInterest: [
      "Investigated in models of mitochondrial dysfunction.",
      "Studied for effects on cardiolipin-electron-transport-chain interactions.",
      "Examined in cardiac and renal ischemia-reperfusion research models.",
    ],
    mechanism: [
      "SS-31 binds cardiolipin at the inner mitochondrial membrane. This interaction has been associated in the literature with stabilization of cristae architecture, improved electron-transport-chain efficiency, and reduced reactive-oxygen-species generation under stress.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["mots-c"],
    faq: [
      {
        q: "What is SS-31?",
        a: "SS-31 is a mitochondria-targeted aromatic-cationic tetrapeptide that interacts with cardiolipin at the inner mitochondrial membrane. It is supplied lyophilized for in-vitro research use only.",
      },
    ],
    keywords: ["what is SS-31", "SS-31 cardiolipin research", "elamipretide research peptide"],
  },

  "retatrutide": {
    key: "retatrutide",
    displayName: "Retatrutide",
    classification: "Triple agonist peptide — GLP-1 / GIP / glucagon receptors",
    overview: [
      "Retatrutide is an investigational synthetic peptide designed as a single-molecule agonist at three incretin and metabolic receptors: GLP-1, GIP, and glucagon. It belongs to a generation of multi-receptor metabolic peptides developed after semaglutide and tirzepatide.",
    ],
    origin:
      "Retatrutide was developed by Eli Lilly and reported in clinical literature from 2023 onward. It represents an evolution of the dual-agonist concept established by tirzepatide.",
    researchInterest: [
      "Studied as a research probe for multi-receptor incretin signaling.",
      "Investigated for its receptor selectivity profile across GLP-1, GIP, and glucagon.",
      "Compared in literature against dual-agonist tirzepatide and mono-agonist semaglutide.",
    ],
    mechanism: [
      "Retatrutide engages three class-B GPCRs: the GLP-1 receptor, the GIP receptor, and the glucagon receptor. Activation of each contributes distinct signaling, with the combination producing a pharmacology that differs in kind from either mono- or dual-agonist peptides.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["semaglutide", "tirzepatide"],
    faq: [
      {
        q: "What is retatrutide?",
        a: "Retatrutide is an investigational triple-agonist peptide engaging the GLP-1, GIP, and glucagon receptors. It is supplied lyophilized for in-vitro research use only.",
      },
      {
        q: "How does retatrutide differ from tirzepatide and semaglutide?",
        a: "Semaglutide is a GLP-1 mono-agonist. Tirzepatide is a GLP-1 / GIP dual agonist. Retatrutide adds glucagon-receptor activity, producing a triple-agonist pharmacology.",
      },
    ],
    keywords: [
      "what is retatrutide",
      "retatrutide triple agonist",
      "retatrutide vs tirzepatide",
      "GLP-1 GIP glucagon research",
    ],
  },

  "semaglutide": {
    key: "semaglutide",
    displayName: "Semaglutide",
    classification: "Long-acting GLP-1 receptor agonist peptide",
    overview: [
      "Semaglutide is a long-acting glucagon-like peptide-1 (GLP-1) receptor agonist, structurally derived from native GLP-1 with substitutions and a fatty-acid side chain that markedly extend its half-life through albumin binding.",
    ],
    origin:
      "Semaglutide was developed by Novo Nordisk and is one of the most extensively characterized members of the GLP-1 receptor agonist class. The mono-agonist scaffold provides a baseline against which dual- and triple-agonist research peptides (tirzepatide, retatrutide) are compared.",
    researchInterest: [
      "Studied as a reference GLP-1 receptor agonist in receptor pharmacology.",
      "Investigated in incretin-pathway and appetite-signaling research models.",
      "Used as the mono-agonist comparator for tirzepatide and retatrutide.",
    ],
    mechanism: [
      "Semaglutide binds the GLP-1 receptor, a class-B GPCR, driving Gs-coupled cAMP signaling. The extended half-life relative to native GLP-1 is achieved by sequence modification and a fatty-acid moiety that promotes reversible albumin binding.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["tirzepatide", "retatrutide"],
    faq: [
      {
        q: "What is semaglutide?",
        a: "Semaglutide is a long-acting GLP-1 receptor agonist peptide. It is supplied lyophilized for in-vitro research use only.",
      },
    ],
    keywords: ["what is semaglutide", "semaglutide GLP-1 research", "semaglutide vs tirzepatide"],
  },

  "tirzepatide": {
    key: "tirzepatide",
    displayName: "Tirzepatide",
    classification: "Dual agonist peptide — GLP-1 / GIP receptors",
    overview: [
      "Tirzepatide is a synthetic peptide designed as a dual agonist at the GLP-1 and GIP receptors. It established the dual-incretin scaffold that retatrutide later extended with glucagon-receptor activity.",
    ],
    origin:
      "Tirzepatide was developed by Eli Lilly and reported in clinical literature from 2018 onward. It is a milestone compound in the evolution from GLP-1 mono-agonists toward multi-receptor incretin pharmacology.",
    researchInterest: [
      "Studied as a dual GLP-1 / GIP agonist research tool.",
      "Used in receptor pharmacology to dissect GLP-1 vs GIP contributions.",
      "Compared in literature against semaglutide and retatrutide.",
    ],
    mechanism: [
      "Tirzepatide engages both the GLP-1 and GIP receptors. Each is a class-B GPCR coupled primarily to Gs and cAMP signaling. The dual-agonist pharmacology differs in kind from GLP-1 mono-agonism.",
    ],
    sourcing: SOURCING_LINE_PEPTIDE,
    verification: VERIFY_LINE,
    storage: STORAGE_LINE_LYO,
    related: ["semaglutide", "retatrutide"],
    faq: [
      {
        q: "What is tirzepatide?",
        a: "Tirzepatide is a synthetic dual GLP-1 / GIP receptor agonist peptide. It is supplied lyophilized for in-vitro research use only.",
      },
    ],
    keywords: ["what is tirzepatide", "tirzepatide GLP-1 GIP", "tirzepatide vs semaglutide"],
  },
};

/** Resolve the right dossier from a product slug. */
export function dossierForSlug(slug: string): Dossier | undefined {
  const s = slug.toLowerCase();
  if (s.startsWith("bpc-tb-500")) return dossiers["bpc-157"];
  if (s.startsWith("bpc-157")) return dossiers["bpc-157"];
  if (s.startsWith("tb-500")) return dossiers["tb-500"];
  if (s.startsWith("tb-4")) return dossiers["tb-4"];
  if (s.startsWith("ghk-cu")) return dossiers["ghk-cu"];
  if (s.startsWith("glow-70")) return dossiers["glow-70"];
  if (s.startsWith("ghrp-6")) return dossiers["ghrp-6"];
  if (s.startsWith("ipamorelin")) return dossiers["ipamorelin"];
  if (s.startsWith("hcg")) return dossiers["hcg"];
  if (s.startsWith("melanotan")) return dossiers["melanotan-2"];
  if (s.startsWith("mots-c")) return dossiers["mots-c"];
  if (s.startsWith("ss-31")) return dossiers["ss-31"];
  if (s.startsWith("retatrutide")) return dossiers["retatrutide"];
  if (s.startsWith("semaglutide")) return dossiers["semaglutide"];
  if (s.startsWith("tirzepatide")) return dossiers["tirzepatide"];
  return undefined;
}

/** Find product slugs that share a compound key — used for "Related research". */
export function siblingSlugsForKey(
  key: CompoundKey,
  allSlugs: string[],
  excludeSlug: string,
): string[] {
  return allSlugs.filter((s) => {
    if (s === excludeSlug) return false;
    const d = dossierForSlug(s);
    return d?.key === key;
  });
}