import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, DocSection, DocList } from "@/components/site/LegalDoc";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — VERATIS" },
      { name: "description", content: "Shipping rates, transit times, and our straightforward return policy. Currently shipping within the continental United States only." },
      { property: "og:title", content: "Shipping & Returns — VERATIS" },
      { property: "og:description", content: "Cold-chain insulated dispatch within 48 hours within the continental US. Free shipping over $150. 14-day return window on unopened vials." },
      { property: "og:url", content: "https://veratisbio.com/shipping-returns" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/shipping-returns" }],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc
      eyebrow="Standards"
      title="Shipping & returns."
      lead="Cold-chain handling, dispatch windows, and the conditions under which VERATIS replaces or refunds a shipment."
      meta={{ reference: "VRT-STD-003", revision: "1.4", updated: "May 2026" }}
    >
      <DocSection number="01" title="Processing & dispatch">
        <p>
          Orders placed before 2pm ET ship the same business day. All orders
          are dispatched within 48 hours from our temperature-controlled
          facility. A tracking reference is issued on dispatch.
        </p>
      </DocSection>

      <DocSection number="02" title="Where we ship">
        <p>
          VERATIS currently ships only within the{" "}
          <span className="text-ink">continental United States</span> (the
          lower 48 states). We do not ship to Alaska, Hawaii, US territories,
          APO/FPO addresses, or internationally at this time. Expanded
          coverage will be announced as additional cold-chain corridors are
          validated.
        </p>
      </DocSection>

      <DocSection number="03" title="Shipping rates">
        <DocList
          items={[
            ["Standard", "Continental US · 3–5 business days · $9.50"],
            ["Express", "Continental US · 1–2 business days · $24.00"],
            ["Free", "Continental US orders $150 and above"],
          ]}
        />
      </DocSection>

      <DocSection number="04" title="Cold-chain handling">
        <p>
          Every order ships in an insulated mailer with cold packs sized for
          the transit window. Packaging is plain and unmarked. Lyophilized
          vials are stable through standard ground transit windows; cold
          packs are a precaution, not a requirement for stability.
        </p>
      </DocSection>

      <DocSection number="05" title="Address accuracy">
        <p>
          The purchaser is responsible for providing a complete and accurate
          delivery address. Re-routing, address correction fees, or
          re-shipment for an undeliverable package are billed to the
          purchaser at carrier cost.
        </p>
      </DocSection>

      <DocSection number="06" title="Carrier delays">
        <p>
          Once a shipment is handed to the carrier, transit is outside our
          direct control. We monitor every dispatched lot and will assist in
          escalating delayed shipments with the carrier.
        </p>
      </DocSection>

      <DocSection number="07" title="Lost or damaged shipments">
        <p>
          If a package arrives visibly damaged or is lost in transit, email{" "}
          <span className="text-primary">support@veratisbio.com</span> within
          seven days of the expected delivery date with the order reference
          and, where applicable, photographs of the outer packaging. We will
          replace or refund the affected lot once the claim is documented.
        </p>
      </DocSection>

      <DocSection number="08" title="Returns">
        <p>
          Unopened vials with intact seal and label may be returned within
          fourteen days of delivery for a refund of the lot value, less
          outbound shipping. Opened vials cannot be returned to the archive
          and are not eligible for refund except under the specification
          clause below.
        </p>
      </DocSection>

      <DocSection number="09" title="Specification failure">
        <p>
          If a dispatched lot fails to meet the published certificate of
          analysis on receipt, contact us within thirty days. We will
          replace the lot or refund the purchase in full, including return
          shipping, after independent verification.
        </p>
      </DocSection>

      <DocSection number="10" title="Research material handling">
        <p>
          On receipt, vials should be stored at −20°C, protected from light,
          and handled by qualified laboratory personnel only. Refer to{" "}
          <span className="text-ink">VRT-STD-004 · Research use disclaimer</span>{" "}
          for the full positioning of supplied material.
        </p>
      </DocSection>
    </LegalDoc>
  );
}