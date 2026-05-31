import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import travertineWall from "@/assets/travertine-wall.jpg";
import heroArchive from "@/assets/hero-archive.jpg";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Veratis" },
      { name: "description", content: "Veratis was built around a single principle: do not ask for trust, provide proof. Independent testing, lot archiving, public retrieval." },
      { property: "og:title", content: "About — Veratis" },
      { property: "og:description", content: "Don't trust us. Verify for yourself. Every lot independently tested, archived, and publicly retrievable." },
      { property: "og:url", content: "https://veratisbio.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/about" }],
  }),
  component: About,
});

function About() {
  return (
    <Layout>
      {/* SECTION 1 — Manifesto */}
      <section className="relative bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-36 pb-20 md:pb-28 grid md:grid-cols-12 gap-y-12 md:gap-x-12">
          <div className="md:col-span-7">
            <p className="eyebrow">The Principle</p>
            <h1 className="mt-6 font-display text-[2.6rem] sm:text-[3.4rem] md:text-[4.5rem] leading-[1.02] tracking-[-0.018em] text-ink">
              Don't trust us.<br />
              <span className="italic font-light">Verify for yourself.</span>
            </h1>
            <p className="mt-8 max-w-xl text-[15.5px] md:text-[17px] leading-[1.7] text-foreground/70 font-light">
              Veratis was built around a single principle. Do not ask for
              trust. Provide proof. Every compound is independently tested,
              every lot is archived, and every certificate is publicly
              retrievable for the lifetime of the product.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-[3px] border border-border">
              <img
                src={travertineWall}
                alt="Veratis archive surface"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — How Veratis Works */}
      <section className="bg-mist/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-y-10 md:gap-x-12 items-end mb-14 md:mb-20">
            <div className="md:col-span-7">
              <p className="eyebrow">How Veratis Works</p>
              <h2 className="mt-5 font-display text-[2rem] md:text-[3rem] leading-[1.05] tracking-[-0.014em] text-ink">
                Four steps from synthesis<br />
                <span className="italic font-light">to your vial.</span>
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-[14.5px] leading-[1.75] text-foreground/65 font-light max-w-md">
                A single workflow governs every compound we release. No
                exceptions, no representative samples, no recycled paperwork.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-[3px] overflow-hidden border border-border">
            {[
              { n: "01", t: "Independent testing", b: "Every lot is sent to an ISO 17025 accredited laboratory for identity and purity testing." },
              { n: "02", t: "Lot archiving", b: "Each result is signed, archived, and tied to a unique lot number — never a representative sample." },
              { n: "03", t: "QR verification", b: "Every vial and carton carries the lot identifier needed to retrieve its certificate." },
              { n: "04", t: "Public retrieval", b: "Certificates remain publicly retrievable for the lifetime of the product, without an account." },
            ].map((s) => (
              <li key={s.n} className="bg-background p-7 md:p-8 flex flex-col">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-foreground/45">
                  {s.n}
                </span>
                <h3 className="mt-5 font-display text-[1.4rem] md:text-[1.55rem] tracking-[-0.01em] text-ink leading-tight">
                  {s.t}
                </h3>
                <p className="mt-4 text-[13.5px] leading-[1.7] text-foreground/65 font-light">
                  {s.b}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SECTION 3 — Verification standards */}
      <section className="bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-12 gap-y-14 md:gap-x-12">
          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-[3px] border border-border">
              <img
                src={heroArchive}
                alt="Veratis verification archive"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7 md:pl-4">
            <p className="eyebrow">Verification Standards</p>
            <h2 className="mt-5 font-display text-[2rem] md:text-[3rem] leading-[1.05] tracking-[-0.014em] text-ink">
              What we test.<br />
              <span className="italic font-light">What we document.</span>
            </h2>

            <dl className="mt-10 divide-y divide-border border-y border-border">
              {[
                ["Identity testing", "Mass spectrometry confirms the compound is exactly what the label states."],
                ["Purity testing", "Reverse-phase HPLC quantifies purity and detects related impurities."],
                ["Lot-level documentation", "Every certificate is bound to a single lot number. Never representative, never recycled."],
                ["Permanent archive", "Documents remain in the public archive for the lifetime of the product."],
              ].map(([k, v]) => (
                <div key={k} className="py-6 grid grid-cols-12 gap-x-6 items-baseline">
                  <dt className="col-span-12 md:col-span-4 text-[11px] font-mono uppercase tracking-[0.22em] text-foreground/55">
                    {k}
                  </dt>
                  <dd className="mt-1 md:mt-0 col-span-12 md:col-span-8 text-[14.5px] leading-[1.75] text-ink font-light">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* SECTION 4 — The Veratis Standard */}
      <section className="relative bg-ink text-background overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url(${travertineWall})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40 text-center">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.32em] text-background/55">
            The Veratis Standard
          </p>
          <h2 className="mt-8 font-display text-[2.6rem] sm:text-[3.6rem] md:text-[5rem] leading-[1.04] tracking-[-0.018em] text-background">
            Every lot.<br />
            Every time.<br />
            <span className="italic font-light">Publicly verifiable.</span>
          </h2>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[2px] bg-background text-ink text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-background/90 transition"
            >
              <ShieldCheck size={12} strokeWidth={1.5} />
              Verify a lot
              <ArrowRight size={11} />
            </Link>
            <Link
              to="/coa-archive"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[2px] border border-background/35 text-background text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-background/10 transition"
            >
              Browse the archive
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}