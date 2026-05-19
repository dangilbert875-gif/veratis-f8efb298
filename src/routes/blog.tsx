import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import lab from "@/assets/lab.jpg";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Education — VERATIS" },
      { name: "description", content: "Reference articles on peptide handling, storage, reconstitution, and laboratory best practice." },
      { property: "og:title", content: "Education — Reference library for peptide handling" },
      { property: "og:description", content: "Practical, peer-reviewed-style notes on HPLC purity, reconstitution protocols, cold storage, and reading a COA." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/blog" },
    ],
  }),
  component: Blog,
});

const posts = [
  { t: "Understanding HPLC purity readings", c: "Method", r: "6 min read", e: "What 99.4% actually measures — and what it deliberately leaves out of the result." },
  { t: "Reconstitution: a step-by-step protocol", c: "Protocol", r: "8 min read", e: "Bacteriostatic water, sterile technique, and the small details that protect your batch." },
  { t: "Cold storage for lyophilized peptides", c: "Storage", r: "5 min read", e: "Why −20 °C matters, when −80 °C is overkill, and how to plan a defrost cycle." },
  { t: "Reading a certificate of analysis", c: "Reference", r: "7 min read", e: "Every section of a COA explained — and the red flags to refuse a lot over." },
  { t: "Mass spec for peptide identity", c: "Method", r: "9 min read", e: "How mass spectrometry confirms the molecule in the vial matches the molecule on the label." },
  { t: "Best practice for in-vitro experiments", c: "Protocol", r: "10 min read", e: "Controls, replicates, and the documentation habits that make results defensible." },
];

function Blog() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Education"
        title="Reference library."
        lead="Practical, peer-reviewed-style notes on peptide handling, storage, and laboratory protocol."
      />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Link to="/blog" className="grid md:grid-cols-2 gap-10 group items-center mb-20 border-b border-border pb-16">
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border">
            <img src={lab} alt="" loading="lazy" width={1536} height={1024} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-700" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Featured · Method</p>
            <h2 className="mt-4 text-3xl md:text-4xl text-ink">How we measure 99.4% — and why the fourth decimal matters.</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A walk through our HPLC method, from sample prep to the integrated peak. Plus, the failure modes we look for in every chromatogram.
            </p>
            <p className="mt-6 text-sm text-foreground/70">12 min read · April 2026</p>
          </div>
        </Link>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {posts.map((p) => (
            <article key={p.t} className="group">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary">{p.c}</p>
              <h3 className="mt-3 text-xl text-ink group-hover:text-primary transition">{p.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.e}</p>
              <p className="mt-4 text-xs text-muted-foreground">{p.r}</p>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}