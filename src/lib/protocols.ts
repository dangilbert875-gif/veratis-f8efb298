import veratisBpc157 from "@/assets/veratis-bpc-157.png";
import veratisGhkCu from "@/assets/veratis-ghk-cu.png";
import veratisIpamorelin from "@/assets/veratis-ipamorelin.png";
import veratisMotsC from "@/assets/veratis-mots-c.png";
import veratisMelanotan2 from "@/assets/veratis-melanotan-2.png";
import veratisRetatrutide from "@/assets/veratis-retatrutide.png";
import veratisTb500 from "@/assets/veratis-tb-500.png";
import veratisTirzepatide from "@/assets/veratis-tirzepatide.png";

export type ProtocolKey =
  | "repair"
  | "restore"
  | "regenerate"
  | "ascent"
  | "shift"
  | "vector"
  | "rejuvenate"
  | "enhance";

export type ProtocolDefinition = {
  key: ProtocolKey;
  name: string;
  purpose: string;
  colorVar: string;
  image: string;
};

export const protocolDefinitions: Record<ProtocolKey, ProtocolDefinition> = {
  repair: {
    key: "repair",
    name: "REPAIR",
    purpose: "Tissue recovery research",
    colorVar: "var(--protocol-repair)",
    image: veratisBpc157,
  },
  restore: {
    key: "restore",
    name: "RESTORE",
    purpose: "Recovery pathway research",
    colorVar: "var(--protocol-restore)",
    image: veratisTb500,
  },
  regenerate: {
    key: "regenerate",
    name: "REGENERATE",
    purpose: "Regenerative signaling research",
    colorVar: "var(--protocol-regenerate)",
    image: veratisGhkCu,
  },
  ascent: {
    key: "ascent",
    name: "ASCENT",
    purpose: "Growth hormone pathway research",
    colorVar: "var(--protocol-ascent)",
    image: veratisIpamorelin,
  },
  shift: {
    key: "shift",
    name: "SHIFT",
    purpose: "Metabolic pathway research",
    colorVar: "var(--protocol-shift)",
    image: veratisRetatrutide,
  },
  vector: {
    key: "vector",
    name: "VECTOR",
    purpose: "Dual-agonist pathway research",
    colorVar: "var(--protocol-vector)",
    image: veratisTirzepatide,
  },
  rejuvenate: {
    key: "rejuvenate",
    name: "REJUVENATE",
    purpose: "Mitochondrial research",
    colorVar: "var(--protocol-rejuvenate)",
    image: veratisMotsC,
  },
  enhance: {
    key: "enhance",
    name: "ENHANCE",
    purpose: "Melanocortin research",
    colorVar: "var(--protocol-enhance)",
    image: veratisMelanotan2,
  },
};

const protocolBySlug: Record<string, ProtocolKey> = {
  "bpc-157-12mg": "repair",
  "bpc-tb-500-blend": "restore",
  "tb-500-fragment-12mg": "restore",
  "tb-4-full-sequence-10mg": "restore",
  "ghk-cu-100mg": "regenerate",
  "ghk-cu-50mg": "regenerate",
  "glow-70": "regenerate",
  "ghrp-6-10mg": "ascent",
  "ipamorelin-10mg": "ascent",
  "hcg-10000-iu": "rejuvenate",
  "hcg-5000-iu": "rejuvenate",
  "melanotan-2-10mg": "enhance",
  "mots-c-10mg": "rejuvenate",
  "ss-31-10mg": "rejuvenate",
  "retatrutide-12mg": "shift",
  "retatrutide-30mg": "shift",
  "retatrutide-60mg": "shift",
  "semaglutide-5mg": "shift",
  "semaglutide-10mg": "shift",
  "tirzepatide-10mg": "vector",
  "tirzepatide-30mg": "vector",
};

export function protocolForSlug(slug: string) {
  const key = protocolBySlug[slug];
  return key ? protocolDefinitions[key] : undefined;
}

export function protocolImageForSlug(slug: string) {
  return protocolForSlug(slug)?.image;
}