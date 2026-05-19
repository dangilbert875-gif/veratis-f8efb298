import vialMaster from "@/assets/vial-master.jpg";

type Size = "card" | "detail";

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
  // Tuned to the label position in vial-master.jpg
  const labelStyle: React.CSSProperties = {
    position: "absolute",
    left: "33.5%",
    right: "33.5%",
    top: "41%",
    bottom: "19%",
  };

  const nameSize = size === "detail" ? "clamp(11px, 1.35vw, 18px)" : "clamp(8px, 1vw, 13px)";
  const metaSize = size === "detail" ? "clamp(7px, 0.78vw, 10px)" : "clamp(6px, 0.6vw, 8px)";

  // Compact QR pattern (deterministic — purely decorative serialization mark)
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

      {/* Label overlay — guarantees correct product name on every vial */}
      <div
        style={labelStyle}
        className="flex flex-col justify-between bg-white/[0.02]"
      >
        {/* Top: VERATIS wordmark + teal hairline */}
        <div className="flex flex-col items-center" style={{ paddingTop: "6%" }}>
          <span
            className="font-medium text-ink/85 tracking-[0.32em]"
            style={{ fontSize: metaSize, letterSpacing: "0.32em" }}
          >
            VERATIS
          </span>
          <span
            aria-hidden
            className="mt-[3%] block"
            style={{
              width: "38%",
              height: 1,
              background: "oklch(0.56 0.07 210)",
            }}
          />
        </div>

        {/* Middle: product name + dosage */}
        <div className="px-[6%] text-center">
          <p
            className="font-display text-ink leading-[1.05] uppercase tracking-[0.04em]"
            style={{ fontSize: nameSize }}
          >
            {name}
          </p>
          <p
            className="mt-[4%] font-mono text-ink/70 tabular-nums tracking-[0.18em]"
            style={{ fontSize: metaSize }}
          >
            {dosage}
          </p>
        </div>

        {/* Bottom: QR + lot + purity */}
        <div className="flex items-end justify-between px-[6%]" style={{ paddingBottom: "6%" }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(7, 1fr)",
              width: "26%",
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
            className="text-right font-mono text-ink/70 leading-[1.3] tabular-nums tracking-[0.12em]"
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
