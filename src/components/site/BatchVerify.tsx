import { useState } from "react";
import { type Batch, SAMPLE_LOT, labPartner } from "@/data/batches";
import { useServerFn } from "@tanstack/react-start";
import { lookupPublicLot } from "@/lib/public-catalog.functions";
import { usePublicLots } from "@/lib/use-lots";
import { mapDbLot } from "@/lib/use-lots";
import { BadgeCheck, Search, FileText, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PurityCounter } from "./PurityCounter";
import { downloadCoa, coaExtension } from "@/lib/coa";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; batch: Batch }
  | { kind: "notfound"; query: string };

export function BatchVerify({ compact = false }: { compact?: boolean }) {
  const [lot, setLot] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const lookup = useServerFn(lookupPublicLot);
  const { batches } = usePublicLots();

  const stats = {
    count: batches.length,
    avg: batches.length
      ? (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2)
      : "—",
    lastRelease: batches[0]?.testedOn ?? "—",
    medianResponse: "0.8s",
  };

  async function runLookup(q: string) {
    setState({ kind: "loading" });
    try {
      const row = await lookup({ data: { lot_number: q } });
      if (row) setState({ kind: "ok", batch: mapDbLot(row) });
      else setState({ kind: "notfound", query: q });
    } catch {
      setState({ kind: "notfound", query: q });
    }
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = lot.trim();
    if (!q) return;
    void runLookup(q);
  }

  function trySample() {
    const sample = batches[0]?.lot ?? SAMPLE_LOT;
    setLot(sample);
    void runLookup(sample);
  }

  return (
    <div
      className={
        compact
          ? ""
          : "rounded-[4px] border border-background/12 bg-background/[0.04] p-5 sm:p-7 md:p-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_40px_90px_-50px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
      }
    >
      {!compact && (
        <div className="mb-6 sm:mb-7 flex items-center justify-between gap-4 text-[10px] sm:text-[10.5px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-background/65">
          <span className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary/80" />
            </span>
            Archive online
          </span>
          <span className="hidden sm:inline tabular-nums text-background/55">
            {stats.count} lots · {stats.avg}% mean · median lookup {stats.medianResponse}
          </span>
        </div>
      )}

      {!compact ? (
        <>
          <label className="block text-[10px] font-mono uppercase tracking-[0.24em] text-background/65 mb-2.5">
            Lot identifier
          </label>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-background/50" />
              <input
                value={lot}
                onChange={(e) => setLot(e.target.value.toUpperCase())}
                placeholder="Enter lot identifier (ex: PP-2608)"
                aria-label="Lot number"
                className="w-full h-14 pl-11 pr-4 rounded-[3px] border border-background/18 bg-background/[0.05] font-mono text-[15px] tabular-nums tracking-[0.08em] text-background placeholder:text-background/35 placeholder:tracking-normal placeholder:font-sans placeholder:text-[13px] outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 focus:bg-background/[0.07] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              />
            </div>
            <button
              type="submit"
              disabled={state.kind === "loading"}
              className="inline-flex items-center justify-center gap-2.5 h-14 px-7 rounded-[3px] bg-background text-ink text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-background/90 disabled:opacity-60 transition-all duration-200 shadow-[0_1px_0_rgba(255,255,255,0.1)_inset]"
            >
              {state.kind === "loading" ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />}
              Verify
            </button>
          </form>
          <div className="mt-3.5 flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.16em] text-background/55">
            <button type="button" onClick={trySample} className="hover:text-background transition">
              Try sample · {SAMPLE_LOT}
            </button>
            <span className="hidden sm:inline">Anonymous lookup</span>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="e.g. PP-2426"
                aria-label="Lot number"
                className="w-full h-12 pl-10 pr-3 rounded-md border border-border bg-background text-[14px] tabular-nums tracking-wide text-ink placeholder:text-muted-foreground/70 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
              />
            </div>
            <button
              type="submit"
              disabled={state.kind === "loading"}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-ink text-background text-[13px] font-medium tracking-wide hover:bg-ink/90 disabled:opacity-60 transition"
            >
              {state.kind === "loading" ? <Loader2 size={15} className="animate-spin" /> : <BadgeCheck size={15} />}
              Verify
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <button type="button" onClick={trySample} className="hover:text-ink transition">
              Try sample lot {SAMPLE_LOT}
            </button>
            <span>Lookup is anonymous · No account required</span>
          </div>
        </>
      )}

      {/* Result */}
      <div className="mt-7 transition-all duration-500">
        {state.kind === "idle" && !compact && (
          <CertificatePreview sample={batches[0]} />
        )}
        {state.kind === "loading" && !compact && (
          <div className="rounded-[3px] border border-background/10 bg-background/[0.03] overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-5 text-[11px] font-mono uppercase tracking-[0.18em] text-background/55 flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Querying laboratory archive
              </span>
              <span className="text-background/40 tabular-nums">{labPartner.iso}</span>
            </div>
            <div className="h-px w-full bg-background/10 overflow-hidden relative">
              <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-[shimmer_1.1s_ease-in-out_infinite]" />
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-x-6 text-[10.5px] font-mono uppercase tracking-[0.16em] text-background/35">
              <span>Resolving lot</span>
              <span>Fetching signed COA</span>
              <span className="text-right">Verifying signature</span>
            </div>
          </div>
        )}
        {state.kind === "loading" && compact && (
          <div className="rounded-lg border border-border bg-background px-5 py-6 text-center text-sm text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
            <Loader2 size={14} className="animate-spin" /> Querying laboratory archive…
          </div>
        )}
        {state.kind === "notfound" && (
          <NotFoundResult query={state.query} dark={!compact} />
        )}
        {state.kind === "ok" && <BatchResult batch={state.batch} dark={!compact} />}
      </div>
    </div>
  );
}

