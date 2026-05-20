import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { labPartner } from "@/data/batches";
import { usePublicLots } from "@/lib/use-lots";
import { Search, Download, ShieldCheck, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadCoa } from "@/lib/coa";

export const Route = createFileRoute("/coa-archive")({
  head: () => ({
    meta: [
      { title: "COA Archive — VERATIS" },
      { name: "description", content: "Searchable archive of every certificate of analysis ever issued for a VERATIS lot. Public, permanent, never recycled." },
      { property: "og:title", content: "COA Archive — VERATIS" },
      { property: "og:description", content: "Searchable archive of every certificate of analysis ever issued for a VERATIS lot." },
    ],
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
    : "—";

  return (
    <Layout>
      <PageHeader
        eyebrow="COA archive"
        title="Every lot, on the record."
        lead={`Every certificate ever issued for a VERATIS lot is searchable below. Documents are signed by ${labPartner.name} and remain available for the life of the product.`}
      />
      <section className="mx-auto max-w-6xl px-6 -mt-8 pb-20">
        {/* Stats strip */}
        <div className="grid grid-cols-3 border border-border rounded-xl overflow-hidden bg-background">
          {[
            [batches.length.toString(), "Lots on record"],
            [`${avg}%`, "Average purity"],
            ["100%", "Pass rate this year"],
          ].map(([v, k], i) => (
            <div key={k} className={`px-6 py-7 ${i > 0 ? "border-l border-border" : ""}`}>
              <p className="text-2xl md:text-3xl font-display text-ink tabular-nums">{v}</p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lot or product…"
              className="w-full h-11 pl-10 pr-3 rounded-md border border-border bg-background text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSort((s) => (s === "date" ? "purity" : "date"))}
              className="inline-flex items-center gap-2 text-xs h-11 px-4 rounded-md border border-border text-foreground/80 hover:text-ink transition"
            >
              <ArrowUpDown size={13} /> Sort: {sort === "date" ? "Most recent" : "Highest purity"}
            </button>
            <span className="text-xs text-muted-foreground">{filtered.length} results</span>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 border border-border rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1.4fr_0.7fr_0.8fr_1fr_auto] text-[11px] uppercase tracking-[0.18em] text-muted-foreground bg-mist px-5 py-3 border-b border-border">
            <span>Lot</span><span>Product</span><span>Size</span><span>Purity</span><span>Tested</span><span></span>
          </div>
          {filtered.map((b) => (
            <div key={b.lot} className="md:grid md:grid-cols-[1fr_1.4fr_0.7fr_0.8fr_1fr_auto] items-center px-5 py-4 text-sm border-b border-border last:border-0 hover:bg-mist/40 transition flex flex-wrap gap-y-2 gap-x-4">
              <span className="text-ink tabular-nums font-medium md:font-normal">{b.lot}</span>
              <Link to="/shop/$slug" params={{ slug: b.slug }} className="text-ink hover:text-primary transition">{b.product}</Link>
              <span className="text-muted-foreground">{b.size}</span>
              <span className="text-primary tabular-nums inline-flex items-center gap-1.5"><ShieldCheck size={12} />{b.purity.toFixed(2)}%</span>
              <span className="text-muted-foreground tabular-nums">{b.testedOn}</span>
              <button
                onClick={() => downloadCoa(b)}
                className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary border border-border px-3 py-1.5 rounded-md md:ml-auto"
              >
                <Download size={12} /> COA
              </button>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              {batches.length === 0
                ? "No lots are currently published to the public archive."
                : `No lots match "${q}".`}
            </div>
          )}
        </div>

        <p className="mt-8 text-[11px] text-muted-foreground">
          Documents are issued by {labPartner.name} · {labPartner.iso} · {labPartner.accreditation} · {labPartner.city}.
        </p>
      </section>
    </Layout>
  );
}
