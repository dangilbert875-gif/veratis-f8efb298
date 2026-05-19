import vialMaster from "@/assets/vial-master.jpg";

type Size = "card" | "detail";

// Strip the trailing " VIAL" / " Vial" and any mg/IU dosage tokens out of the
// human product name, so the LABEL shows just the compound + variant.
// Dosage lives on its own line below the name.
function labelName(raw: string) {
  return raw
    .replace(/\s*VIAL\s*$/i, "")
    .replace(/\s*\d[\d,]*\s*mg(\s*\/\s*\d[\d,]*\s*mg)?/gi, "")
    .replace(/\s*\d[\d,]*\s*IU/gi, "") // dosage line carries IU; name stays clean
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Display dosage as "12 mg", "10 mg / 10 mg", "10,000 IU", "70 mg"
function labelDosage(dosage: string) {
  return dosage
    .replace(/MG/g, "mg")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

// Choose a name size class based on character length so longer compounds
// step down gracefully instead of overflowing.
function nameClass(name: string, size: Size) {
  const len = name.length;
  if (size === "detail") {
    if (len <= 10) return "text-[clamp(13px,1.55vw,21px)]";
    if (len <= 18) return "text-[clamp(11px,1.3vw,18px)]";
    if (len <= 26) return "text-[clamp(10px,1.1vw,15px)]";
    return "text-[clamp(9px,0.95vw,13px)]";
  }
  if (len <= 10) return "text-[clamp(9px,1.1vw,14px)]";
  if (len <= 18) return "text-[clamp(8px,0.95vw,12px)]";
  if (len <= 26) return "text-[clamp(7px,0.82vw,11px)]";
  return "text-[clamp(6.5px,0.72vw,10px)]";
}

export function VialImage({
  name,
  dosage,
  lot,
  purity,
  size = "card",
  alt,
}: {
  name: string;
  dosage: string;
  lot: string;
  purity?: string;
  size?: Size;
  alt?: string;
}) {
  const displayName = labelName(name);
  const displayDosage = labelDosage(dosage);

  // Label area inside the master vial photo. Slightly wider than before to
  // give long names breathing room without ever clipping the vial edge.
  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: "31.5%",
    right: "31.5%",
    top: "41.5%",
    bottom: "19.5%",
  };

  const metaSize = size === "detail" ? "clamp(7.5px, 0.78vw, 10px)" : "clamp(5.5px, 0.58vw, 8px)";

  // Compact decorative QR pattern (purely a serialization mark).
  const qrCells = Array.from({ length: 49 }, (_, i) => {
    const seed = (lot.charCodeAt(i % lot.length) + i * 7) % 11;
    return seed < 5;
  });

  return (
    <div className="relative w-full h-full">
      <img
        src={vialMaster}
        alt={alt ?? `${name} ${dosage} lyophilized research vial`}
        loading="lazy"
        width={1024}
        height={1024}
        className="w-full h-full object-cover"
      />

      {/* Label overlay — identical geometry on every vial */}
      <div style={labelStyle} className="flex flex-col justify-between">
        {/* Top: VERATIS wordmark + teal hairline */}
        <div className="flex flex-col items-center" style={{ paddingTop: "7%" }}>
          <span
            className="font-medium text-ink/85"
            style={{ fontSize: metaSize, letterSpacing: "0.32em" }}
          >
            VERATIS
          </span>
          <span
            aria-hidden
            className="mt-[3%] block"
            style={{ width: "34%", height: 1, background: "oklch(0.56 0.07 210)" }}
          />
        </div>

        {/* Middle: compound name + dosage, centered, balanced, wrapping allowed */}
        <div className="flex flex-col items-center justify-center text-center px-[5%] flex-1">
          <p
            className={`font-display text-ink uppercase tracking-[0.04em] ${nameClass(displayName, size)}`}
            style={{
              lineHeight: 1.08,
              textWrap: "balance" as unknown as undefined,
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {displayName}
          </p>
          <p
            className="mt-[6%] font-mono text-ink/65 tabular-nums tracking-[0.18em]"
            style={{ fontSize: metaSize }}
          >
            {displayDosage}
          </p>
        </div>

        {/* Bottom: QR + lot + purity */}
        <div className="flex items-end justify-between px-[6%]" style={{ paddingBottom: "7%" }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(7, 1fr)",
              width: "24%",
              aspectRatio: "1 / 1",
              gap: "1px",
            }}
            aria-hidden
          >
            {qrCells.map((on, i) => (
              <span
                key={i}
                style={{
                  background: on ? "oklch(0.11 0.012 240)" : "transparent",
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            ))}
          </div>
          <div
            className="text-right font-mono text-ink/65 leading-[1.3] tabular-nums tracking-[0.1em]"
            style={{ fontSize: metaSize }}
          >
            <div>LOT {lot}</div>
            {purity && <div>{purity}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