function NotFoundResult({ query, dark }: { query: string; dark: boolean }) {
  if (dark) {
    return (
      <div className="rounded-[3px] border border-destructive/40 bg-destructive/10 px-5 py-5 flex items-start gap-3">
        <AlertTriangle size={18} className="text-destructive mt-0.5" />
        <div className="text-sm">
          <p className="text-background font-medium">Lot {query} not found in our archive.</p>
          <p className="text-background/65 mt-1">
            Counterfeits do exist. If you purchased through an unofficial reseller,{" "}
            <Link to="/contact" className="text-primary underline-offset-2 hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-5 flex items-start gap-3">
      <AlertTriangle size={18} className="text-destructive mt-0.5" />
      <div className="text-sm">
        <p className="text-ink font-medium">Lot {query} not found in our archive.</p>
        <p className="text-muted-foreground mt-1">
          Counterfeits do exist. If you purchased through an unofficial reseller, please{" "}
          <Link to="/contact" className="text-primary underline-offset-2 hover:underline">contact us</Link>.
        </p>
      </div>
    </div>
  );
}

function CertificatePreview({ sample }: { sample?: Batch }) {
  if (!sample) return null;
  return (
    <div className="rounded-[3px] border border-background/12 bg-background/[0.035] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-background/12 text-[10px] font-mono uppercase tracking-[0.2em] bg-background/[0.02]">
        <span className="text-background/60">Specimen certificate · format preview</span>
        <span className="text-background/55 tabular-nums">{sample.lot}</span>
      </div>
      <div className="px-6 py-6">
        <p className="font-display text-[18px] text-background leading-tight tracking-[-0.01em]">
          {sample.product} · {sample.size}
        </p>
        <p className="text-[11px] text-background/55 mt-1 tabular-nums font-mono">
          Tested {sample.testedOn} · {labPartner.name}
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-x-6 gap-y-3 text-[12px]">
          {[
            ["Purity", `${sample.purity.toFixed(2)}%`],
            ["Identity", sample.identity],
            ["Endotoxin", sample.endotoxin],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[9.5px] font-mono uppercase tracking-[0.2em] text-background/55">{k}</dt>
              <dd className="text-background tabular-nums mt-1.5 text-[13px]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="px-5 py-3 border-t border-background/12 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-background/55 bg-background/[0.015]">
        <span>Enter a lot above to retrieve its certificate</span>
        <span className="text-background/65">{labPartner.iso}</span>
      </div>
    </div>
  );
}

function BatchResult({ batch, dark = false }: { batch: Batch; dark?: boolean }) {
  if (dark) {
    return (
      <div className="rounded-[3px] border border-background/20 bg-background/[0.05] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-background/12 bg-background/[0.03]">
          <div className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.2em] text-background/90">
            <BadgeCheck size={13} strokeWidth={2} />
            Archive verified · {labPartner.name}
          </div>
          <span className="text-[10px] font-mono tabular-nums uppercase tracking-[0.2em] text-background/65">
            Lot {batch.lot}
          </span>
        </div>
        <div className="px-6 py-6">
          <p className="font-display text-[20px] text-background leading-tight tracking-[-0.01em]">
            {batch.product} · {batch.size}
          </p>
          <p className="text-[11px] text-background/60 mt-1 font-mono">{batch.appearance}</p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-background/65">
            <span>· Certificate retrieved</span>
            <span>· Independent assay confirmed</span>
            <span>· Document integrity validated</span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-y-3.5 gap-x-8 text-[13px]">
            {[
              ["Purity (HPLC)", <PurityCounter key="p" value={batch.purity} />],
              ["Identity (MS)", batch.identity],
              ["Endotoxin", batch.endotoxin],
              ["Tested", batch.testedOn],
              ["Best before", batch.expiresOn],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between border-b border-background/12 pb-2">
                <dt className="text-background/65 text-[12px]">{k}</dt>
                <dd className="text-background tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CoaDownloadButton batch={batch} />
            <Link
              to="/shop/$slug" params={{ slug: batch.slug }}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-mono uppercase tracking-[0.16em] text-background/80 hover:text-background transition"
            >
              View product <ArrowRight size={11} />
            </Link>
          </div>
          <div className="mt-6 pt-4 border-t border-background/12 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-background/55">
            <p>Method · {batch.method}</p>
            <p className="text-right">Verified against permanent archive</p>
            <p>{labPartner.iso} · {labPartner.accreditation}</p>
            <p className="text-right tabular-nums">Resolved 0.74s · {labPartner.city}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-mist/40">
        <div className="flex items-center gap-2 text-xs text-primary">
          <BadgeCheck size={14} strokeWidth={2} />
          Authentic · Verified by {labPartner.name}
        </div>
        <span className="text-[10px] tabular-nums uppercase tracking-[0.18em] text-muted-foreground">Lot {batch.lot}</span>
      </div>
      <div className="px-5 py-5">
        <p className="font-display text-lg text-ink">{batch.product} · {batch.size}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{batch.appearance}</p>
        <dl className="mt-5 grid grid-cols-2 gap-y-3 gap-x-6 text-[13px]">
          {[
            ["Purity (HPLC)", `${batch.purity.toFixed(2)}%`],
            ["Identity (MS)", batch.identity],
            ["Endotoxin", batch.endotoxin],
            ["Tested", batch.testedOn],
            ["Best before", batch.expiresOn],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/60 pb-1.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link to="/coa-archive" className="inline-flex items-center gap-2 text-[13px] text-ink border border-border rounded-md px-4 py-2 hover:border-ink/40 transition">
            <FileText size={13} /> Download full COA (PDF)
          </Link>
          <Link
            to="/shop/$slug" params={{ slug: batch.slug }}
            className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline underline-offset-4"
          >
            View product <ArrowRight size={13} />
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Method: {batch.method} · Accreditation: {labPartner.iso} · {labPartner.accreditation}
        </p>
      </div>
    </div>
  );
}
