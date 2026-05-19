import { useEffect, useState } from "react";

/** Counts up to a target purity %, easing softly. Refined, not flashy. */
export function PurityCounter({ value, className = "" }: { value: number; className?: string }) {
  const [v, setV] = useState(value * 0.86);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = value * 0.86;
    const to = value;
    const dur = 900;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // cubic-out
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setV(from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{v.toFixed(2)}%</span>;
}
