import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, DocSection } from "@/components/site/LegalDoc";

export const Route = createFileRoute("/research-use")({
  head: () => ({
    meta: [
      { title: "Research Use Disclaimer — VERATIS" },
      { name: "description", content: "VERATIS products are supplied strictly for in-vitro laboratory and research use. Not for human or veterinary consumption." },
      { property: "og:title", content: "Research Use Disclaimer — VERATIS" },
      { property: "og:description", content: "Formal positioning, purchaser responsibilities, and compliance expectations for VERATIS research material." },
      { property: "og:url", content: "https://veratisbio.com/research-use" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/research-use" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc
      eyebrow="Standards"
      title="Research use disclaimer."
      lead="Formal positioning of all VERATIS material, the responsibilities accepted by the purchaser at point of order, and the compliance posture of the platform."
      meta={{
        reference: "VRT-STD-004",
        revision: "2.0",
        updated: "May 2026",
        classification: "Public · Compliance",
      }}
    >
      <DocSection number="01" title="Intended use">
        <p>
          All material supplied by VERATIS is intended exclusively for in-vitro
          laboratory and research applications. It is supplied to qualified
          researchers, institutions, and laboratories operating under
          appropriate oversight.
        </p>
      </DocSection>

      <DocSection number="02" title="Not for human or veterinary use">
        <p>
          VERATIS material is not a drug, dietary supplement, cosmetic, medical
          device, or food product. It is not intended for human consumption, for
          veterinary consumption, or for any clinical or therapeutic use. It is
          not intended to diagnose, treat, cure, or prevent any disease or
          medical condition.
        </p>
      </DocSection>

      <DocSection number="03" title="Purchaser representations">
        <p>
          By placing an order, the purchaser represents and warrants that:
        </p>
        <ul className="space-y-2.5 pl-5">
          {[
            "they are at least 21 years of age",
            "they are acquiring material for legitimate research use",
            "they will not administer, dispense, or otherwise transfer material for use in a human or animal subject",
            "they will store, handle, and dispose of material in accordance with applicable laboratory and environmental standards",
            "they will not resell or relabel material in a manner that misrepresents its research-only positioning",
          ].map((it) => (
            <li key={it} className="relative">
              <span className="absolute -left-5 top-[0.7em] w-2 h-px bg-foreground/40" />
              {it}
            </li>
          ))}
        </ul>
      </DocSection>

      <DocSection number="04" title="Compliance expectations">
        <p>
          Purchasers are responsible for compliance with all federal, state,
          local, and institutional regulations governing the receipt, storage,
          and handling of research material in their jurisdiction. Where local
          regulation conflicts with these terms, local regulation controls.
        </p>
      </DocSection>

      <DocSection number="05" title="Misuse">
        <p>
          Any use of supplied material outside the research-only positioning is
          expressly prohibited. VERATIS disclaims all liability for
          consequences arising from such use and reserves the right to refuse
          future orders from any account associated with misuse.
        </p>
      </DocSection>

      <DocSection number="06" title="No medical advice">
        <p>
          Nothing on the VERATIS site, in the verification archive, in the
          education reference library, or in customer communications constitutes
          medical advice, dosing guidance, or a recommendation for use in any
          subject. Educational material is supplied for scientific reference
          only.
        </p>
      </DocSection>

      <DocSection number="07" title="Acknowledgement">
        <p>
          Receipt of material from VERATIS constitutes acknowledgement and
          acceptance of this disclaimer in full.
        </p>
      </DocSection>
    </LegalDoc>
  );
}