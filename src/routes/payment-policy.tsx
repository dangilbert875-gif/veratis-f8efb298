import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, DocSection, DocList } from "@/components/site/LegalDoc";

export const Route = createFileRoute("/payment-policy")({
  head: () => ({
    meta: [
      { title: "Payment Policy — VERATIS" },
      { name: "description", content: "Bitcoin-only settlement standards, invoice handling, refund routing, and fraud prevention for the VERATIS ordering system." },
      { property: "og:title", content: "Payment Policy — VERATIS" },
      { property: "og:description", content: "Encrypted checkout, on-chain settlement, invoice validity, and refund routing standards." },
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
      lead="The standards that govern checkout, on-chain settlement, invoice validity, and refund routing for orders placed through the VERATIS platform."
      meta={{ reference: "VRT-STD-005", revision: "1.2", updated: "May 2026" }}
    >
      <DocSection number="01" title="Accepted payment methods">
        <p>
          VERATIS currently settles orders using Bitcoin only. Prices are
          quoted in United States dollars and converted to BTC at the
          checkout conversion rate held for the duration of the invoice.
        </p>
        <DocList
          items={[
            ["Network", "Bitcoin (BTC)"],
            ["Settlement", "On-chain settlement"],
            ["Currency", "USD pricing · BTC settled at checkout conversion rate"],
            ["Confirmation", "Orders release after network confirmation threshold"],
          ]}
        />
      </DocSection>

      <DocSection number="02" title="Transaction security">
        <p>
          The checkout environment is served over encrypted TLS connections.
          A unique wallet address and settlement request are generated for
          each order session and bound to that invoice. VERATIS does not
          custody customer financial accounts and does not collect or store
          cardholder data. Inbound settlements are matched to the originating
          invoice and verified against the network confirmation threshold
          before the order is released for fulfilment.
        </p>
      </DocSection>

      <DocSection number="03" title="Order screening">
        <p>
          Orders may be reviewed for duplicate submissions, automated abuse
          patterns, high-risk routing activity, or inconsistent order
          metadata prior to release. Where review is required, the order is
          held against its invoice until screening is complete; settlement
          already received remains attributed to the order throughout.
        </p>
      </DocSection>

      <DocSection number="04" title="Fraud prevention">
        <p>
          Submissions are evaluated against device, network, and behavioral
          signals, with additional checks for duplicate orders, automated
          abuse patterns, and transaction anomalies. Orders identified as
          high-risk are held pending review and, where appropriate, the
          associated invoice is cancelled before settlement.
        </p>
      </DocSection>

      <DocSection number="05" title="Expired & underpaid invoices">
        <p>
          If settlement is not received within the invoice validity window,
          the order request expires automatically and inventory is released
          back into allocation. Underpaid invoices, transactions submitted on
          an unsupported network, or settlements pending beyond the
          confirmation threshold are queued for manual reconciliation;
          customers are contacted at the address provided at checkout.
        </p>
      </DocSection>

      <DocSection number="06" title="Refunds">
        <p>
          Approved refunds are returned to the originating wallet address
          or to another verified customer-provided address, net of any
          applicable network fees. Refund value is calculated in United
          States dollars at the time of approval and settled in BTC at the
          prevailing conversion rate.
          Conditions under which refunds are issued are set out in
          <span className="text-ink"> VRT-STD-003 · Shipping & returns</span>.
        </p>
      </DocSection>

      <DocSection number="07" title="Chargebacks">
        <p>
          Before initiating a chargeback, contact{" "}
          <span className="text-primary">support@veratisbio.com</span>. Almost
          every billing question is resolved within one business day. Because
          Bitcoin settlements are final at the network layer, on-chain
          transactions are not reversible; disputes are handled through
          direct correspondence and resolved with order, dispatch, and
          signed certificate documentation from the verification archive.
        </p>
      </DocSection>

      <DocSection number="08" title="Currency & taxes">
        <p>
          All amounts are quoted in United States dollars and settled in
          Bitcoin at the checkout conversion rate. Taxes, where applicable,
          are calculated at checkout based on the shipping address and
          included in the invoice total. Customers are responsible for any
          local levies that apply on receipt.
        </p>
      </DocSection>
    </LegalDoc>
  );
}