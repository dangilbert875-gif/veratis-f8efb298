/**
 * Inline, monochrome scientific visuals used inside Reference Library articles.
 * Pure SVG, no external deps. Designed to feel like figures pulled from a
 * laboratory release record, not stock illustrations.
 */

type FigureProps = { caption?: string; figureNumber?: string };

function Frame({
  children,
  caption,
  figureNumber,
}: FigureProps & { children: React.ReactNode }) {
  return (
    <figure className="my-10 border border-border rounded-[3px] overflow-hidden bg-background">
      <div className="bg-mist/40 px-5 py-2.5 border-b border-border flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.18em] text-foreground/55">
        <span>Figure {figureNumber ?? ""}</span>
        <span>Internal record · monochrome reproduction</span>
      </div>
      <div className="p-5">{children}</div>
      {caption && (
        <figcaption className="px-5 pb-5 -mt-1 text-[12.5px] text-muted-foreground leading-[1.6]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Stylized RP-HPLC chromatogram with a dominant main peak + small impurities. */
export function Chromatogram({ caption, figureNumber = "1" }: FigureProps) {
  // 0..100 x scale; baseline noise + main peak + small satellite peaks
  const width = 600;
  const height = 220;
  const baseline = 180;
  const points: [number, number][] = [];
  for (let x = 0; x <= width; x += 2) {
    const t = x / width;
    const noise = Math.sin(x * 0.7) * 0.6 + Math.cos(x * 0.31) * 0.4;
    const main = Math.exp(-Math.pow((t - 0.52) / 0.025, 2)) * 150;
    const sat1 = Math.exp(-Math.pow((t - 0.34) / 0.018, 2)) * 6;
    const sat2 = Math.exp(-Math.pow((t - 0.66) / 0.02, 2)) * 9;
    const sat3 = Math.exp(-Math.pow((t - 0.78) / 0.022, 2)) * 4;
    const y = baseline - (main + sat1 + sat2 + sat3 + noise);
    points.push([x, y]);
  }
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y.toFixed(1)}`).join(" ");

  return (
    <Frame caption={caption} figureNumber={figureNumber}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="HPLC chromatogram">
        {/* gridlines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            x2={width}
            y1={(baseline / 4) * i + 20}
            y2={(baseline / 4) * i + 20}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
        ))}
        {/* axes */}
        <line x1={20} y1={10} x2={20} y2={baseline} stroke="currentColor" className="text-foreground/40" strokeWidth={0.75} />
        <line x1={20} y1={baseline} x2={width - 10} y2={baseline} stroke="currentColor" className="text-foreground/40" strokeWidth={0.75} />
        {/* trace */}
        <path d={path} fill="none" stroke="currentColor" className="text-ink" strokeWidth={1.1} />
        {/* main peak label */}
        <line x1={width * 0.52} y1={32} x2={width * 0.52} y2={baseline} stroke="currentColor" className="text-primary/40" strokeDasharray="2 3" strokeWidth={0.6} />
        <text x={width * 0.52 + 6} y={36} className="fill-ink" style={{ fontFamily: "ui-monospace, monospace", fontSize: 10 }}>
          Rt 12.84 · 99.42%
        </text>
        {/* axis labels */}
        <text x={width - 10} y={baseline + 14} textAnchor="end" className="fill-foreground/55" style={{ fontFamily: "ui-monospace, monospace", fontSize: 9 }}>
          Retention time (min)
        </text>
        <text x={14} y={16} className="fill-foreground/55" style={{ fontFamily: "ui-monospace, monospace", fontSize: 9 }}>
          mAU · 214 nm
        </text>
      </svg>
    </Frame>
  );
}

/** Schematic peptide chain. circles for residues, lines for peptide bonds. */
export function PeptideSchematic({ caption, figureNumber = "1", sequence = ["G", "E", "P", "P", "P", "G", "K", "P", "A", "D", "D", "A", "G", "L", "V"] }: FigureProps & { sequence?: string[] }) {
  const r = 14;
  const gap = 32;
  const width = sequence.length * gap + 40;
  const height = 110;
  const cy = height / 2;
  return (
    <Frame caption={caption} figureNumber={figureNumber}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Peptide schematic">
        {/* backbone */}
        <line x1={20 + r} y1={cy} x2={width - 20 - r} y2={cy} stroke="currentColor" className="text-foreground/40" strokeWidth={1} />
        {sequence.map((aa, i) => {
          const cx = 20 + r + i * gap;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="white" stroke="currentColor" className="text-ink" strokeWidth={1} />
              <text x={cx} y={cy + 4} textAnchor="middle" className="fill-ink" style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>
                {aa}
              </text>
              <text x={cx} y={cy + r + 14} textAnchor="middle" className="fill-foreground/45" style={{ fontFamily: "ui-monospace, monospace", fontSize: 8 }}>
                {i + 1}
              </text>
            </g>
          );
        })}
        {/* terminus marks */}
        <text x={6} y={cy + 4} className="fill-foreground/55" style={{ fontFamily: "ui-monospace, monospace", fontSize: 10 }}>
          N
        </text>
        <text x={width - 14} y={cy + 4} className="fill-foreground/55" style={{ fontFamily: "ui-monospace, monospace", fontSize: 10 }}>
          C
        </text>
      </svg>
    </Frame>
  );
}

/** Append-only archive timeline. small nodes on a horizontal line. */
export function ArchiveTimeline({ caption, figureNumber = "1" }: FigureProps) {
  const events = [
    { d: "Manufacture", t: "Apr 02" },
    { d: "Identity (MS)", t: "Apr 04" },
    { d: "Purity (HPLC)", t: "Apr 05" },
    { d: "Endotoxin (LAL)", t: "Apr 06" },
    { d: "Two-analyst release", t: "Apr 09" },
    { d: "Archive entry", t: "Apr 09" },
    { d: "Public verification", t: "Apr 10" },
  ];
  const width = 640;
  const height = 130;
  const y = 60;
  const step = (width - 40) / (events.length - 1);
  return (
    <Frame caption={caption} figureNumber={figureNumber}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Archive release timeline">
        <line x1={20} y1={y} x2={width - 20} y2={y} stroke="currentColor" className="text-foreground/40" strokeWidth={0.75} />
        {events.map((e, i) => {
          const x = 20 + i * step;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4} fill="white" stroke="currentColor" className="text-ink" strokeWidth={1.25} />
              <line x1={x} y1={y - 8} x2={x} y2={y - 18} stroke="currentColor" className="text-foreground/40" strokeWidth={0.5} />
              <text x={x} y={y - 22} textAnchor="middle" className="fill-ink" style={{ fontFamily: "ui-sans-serif, system-ui", fontSize: 10 }}>
                {e.d}
              </text>
              <text x={x} y={y + 20} textAnchor="middle" className="fill-foreground/55" style={{ fontFamily: "ui-monospace, monospace", fontSize: 9 }}>
                {e.t}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

export type FigureKey = "chromatogram" | "peptide" | "timeline";

export function Figure({ kind, caption, figureNumber }: { kind: FigureKey } & FigureProps) {
  if (kind === "chromatogram") return <Chromatogram caption={caption} figureNumber={figureNumber} />;
  if (kind === "peptide") return <PeptideSchematic caption={caption} figureNumber={figureNumber} />;
  if (kind === "timeline") return <ArchiveTimeline caption={caption} figureNumber={figureNumber} />;
  return null;
}