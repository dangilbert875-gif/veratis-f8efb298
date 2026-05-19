import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, DocSection, DocList } from "@/components/site/LegalDoc";

export const Route = createFileRoute("/payment-policy")({
  head: () => ({
    meta: [
      { title: "Payment Policy — VERATIS" },
      { name: "description", content: "Accepted payment methods, transaction security, fraud prevention, and refund handling for the VERATIS ordering system." },
      { property: "og:title", content: "Payment Policy — VERATIS" },
      { property: "og:description", content: "Encrypted checkout, billing verification, declined transactions, and refund processing standards." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/payment-policy" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc
      eyebrow="Standards"
      title="Payment policy."
      lead="The standards that govern checkout, billing verification, and refund handling for orders placed through the VERATIS platform."
      meta={{ reference: "VRT-STD-005", revision: "1.1", updated: "May 2026" }}
    >
      <DocSection number="01" title="Accepted payment methods">
        <p>
          VERATIS accepts the following instruments at checkout. Payment is
          settled in United States dollars.
        </p>
        <DocList
          items={[
            ["Cards", "Visa, Mastercard, American Express, Discover"],
            ["Bank", "ACH / domestic wire (order held until clearance)"],
            ["Digital asset", "Bitcoin, on-chain settlement"],
            ["Currency", "USD only"],
          ]}
        />
      </DocSection>

      <DocSection number="02" title="Transaction security">
        <p>
          The checkout is served over TLS. Card data is collected directly by
          our PCI-DSS compliant processor and is never transmitted through or
          stored on VERATIS infrastructure. We receive only a tokenized
          authorization reference and the last four digits of the instrument
          for reconciliation.
        </p>
      </DocSection>

      <DocSection number="03" title="Billing verification">
        <p>
          Orders are screened on submission. Billing address, AVS, and CVV
          must match the issuing bank's records. Mismatches result in
          decline. For higher-value orders we may request additional
          verification before dispatch; in such cases the order is held, not
          captured, until verification is complete.
        </p>
      </DocSection>

      <DocSection number="04" title="Fraud prevention">
        <p>
          Transactions are scored against device, network, and behavioral
          signals. Orders flagged at high risk are held pending review. Orders
          confirmed as fraudulent are voided prior to capture and reported to
          the relevant networks.
        </p>
      </DocSection>

      <DocSection number="05" title="Declined transactions">
        <p>
          A declined transaction is not a hold against the customer. If your
          issuer reports a soft decline, please retry once or contact your
          issuer. Repeated declines from the same account may trigger a
          temporary block to protect against testing activity.
        </p>
      </DocSection>

      <DocSection number="06" title="Refunds">
        <p>
          Refunds are issued to the original payment instrument. Card refunds
          typically post within five to ten business days; ACH and wire
          refunds within five business days; digital-asset refunds are
          returned to the originating wallet, net of network fees.
          Conditions under which refunds are issued are set out in
          <span className="text-ink"> VRT-STD-003 · Shipping & returns</span>.
        </p>
      </DocSection>

      <DocSection number="07" title="Chargebacks">
        <p>
          Before initiating a chargeback, contact{" "}
          <span className="text-primary">billing@veratisbio.com</span>. Almost
          every billing question is resolved within one business day. We
          respond to all chargebacks with order, dispatch, and signed
          certificate documentation from the verification archive.
        </p>
      </DocSection>

      <DocSection number="08" title="Currency & taxes">
        <p>
          All amounts are quoted and settled in United States dollars. Taxes,
          where applicable, are calculated at checkout based on the shipping
          address. Customers are responsible for any local levies that apply
          on receipt.
        </p>
      </DocSection>
    </LegalDoc>
  );
}