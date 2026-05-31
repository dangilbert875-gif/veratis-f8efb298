import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { labPartner } from "@/data/batches";
import { usePublicLots } from "@/lib/use-lots";
import { Search, Download, ShieldCheck, ArrowUpDown, ArrowRight, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadCoa, coaExtension } from "@/lib/coa";

export const Route = createFileRoute("/coa-archive")({
  head: () => ({
    meta: [
      { title: "COA Archive. VERATIS" },
      { name: "description", content: "Searchable archive of every certificate of analysis ever issued for a VERATIS lot. Public, permanent, never recycled." },
      { property: "og:title", content: "COA Archive. VERATIS" },
      { property: "og:description", content: "Searchable archive of every certificate of analysis ever issued for a VERATIS lot." },
      { property: "og:url", content: "https://veratisbio.com/coa-archive" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/coa-archive" }],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"date" | "purity">("date");
  const { batches, loading } = usePublicLots();

  const filtered = useMemo(() => {
    const list = batches.filter((b) => {
      const s = q.trim().toLowerCase();
      if (!s) return true;
      return (
        b.lot.toLowerCase().includes(s) ||
        b.product.toLowerCase().includes(s) ||
        b.slug.toLowerCase().includes(s)
      );
    });
    return list.sort((a, b) =>
      sort === "purity" ? b.purity - a.purity : b.testedOn.localeCompare(a.testedOn),
    );
  }, [q, sort, batches]);

  const avg = batches.length
    ? (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2)
    : ".";

  return (
    <Layout>
      {/* Hero: verification portal */}
      <section className="relative bg-mist/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32 pb-16 md:pb-20 grid md:grid-cols-12 gap-y-12 md:gap-x-12">
          <div className="md:col-span-7">
            <p className="eyebrow">The Archive</p>
            <h1 className="mt-6 font-display text-[2.6rem] sm:text-[3.2rem] md:text-[4.25rem] leading-[1.02] tracking-[-0.018em] text-ink">
              Verify the vial<br />
              <span className="italic font-light">in your hand.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[15px] md:text-[16px] leading-[1.7] text-foreground/70 font-light">
              Enter a lot number to retrieve the original certificate associated
              with that lot. Every Veratis certificate is signed by{" "}
              {labPartner.name} and remains in the archive for the life of the
              product.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-9 flex items-center gap-2 max-w-lg h-14 p-1.5 rounded-[3px] border border-ink/20 bg-background focus-within:border-ink/55 transition"
              role="search"
            >
              <Search size={15} className="ml-3 text-foreground/50" />
              <input
                aria-label="Search lot number"
                value={q}
                onChange={(e) => setQ(e.target.value.toUpperCase())}
                placeholder="PP-XXXX"
                className="flex-1 min-w-0 bg-transparent px-2 font-mono text-[13.5px] tracking-[0.06em] tabular-nums text-ink placeholder:text-foreground/35 focus:outline-none"
              />
              <Link
                to="/verify"
                search={(q.trim() ? ({ lot: q.trim() } as any) : undefined) as any}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[2px] bg-ink text-background text-[10.5px] font-medium uppercase tracking-[0.2em] hover:bg-ink/90 transition"
              >
                Retrieve <ArrowRight size={11} />
              </Link>
            </form>
            <p className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/50">
              Lot number is printed on every vial · cap and carton
            </p>
          </div>

          {/* Certificate preview card */}
          <div className="md:col-span-5">
            <div className="relative rounded-[3px] border border-ink/15 bg-background shadow-[0_30px_60px_-40px_rgba(15,23,42,0.35)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-mist/60 text-[9.5px] font-mono uppercase tracking-[0.22em] text-foreground/55">
                <span className="inline-flex items-center gap-2">
                  <FileText size={11} strokeWidth={1.5} />
                  Certificate of analysis
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--state-success)]" />
                  Released
                </span>
              </div>
              <div className="p-6 md:p-7">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55">
                  Lot
                </p>
                <p className="mt-1 font-mono text-[1.6rem] tabular-nums tracking-[0.06em] text-ink">
                  PP-2519
                </p>
                <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-5 text-[11px]">
                  {[
                    ["Compound", "BPC-157"],
                    ["Identity", "Confirmed"],
                    ["Purity", `${avg}%`],
                    ["Method", "RP-HPLC"],
                    ["Lab", labPartner.name],
                    ["Standard", labPartner.iso],
                  ].map(([k, v]) => (
                    <div key={k as string} className="min-w-0">
                      <p className="text-[9.5px] font-mono uppercase tracking-[0.2em] text-foreground/50">
                        {k}
                      </p>
                      <p className="mt-1 text-ink tabular-nums truncate">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-7 pt-5 border-t border-border flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/55">
                  <span>Signed · {labPartner.accreditation}</span>
                  <span className="inline-flex items-center gap-1.5 text-ink">
                    <ShieldCheck size={11} strokeWidth={1.5} />
                    Verified
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/45 text-right">
              Sample preview · representative of issued certificates
            </p>
          </div>
        </div>
      </section>

      {/* Operational rail */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/55">
          <div className="flex items-baseline gap-3">
            <span className="text-foreground/55">Lots on record</span>
            <span className="text-ink tabular-nums">{String(batches.length).padStart(3, "0")}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-foreground/55">Mean purity</span>
            <span className="text-ink tabular-nums">{avg}%</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-foreground/55">Pass rate · YTD</span>
            <span className="text-ink tabular-nums">100%</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-foreground/55">Assayed by</span>
            <span className="text-ink normal-case tracking-[0.04em] truncate">
              {labPartner.name}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow">Lot history</p>
            <h2 className="mt-3 font-display text-[1.9rem] md:text-[2.4rem] tracking-[-0.012em] text-ink leading-[1.05]">
              Every certificate, on the record.
            </h2>
          </div>
          <p className="max-w-sm text-[13.5px] text-muted-foreground leading-relaxed">
            Permanent. Public. Never recycled, never representative.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search COA archive by lot or product"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lot or product…"
              className="w-full h-11 pl-10 pr-3 rounded-[3px] border border-border bg-background text-[13.5px] text-ink placeholder:text-muted-foreground outline-none focus:border-ink/50 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSort((s) => (s === "date" ? "purity" : "date"))}
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] h-11 px-4 rounded-[3px] border border-border text-foreground/75 hover:text-ink hover:border-ink/35 transition"
            >
              <ArrowUpDown size={12} /> {sort === "date" ? "Most recent" : "Highest purity"}
            </button>
            <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/50 tabular-nums">
              {String(filtered.length).padStart(3, "0")} results
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 border border-border rounded-[3px] overflow-hidden bg-background">
          <div className="hidden md:grid grid-cols-[1fr_1.4fr_0.7fr_0.8fr_1fr_auto] text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/55 bg-mist/60 px-5 py-3.5 border-b border-border">
            <span>Lot</span><span>Product</span><span>Size</span><span>Purity</span><span>Tested</span><span></span>
          </div>
          {filtered.map((b) => (
            <div key={b.lot} className="md:grid md:grid-cols-[1fr_1.4fr_0.7fr_0.8fr_1fr_auto] items-center px-5 py-4 text-[13.5px] border-b border-border last:border-0 hover:bg-mist/40 transition flex flex-wrap gap-y-2 gap-x-4">
              <span className="font-mono text-ink tabular-nums tracking-[0.05em]">{b.lot}</span>
              <Link to="/shop/$slug" params={{ slug: b.slug }} className="text-ink hover:text-primary transition">{b.product}</Link>
              <span className="text-muted-foreground">{b.size}</span>
              <span className="text-ink tabular-nums inline-flex items-center gap-1.5"><ShieldCheck size={11} strokeWidth={1.5} className="text-primary" />{b.purity.toFixed(2)}%</span>
              <span className="text-muted-foreground tabular-nums">{b.testedOn}</span>
              <button
                onClick={() => { void downloadCoa(b); }}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/75 hover:text-ink border border-border hover:border-ink/35 px-3 py-1.5 rounded-[3px] md:ml-auto transition"
              >
                <Download size={12} /> COA{b.coaUrl ? ` (${(coaExtension(b.coaUrl) || "").toUpperCase()})` : ""}
              </button>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-14 text-center text-[13.5px] text-muted-foreground">
              {batches.length === 0
                ? "No lots are currently published to the public archive."
                : `No lots match "${q}".`}
            </div>
          )}
        </div>

        <p className="mt-8 text-[10.5px] font-mono uppercase tracking-[0.2em] text-foreground/50">
          Documents are issued by {labPartner.name} · {labPartner.iso} · {labPartner.accreditation} · {labPartner.city}.
        </p>
      </section>
    </Layout>
  );
}
