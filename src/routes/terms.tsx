import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, DocSection } from "@/components/site/LegalDoc";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — VERATIS" },
      { name: "description", content: "Terms governing use of the VERATIS site, purchasing, the verification archive, and the research-use-only positioning of all products." },
      { property: "og:title", content: "Terms & Conditions — VERATIS" },
      { property: "og:description", content: "Operational terms for ordering, the verification archive, intellectual property, liability, and governing law." },
      { property: "og:url", content: "https://veratisbio.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/terms" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc
      eyebrow="Standards"
      title="Terms & conditions."
      lead="The operational terms that govern use of the VERATIS site, the verification archive, and the dispatch of research-grade material."
      meta={{ reference: "VRT-STD-002", revision: "1.3", updated: "May 2026" }}
    >
      <DocSection number="01" title="Use of the site">
        <p>
          By accessing the VERATIS site you agree to these terms. The site, the
          verification archive, and the documentation it surfaces are provided
          for laboratory and research reference. You agree not to misrepresent
          retrieved certificates, scrape the archive at volume, or attempt to
          interfere with the integrity of the verification system.
        </p>
      </DocSection>

      <DocSection number="02" title="Purchasing eligibility">
        <p>
          To purchase, you confirm that you are at least 21 years of age, are
          acquiring material for in-vitro laboratory or research use only, and
          have the legal authority to receive such material at the supplied
          address. VERATIS reserves the right to refuse or cancel any order at
          its sole discretion.
        </p>
      </DocSection>

      <DocSection number="03" title="Order acceptance">
        <p>
          An order is an offer to purchase. Acceptance occurs only upon
          dispatch confirmation. Pricing, availability, and lot allocation are
          subject to change without notice. If a released lot fails post-release
          stability review, we may substitute, refund, or hold the order.
        </p>
      </DocSection>

      <DocSection number="04" title="Payment">
        <p>
          Payment is due in full at checkout via the methods listed on the
          Payment Policy. Title and risk of loss pass to the purchaser upon
          carrier handoff. Detailed terms governing transactions are set out
          in <span className="text-ink">VRT-STD-005 · Payment policy</span>.
        </p>
      </DocSection>

      <DocSection number="05" title="Research use only">
        <p>
          All material supplied is for in-vitro laboratory research only. It is
          not a drug, food, cosmetic, or dietary supplement. It is not for
          human or veterinary consumption and is not intended to diagnose,
          treat, cure, or prevent any disease. Full positioning is set out in
          <span className="text-ink"> VRT-STD-004 · Research use disclaimer</span>.
        </p>
      </DocSection>

      <DocSection number="06" title="Verification archive">
        <p>
          The verification archive is a public reference. Certificates retrieved
          from the archive are accurate as of release. The archive may not be
          reproduced, redistributed, or relabeled in a manner that suggests
          endorsement of any third-party product or claim.
        </p>
      </DocSection>

      <DocSection number="07" title="Intellectual property">
        <p>
          The VERATIS name, mark, archive layout, documentation, photography,
          and editorial materials are the property of VERATIS. Limited use for
          internal scientific reference and citation is permitted; commercial
          republication is not.
        </p>
      </DocSection>

      <DocSection number="08" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, VERATIS shall not be liable
          for indirect, incidental, or consequential damages arising from the
          use or misuse of any material supplied. Aggregate liability is
          limited to the amount paid for the lot at issue.
        </p>
      </DocSection>

      <DocSection number="09" title="Indemnification">
        <p>
          The purchaser agrees to indemnify and hold VERATIS harmless from any
          claim arising from use of supplied material in a manner inconsistent
          with its research-only positioning or applicable law.
        </p>
      </DocSection>

      <DocSection number="10" title="Governing law & disputes">
        <p>
          These terms are governed by the laws of the jurisdiction in which
          VERATIS is organized, without regard to conflict-of-law provisions.
          Disputes shall be resolved by binding arbitration where permitted,
          otherwise in the courts of that jurisdiction. Specific venue is
          recorded in the published company filings.
        </p>
      </DocSection>

      <DocSection number="11" title="Revisions">
        <p>
          These terms may be revised. Material revisions are reflected in the
          revision number and updated date at the top of this document.
          Continued use of the site after a revision constitutes acceptance.
        </p>
      </DocSection>
    </LegalDoc>
  );
}