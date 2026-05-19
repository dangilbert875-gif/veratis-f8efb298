import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import lab from "@/assets/lab.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Pure Peptide" },
      { name: "description", content: "Pure Peptide manufactures research-grade peptides with verified purity and full documentation." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Layout>
      <PageHeader
        eyebrow="About"
        title="A laboratory, not a marketplace."
        lead="Pure Peptide was founded by chemists who were tired of suppliers shipping mystery vials. We do one thing — and we document it."
      />
      <section className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <p className="text-lg leading-relaxed text-foreground/85">
            Every peptide we sell is synthesized in cGMP facilities, characterized by mass spectrometry, and assayed for purity by HPLC. We then send each lot to an independent ISO 17025 accredited laboratory for an additional verification — and we publish the result.
          </p>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            That extra step is the whole company. The COA you download is tied to the exact vial you receive — never a representative sample, never a recycled certificate.
          </p>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            We ship from a temperature-controlled facility in the United States, with insulation and cold packs sized for the transit window. Most orders leave the bench within 48 hours.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="aspect-[4/5] rounded-xl overflow-hidden border border-border">
            <img src={lab} alt="Lab" loading="lazy" width={1536} height={1024} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-mist/50">
        <div className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-3 gap-10">
          {[
            ["2019", "Founded by analytical chemists"],
            ["12", "ISO 17025 lab partners worldwide"],
            ["240k+", "Vials shipped with batch COAs"],
          ].map(([v, k]) => (
            <div key={k}>
              <p className="text-4xl text-ink font-display">{v}</p>
              <p className="mt-2 text-sm text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}