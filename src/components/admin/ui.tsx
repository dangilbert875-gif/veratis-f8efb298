import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function Card({ title, hint, children, action }: { title?: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border border-ink/10 bg-background">
      {(title || action) && (
        <header className="px-5 py-3.5 border-b border-ink/10 flex items-center justify-between gap-4">
          <div>
            {title && <div className="text-[12.5px] font-medium tracking-tight text-ink">{title}</div>}
            {hint && <div className="mt-0.5 text-[11px] text-foreground/55">{hint}</div>}
          </div>
          {action}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}

export function Stat({ label, value, sub, onClick }: { label: string; value: ReactNode; sub?: string; onClick?: () => void }) {
  const className = "group border border-ink/10 bg-background p-5 transition-colors hover:border-ink/25 text-left w-full";
  const content = (
    <>
      <div className="text-[9.5px] tracking-[0.28em] uppercase text-foreground/50">{label}</div>
      <div className="mt-2 text-[26px] font-medium tracking-tight tabular-nums text-ink">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-foreground/55">{sub}</div>}
    </>
  );
  if (onClick) {
    return <button type="button" onClick={onClick} className={className + " cursor-pointer hover:bg-mist/30"}>{content}</button>;
  }
  return <div className={className}>{content}</div>;
}

/** Dominant operational KPI card. Slightly larger, anchors the dashboard. */
export function HeroStat({
  label,
  value,
  sub,
  trend,
  series,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: { delta: number; suffix?: string };
  series?: number[];
}) {
  return (
    <div className="relative border border-ink/15 bg-background p-6 md:p-7 transition-colors hover:border-ink/30">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[9.5px] tracking-[0.32em] uppercase text-foreground/55">
            {label}
          </div>
          <div className="mt-3 text-[42px] leading-none font-medium tracking-tight tabular-nums text-ink">
            {value}
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11.5px] text-foreground/60">
            {trend && <TrendBadge delta={trend.delta} suffix={trend.suffix} />}
            {sub && <span>{sub}</span>}
          </div>
        </div>
        {series && series.length > 0 && (
          <div className="hidden sm:block w-[180px] h-[56px] shrink-0 text-ink/70">
            <Sparkline values={series} />
          </div>
        )}
      </div>
    </div>
  );
}

export function TrendBadge({ delta, suffix = "vs prior" }: { delta: number; suffix?: string }) {
  const rounded = Math.round(delta * 10) / 10;
  const Icon = rounded > 0 ? ArrowUpRight : rounded < 0 ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Icon className="w-3 h-3" strokeWidth={1.5} />
      <span className="text-ink">
        {rounded > 0 ? "+" : ""}
        {Number.isFinite(rounded) ? rounded : 0}%
      </span>
      <span className="text-foreground/45">{suffix}</span>
    </span>
  );
}

/** Compact monochrome sparkline. Pure SVG, no chart lib. */
export function Sparkline({
  values,
  className = "",
}: {
  values: number[];
  className?: string;
}) {
  if (!values.length) return null;
  const w = 180;
  const h = 56;
  const pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full h-full ${className}`} preserveAspectRatio="none">
      <path d={area} fill="currentColor" opacity={0.06} />
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-10 text-center text-[12px] text-foreground/50">
      {children}
    </div>
  );
}

export function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={"h-9 px-4 bg-ink text-background text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors " + (rest.className ?? "")}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={"h-9 px-3 text-[11px] tracking-[0.16em] uppercase text-foreground/70 hover:text-ink border border-ink/15 hover:border-ink/30 transition-colors disabled:opacity-50 " + (rest.className ?? "")}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-[9.5px] tracking-[0.24em] uppercase text-foreground/55 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={"w-full h-9 px-3 text-[13px] border border-ink/15 bg-background focus:border-ink/40 outline-none " + (props.className ?? "")}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...props}
      className={"w-full h-9 px-2 text-[13px] border border-ink/15 bg-background focus:border-ink/40 outline-none " + (props.className ?? "")}
    >
      {props.children}
    </select>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={"w-full min-h-[80px] p-3 text-[13px] border border-ink/15 bg-background focus:border-ink/40 outline-none " + (props.className ?? "")}
    />
  );
}

export function StatusPill({ tone = "neutral", children }: { tone?: "neutral" | "ok" | "warn" | "bad"; children: ReactNode }) {
  const tones: Record<string, string> = {
    neutral: "border-ink/20 text-foreground/70",
    ok: "border-emerald-700/40 text-emerald-800",
    warn: "border-amber-700/40 text-amber-800",
    bad: "border-red-700/40 text-red-800",
  };
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] tracking-[0.16em] uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function formatUSD(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}