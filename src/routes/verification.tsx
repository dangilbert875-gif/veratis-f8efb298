import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { batches, labPartner } from "@/data/batches";
import { ShieldCheck, FlaskConical, Beaker, FileText, Archive, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "How we verify every lot. VERATIS" },
      { name: "description", content: "Plain-language explanation of how VERATIS verifies every research-peptide lot. independent testing by Janoshik Labs, what each COA covers, retention, and the permanent archive." },
      { property: "og:title", content: "How we verify every lot. VERATIS" },
      { property: "og:description", content: "Independent ISO 17025 testing, what every certificate of analysis covers, lot retention, and the permanent public archive." },
      { property: "og:url", content: "https://veratisbio.com/verification" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/verification" }],
  }),
  component: VerificationPage,
});

function VerificationPage() {
  const lots = batches.length;
  const avg = lots ? (batches.reduce((s, b) => s + b.purity, 0) / lots).toFixed(2) : "99.25";
  return (
    <Layout>
      <PageHeader
        eyebrow="Verification"
        title="How we verify every lot."
        lead="Every vial we ship is independently tested, signed, and archived. This page explains what that means in plain language. who tests, what the certificate covers, how long samples are retained, and what the archive guarantees."
      />

      <section className="mx-auto max-w-5xl px-6 -mt-4 pb-12">
        <div className="grid grid-cols-3 border border-border rounded-[3px] overflow-hidden bg-background">
          {[
            [String(lots), "Lots on record"],
            [`${avg}%`, "Mean purity"],
            ["100%", "Independently assayed"],
          ].map(([v, k], i) => (
            <div key={k} className={`px-5 py-6 ${i > 0 ? "border-l border-border" : ""}`}>
              <p className="text-2xl md:text-3xl font-display text-ink tabular-nums">{v}</p>
              <p className="mt-1 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">{k}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 space-y-16">
        <Block
          icon={ShieldCheck}
          eyebrow="The lab"
          title={`Who is ${labPartner.name}?`}
          body={[
            `${labPartner.name} is an independent analytical laboratory based in ${labPartner.city}, accredited to ${labPartner.iso} (${labPartner.accreditation}). They are not a VERATIS subsidiary, partner-with-equity, or in-house QA team.`,
            "ISO/IEC 17025 is the international standard for the competence of testing and calibration laboratories. Accreditation means an external body has audited the lab's methods, equipment calibration, staff competency, and result-reporting procedures.",
            "Every lot we release is shipped to them blind: they receive the vial, run the assays, and return a signed certificate. We publish the result, whether or not it confirms the spec.",
          ]}
        />

        <Block
          icon={FlaskConical}
          eyebrow="The certificate"
          title="What each COA actually tests for"
          body={[
            "A certificate of analysis (COA) is the per-lot lab report. Every VERATIS COA reports on the same set of analytes so you can compare lots apples-to-apples.",
          ]}
        >
          <ul className="mt-5 border border-border rounded-[3px] divide-y divide-border bg-background">
            {[
              ["Identity (ESI-MS)", "Confirms the molecular mass matches the declared sequence. Rules out the wrong peptide being shipped."],
              ["Purity (RP-HPLC)", "Reversed-phase HPLC quantifies the main peak as a percentage of total UV-absorbing material. We publish the chromatogram."],
              ["Endotoxin (LAL)", "Limulus amebocyte lysate assay quantifies bacterial endotoxin in EU/mg. Reported below 0.5 EU/mg on every released lot."],
              ["Water content (KF)", "Karl Fischer titration measures residual moisture in the lyophilized cake. relevant for stability."],
              ["Appearance", "Visual inspection of the lyophilized cake (color, uniformity, evidence of collapse)."],
              ["Sterility (optional)", "USP <71> sterility testing is available on request for in-vitro studies that require it."],
            ].map(([k, v]) => (
              <li key={k as string} className="grid grid-cols-[160px_1fr] gap-4 px-5 py-4 text-[12.5px]">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-foreground/55 self-start pt-0.5">{k}</span>
                <span className="text-foreground/85 leading-relaxed">{v}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          icon={Beaker}
          eyebrow="Retention"
          title="How lot retention works"
          body={[
            "When a lot is released, we set aside a sealed retention sample from the same vial population that you receive. The sample is stored at –20 °C, under nitrogen, in the same conditions as the shipped product.",
            "Retention samples are held for the full labeled shelf life of the lot (typically 24 months from release). If a customer ever has a question about an older lot. a result they want to confirm, a stability question, a regulatory query. we can pull and re-test the retention sample.",
            "This is the single most important sanity check on a research-grade supplier: it means the COA is not a one-time marketing document; it's a falsifiable record we are prepared to defend later.",
          ]}
        />

        <Block
          icon={Archive}
          eyebrow="The archive"
          title="What the permanent archive guarantees"
          body={[
            "Every COA we ever publish stays online for the life of the lot, at a permanent URL keyed by the lot number. We do not silently replace, edit, or unpublish documents.",
            "If we ever need to amend a result, we publish the amendment alongside the original and date both. the original is never removed. This means a researcher can cite a lot in their methods section and the link will still resolve years later.",
          ]}
        >
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/coa-archive"
              className="inline-flex items-center gap-2 h-11 px-5 border border-ink/20 rounded-[3px] text-[11px] font-medium uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-background transition"
            >
              Browse the COA archive <ArrowRight size={13} />
            </Link>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 h-11 px-5 border border-border rounded-[3px] text-[11px] font-mono uppercase tracking-[0.18em] text-foreground/75 hover:text-ink hover:border-ink/40 transition"
            >
              <FileText size={12} /> Verify a specific lot
            </Link>
          </div>
        </Block>
      </section>

      <section className="border-t border-border bg-mist/30">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">Research use disclosure</p>
          <p className="mt-3 text-[13.5px] text-muted-foreground leading-relaxed">
            All VERATIS products are sold strictly for in-vitro laboratory and research applications. Not for human or veterinary consumption. Not for diagnostic or therapeutic use.
          </p>
        </div>
      </section>
    </Layout>
  );
}

function Block({
  icon: Icon,
  eyebrow,
  title,
  body,
  children,
}: {
  icon: any;
  eyebrow: string;
  title: string;
  body: string[];
  children?: React.ReactNode;
}) {
  return (
    <article>
      <div className="flex items-center gap-3">
        <Icon size={18} strokeWidth={1.5} className="text-ink/70" />
        <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">{eyebrow}</p>
      </div>
      <h2 className="mt-3 font-display text-2xl md:text-[1.75rem] text-ink tracking-tight leading-tight">{title}</h2>
      <div className="mt-5 space-y-4 text-[14.5px] text-muted-foreground leading-relaxed">
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {children}
    </article>
  );
}