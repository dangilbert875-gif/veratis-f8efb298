import { useState } from "react";
import { findBatch, type Batch, SAMPLE_LOT, labPartner } from "@/data/batches";
import { BadgeCheck, ShieldCheck, Search, FileText, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; batch: Batch }
  | { kind: "notfound"; query: string };

export function BatchVerify({ compact = false }: { compact?: boolean }) {
  const [lot, setLot] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = lot.trim();
    if (!q) return;
    setState({ kind: "loading" });
    // Simulate brief lookup so it feels like a real query
    setTimeout(() => {
      const b = findBatch(q);
      setState(b ? { kind: "ok", batch: b } : { kind: "notfound", query: q });
    }, 450);
  }

  function trySample() {
    setLot(SAMPLE_LOT);
    setState({ kind: "loading" });
    setTimeout(() => {
      const b = findBatch(SAMPLE_LOT);
      if (b) setState({ kind: "ok", batch: b });
    }, 300);
  }

  return (
    <div className={compact ? "" : "rounded-2xl border border-border bg-background p-7 md:p-9 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)]"}>
      {!compact && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Batch verification</p>
            <h3 className="mt-2 font-display text-2xl md:text-[1.75rem] text-ink leading-tight">
              Authenticate any vial by lot number.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Enter the lot printed on the vial label to retrieve the original certificate signed by {labPartner.name}.
            </p>
          </div>
          <ShieldCheck size={28} className="text-primary shrink-0 mt-1" strokeWidth={1.5} />
        </div>
      )}

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

      {/* Result */}
      <div className="mt-6">
        {state.kind === "idle" && !compact && (
          <div className="rounded-lg border border-dashed border-border bg-mist/40 px-5 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              Every Pure Peptide vial carries a unique lot printed on the label and on the outer carton tamper seal.
            </p>
          </div>
        )}
        {state.kind === "loading" && (
          <div className="rounded-lg border border-border bg-background px-5 py-6 text-center text-sm text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
            <Loader2 size={14} className="animate-spin" /> Querying laboratory archive…
          </div>
        )}
        {state.kind === "notfound" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="text-ink font-medium">Lot {state.query} not found in our archive.</p>
              <p className="text-muted-foreground mt-1">
                Counterfeits do exist. If you purchased through an unofficial reseller, please{" "}
                <Link to="/contact" className="text-primary underline-offset-2 hover:underline">contact us</Link>.
              </p>
            </div>
          </div>
        )}
        {state.kind === "ok" && <BatchResult batch={state.batch} />}
      </div>
    </div>
  );
}

function BatchResult({ batch }: { batch: Batch }) {
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
            ["Water content", batch.water],
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
          <Link to="/lab-testing" className="inline-flex items-center gap-2 text-[13px] text-ink border border-border rounded-md px-4 py-2 hover:border-ink/40 transition">
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
