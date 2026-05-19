import { batches, labPartner } from "@/data/batches";
import { Link } from "@tanstack/react-router";
import { Archive, ArrowRight } from "lucide-react";

// Deterministic relative time so the log feels alive without
// inducing hydration mismatch. Anchored to "now" at module load.
const NOW = Date.now();
function relTime(iso: string, offsetMin = 0) {
  const t = new Date(iso).getTime() - offsetMin * 60_000;
  const diff = Math.max(60_000, NOW - t);
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} d ago`;
}

type Entry = { kind: string; lot: string; detail: string; offset: number };

export function ArchiveActivity() {
  const seed = batches.slice(0, 7);
  const entries: Entry[] = [
    { kind: "Lot archived",          lot: seed[0].lot, detail: `${seed[0].product} · ${seed[0].purity.toFixed(2)}% HPLC`, offset: 0 },
    { kind: "Independent assay",     lot: seed[1].lot, detail: `Method: ${seed[1].method}`, offset: 95 },
    { kind: "COA published",         lot: seed[2].lot, detail: "Counter-signed by release officer", offset: 240 },
    { kind: "Verification accessed", lot: seed[3].lot, detail: "Anonymous lookup · resolved 0.7s", offset: 410 },
    { kind: "Identity confirmed",    lot: seed[4].lot, detail: "ESI-MS within tolerance", offset: 690 },
    { kind: "Endotoxin cleared",     lot: seed[5].lot, detail: `${seed[5].endotoxin} · LAL chromogenic`, offset: 960 },
    { kind: "Lot archived",          lot: seed[6].lot, detail: `${seed[6].product} · ${seed[6].purity.toFixed(2)}% HPLC`, offset: 1320 },
  ];

  return (
    <section className="border-y border-border bg-mist/30">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24 grid md:grid-cols-12 gap-12 lg:gap-20">
        <div className="md:col-span-4">
          <p className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-foreground/55 mb-3">
            — Live archive activity
          </p>
          <h2 className="text-3xl md:text-[2.25rem] text-ink leading-[1.12] tracking-[-0.02em]">
            The archive,<br />
            updating in real time.
          </h2>
          <p className="mt-5 text-[14.5px] text-muted-foreground leading-[1.75] max-w-sm">
            A quiet, timestamped log of every release, assay, and verification event.
            No customer data — only what an auditor would see.
          </p>
          <dl className="mt-9 grid grid-cols-2 gap-y-5 max-w-sm">
            {[
              ["0.8s",  "Median verification"],
              ["100%",  "Lots with public COA"],
              [`${batches.length}`, "Lots on permanent record"],
              [labPartner.iso, "Lab partner accreditation"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-display text-[1.35rem] text-ink leading-none tabular-nums tracking-[-0.01em]">{v}</dt>
                <dd className="mt-2 text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/55">{k}</dd>
              </div>
            ))}
          </dl>
          <Link
            to="/coa-archive"
            className="mt-9 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-ink border border-ink/15 rounded-[3px] px-5 h-11 hover:bg-background hover:border-ink/35 active:scale-[0.985] transition"
          >
            <Archive size={13} strokeWidth={1.5} /> Open full archive <ArrowRight size={12} />
          </Link>
        </div>

        <div className="md:col-span-8">
          <div className="rounded-[3px] border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between px-5 h-10 border-b border-border bg-mist/50 text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/55">
              <span className="inline-flex items-center gap-2">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Archive feed · operational
              </span>
              <span className="hidden sm:inline tabular-nums">veratis-archive · main</span>
            </div>
            <ul>
              {entries.map((e, i) => (
                <li
                  key={`${e.lot}-${i}`}
                  className="grid grid-cols-[110px_1fr_auto] sm:grid-cols-[130px_140px_1fr_auto] items-baseline gap-x-5 px-5 py-3.5 border-b border-border/60 last:border-0 text-[12.5px] hover:bg-mist/40 transition-colors"
                >
                  <span className="font-mono text-[10.5px] tabular-nums uppercase tracking-[0.14em] text-foreground/50">
                    {relTime(batches[0].testedOn, e.offset)}
                  </span>
                  <span className="hidden sm:inline font-mono text-[10.5px] tabular-nums tracking-[0.08em] text-ink/80">
                    {e.lot}
                  </span>
                  <div className="col-span-1 sm:col-span-1 min-w-0">
                    <p className="text-ink truncate">{e.kind}</p>
                    <p className="text-[11.5px] text-muted-foreground truncate">{e.detail}</p>
                  </div>
                  <Link
                    to="/verify"
                    className="text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/55 hover:text-ink transition-colors whitespace-nowrap"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
            <div className="px-5 h-10 flex items-center justify-between border-t border-border text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/45">
              <span>Append-only · cryptographically sealed</span>
              <span className="tabular-nums">{batches.length} entries · partition 01</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
