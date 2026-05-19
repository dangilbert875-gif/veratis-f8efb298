import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { BatchVerify } from "@/components/site/BatchVerify";
import { labPartner } from "@/data/batches";
import { ShieldCheck, QrCode, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify Batch — Pure Peptide" },
      { name: "description", content: "Authenticate any Pure Peptide vial by its lot number. Retrieve the original certificate of analysis signed by an independent ISO 17025 laboratory." },
      { property: "og:title", content: "Verify Batch — Pure Peptide" },
      { property: "og:description", content: "Authenticate any Pure Peptide vial by its lot number." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Verify batch"
        title="Authenticate your vial."
        lead="Every Pure Peptide vial leaves our facility with a unique lot identifier printed on the label and on the outer carton tamper seal. Enter that lot to retrieve the original certificate, signed and dated by an independent ISO 17025 laboratory."
      />
      <section className="mx-auto max-w-3xl px-6 -mt-10 md:-mt-14 pb-20">
        <BatchVerify />
      </section>

      <section className="border-t border-border bg-mist/40">
        <div className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {[
            { icon: QrCode, title: "Scan or type", text: "Use the QR on the carton's tamper seal or enter the lot manually. Both resolve to the same archive entry." },
            { icon: ShieldCheck, title: "Independent record", text: `Results are pulled from ${labPartner.name}, an ${labPartner.iso} accredited laboratory (${labPartner.accreditation}).` },
            { icon: FileText, title: "Permanent archive", text: "COAs remain available for the lifetime of the lot — never overwritten, never recycled between batches." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-background p-8">
              <Icon size={22} className="text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">If your lot is not found</p>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">Counterfeits exist. We help you check.</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          If a lot does not resolve, the vial was not produced by Pure Peptide — or it was tampered with after dispatch. Send us a photo of the label and we will help you trace it.
        </p>
        <Link to="/contact" className="mt-7 inline-flex items-center gap-2 bg-ink text-background px-6 py-3.5 rounded-md text-sm font-medium hover:bg-ink/90 transition">
          Report a suspicious vial <ArrowRight size={15} />
        </Link>
      </section>
    </Layout>
  );
}
