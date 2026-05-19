import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { BatchVerify } from "@/components/site/BatchVerify";
import { ArchiveActivity } from "@/components/site/ArchiveActivity";
import { batches, labPartner, SAMPLE_LOT } from "@/data/batches";
import { ArrowRight, FlaskConical, Fingerprint, Archive, Link2 } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify Batch — VERATIS" },
      { name: "description", content: "Authenticate any VERATIS vial by its lot number. Retrieve the original certificate of analysis signed by an independent ISO 17025 laboratory." },
      { property: "og:title", content: "Verify Batch — VERATIS" },
      { property: "og:description", content: "Authenticate any VERATIS vial by its lot number." },
    ],
  }),
  component: Page,
});

function Page() {
  const stats = {
    count: batches.length,
    mean: (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2),
    lastRelease: batches[0].testedOn,
  };

  const trustItems = [
    "Independently assayed",
    "ISO 17025 accredited partner",
    "Batch-specific certificate",
    "Permanent, append-only archive",
    "QR-linked verification",
    "No recycled documents",
  ];

  const steps = [
    {
      n: "01",
      icon: Fingerprint,
      title: "Unique lot identifier",
      text: "Every release is assigned a permanent lot number printed on the vial label and the carton tamper seal.",
    },
    {
      n: "02",
      icon: FlaskConical,
      title: "Independent assay",
      text: `Samples are sent to ${labPartner.name} (${labPartner.iso}) for HPLC purity, ESI-MS identity, and LAL endotoxin testing.`,
    },
    {
      n: "03",
      icon: Archive,
      title: "Permanent archive",
      text: "The signed certificate is committed to an append-only archive — never overwritten, never recycled between batches.",
    },
    {
      n: "04",
      icon: Link2,
      title: "Public retrieval",
      text: "Anyone holding the lot identifier can retrieve the original certificate, anonymously, from any device.",
    },
  ];

  return (
    <Layout>
      {/* Dark verification terminal */}
      <section className="bg-ink text-background border-b border-background/10">
        <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-20 pb-20 md:pb-24">
          {/* Terminal status bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-background/55 border-b border-background/10 pb-4">
            <span className="inline-flex items-center gap-2.5">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              veratis-archive · verification terminal
            </span>
            <span className="tabular-nums hidden sm:inline">
              {stats.count} lots indexed · {stats.mean}% mean · partition 01
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 mt-10 md:mt-14">
            {/* Left rail — context */}
            <div className="lg:col-span-5 xl:col-span-4">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-primary/90 mb-5">
                — Verify batch · retrieval 1.2
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] text-background">
                Authenticate<br />your vial.
              </h1>
              <p className="mt-6 text-[14.5px] leading-[1.75] text-background/65 max-w-md">
                Every VERATIS vial leaves our facility with a unique lot identifier
                printed on the label and on the outer carton tamper seal. Enter the
                lot to retrieve its original certificate — signed, dated, and held
                in our permanent archive.
              </p>

              <ul className="mt-9 grid grid-cols-1 gap-y-2.5 max-w-md">
                {trustItems.map((t) => (
                  <li key={t} className="flex items-baseline gap-3 text-[12.5px] text-background/75">
                    <span className="font-mono text-[9.5px] tabular-nums tracking-[0.16em] text-primary/80 w-6">
                      ·
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <dl className="mt-10 grid grid-cols-2 gap-y-6 gap-x-6 max-w-md border-t border-background/10 pt-7">
                {[
                  ["0.8s", "Median lookup"],
                  [`${stats.mean}%`, "Mean HPLC purity"],
                  [stats.lastRelease, "Last release"],
                  [labPartner.iso, "Lab accreditation"],
                ].map(([v, k]) => (
                  <div key={k}>
                    <dt className="font-display text-[1.4rem] text-background leading-none tabular-nums tracking-[-0.01em]">
                      {v}
                    </dt>
                    <dd className="mt-2 text-[9.5px] font-mono uppercase tracking-[0.18em] text-background/45">
                      {k}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right — verification module */}
            <div className="lg:col-span-7 xl:col-span-8">
              <BatchVerify />
              <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-background/40 flex flex-wrap items-center justify-between gap-2">
                <span>Retrieved from permanent archive · revision 1.2</span>
                <span className="tabular-nums">Specimen lot · {SAMPLE_LOT}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How verification works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">
                — How verification works
              </p>
              <h2 className="font-display text-3xl md:text-[2.25rem] leading-[1.12] tracking-[-0.02em] text-ink">
                Four steps,<br />independently auditable.
              </h2>
              <p className="mt-5 text-[14.5px] text-muted-foreground leading-[1.75] max-w-sm">
                Verification is not a marketing artifact. Each step produces a
                document a third-party auditor could trace end-to-end.
              </p>
            </div>
            <ol className="md:col-span-8 grid sm:grid-cols-2 gap-px bg-border border border-border rounded-[3px] overflow-hidden">
              {steps.map(({ n, icon: Icon, title, text }) => (
                <li key={n} className="bg-background p-7 md:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] tabular-nums uppercase tracking-[0.2em] text-primary">
                      {n}
                    </span>
                    <Icon size={15} strokeWidth={1.5} className="text-foreground/40" />
                  </div>
                  <h3 className="mt-5 font-display text-[1.1rem] text-ink leading-snug">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-[1.7]">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Live archive feed */}
      <ArchiveActivity />

      {/* Counterfeit / contact note */}
      <section className="mx-auto max-w-3xl px-6 py-20 md:py-24 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">If your lot is not found</p>
        <h2 className="mt-3 font-display text-2xl md:text-3xl text-ink tracking-[-0.01em]">
          Counterfeits exist. We help you check.
        </h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          If a lot does not resolve, the vial was not produced by VERATIS — or it
          was tampered with after dispatch. Send us a photo of the label and we
          will help you trace it.
        </p>
        <Link
          to="/contact"
          className="mt-7 inline-flex items-center gap-2 bg-ink text-background px-6 py-3.5 rounded-[3px] text-[12px] font-medium uppercase tracking-[0.16em] hover:bg-ink/90 transition"
        >
          Report a suspicious vial <ArrowRight size={15} />
        </Link>
        <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/40">
          {labPartner.iso} · {labPartner.accreditation} · {labPartner.city}
        </p>
      </section>
    </Layout>
  );
}
