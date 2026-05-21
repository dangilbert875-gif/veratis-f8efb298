import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, DocSection } from "@/components/site/LegalDoc";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VERATIS" },
      { name: "description", content: "How VERATIS collects, processes, and retains customer information across the verification archive and ordering system." },
      { property: "og:title", content: "Privacy Policy — VERATIS" },
      { property: "og:description", content: "Customer information handling, analytics, payment processing, and data retention standards for the VERATIS verification platform." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/privacy" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalDoc
      eyebrow="Standards"
      title="Privacy policy."
      lead="How VERATIS collects, processes, and retains information across the verification archive, ordering system, and customer communications."
      meta={{ reference: "VRT-STD-001", revision: "1.2", updated: "May 2026" }}
    >
      <DocSection number="01" title="Information we collect">
        <p>
          We collect only the information required to fulfill an order, maintain
          the verification archive, and operate the site. This includes account
          identifiers, shipping and billing address, email address, order history,
          and device-level analytics such as IP address, browser type, and pages
          viewed.
        </p>
        <p>
          We do not collect government identifiers, financial account numbers,
          health information, or any personally identifiable information beyond
          what is necessary to dispatch a research vial.
        </p>
      </DocSection>

      <DocSection number="02" title="Cookies & analytics">
        <p>
          The site uses a minimal set of first-party cookies to maintain cart
          state, session continuity, and age-gate acknowledgement. Aggregate
          analytics are used to measure traffic patterns and improve the archive.
          Individual users are not profiled, sold, or shared with advertising
          networks.
        </p>
      </DocSection>

      <DocSection number="03" title="Order & verification data">
        <p>
          Order records — including lot numbers dispatched, shipment tracking,
          and certificate retrievals — are retained as part of the operational
          archive. Lot-level certificate data is public; the customer record
          associated with a dispatched lot is not.
        </p>
      </DocSection>

      <DocSection number="04" title="Payment handling">
        <p>
          Payment instruments are never stored on VERATIS infrastructure. All
          card, ACH, and digital-asset payments are tokenized and processed by
          PCI-DSS compliant processors. VERATIS receives only an authorization
          confirmation and the last four digits of the instrument for
          reconciliation.
        </p>
      </DocSection>

      <DocSection number="05" title="Email communication">
        <p>
          We send transactional email for order confirmation, dispatch, lot
          retrieval receipts, and customer-support replies. Optional release
          notes — new lot announcements, method updates — are opt-in only and
          can be unsubscribed from in a single click.
        </p>
      </DocSection>

      <DocSection number="06" title="Security practices">
        <p>
          All traffic to and from the site is TLS-encrypted. Customer records
          are stored in access-controlled systems with audit logging. Lot
          certificates carry a cryptographic signature from the issuing
          laboratory and are validated on retrieval.
        </p>
      </DocSection>

      <DocSection number="07" title="Third-party processors">
        <p>
          We share information only with processors required to operate the
          service: payment processors, shipping carriers, transactional email,
          fraud prevention, and our independent ISO 17025 laboratory partner
          for lot-level documentation. No customer data is sold.
        </p>
      </DocSection>

      <DocSection number="08" title="Data retention">
        <p>
          Order and shipping records are retained for seven years to satisfy
          accounting and traceability obligations. Verification archive entries
          are retained permanently. Marketing preferences are retained until
          revoked. Customers may request deletion of their account record at
          any time, subject to retention required by law.
        </p>
      </DocSection>

      <DocSection number="09" title="Your rights">
        <p>
          You may request a copy of the personal information we hold about you,
          request a correction, or request deletion. Requests are answered
          within thirty days. To make a request, contact{" "}
          <span className="text-primary">support@veratisbio.com</span>.
        </p>
      </DocSection>

      <DocSection number="10" title="Contact">
        <p>
          Privacy inquiries: <span className="text-primary">support@veratisbio.com</span>
          <br />
          General inquiries: <span className="text-primary">support@veratisbio.com</span>
        </p>
      </DocSection>
    </LegalDoc>
  );
}