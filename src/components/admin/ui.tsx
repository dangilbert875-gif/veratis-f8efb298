import { ReactNode } from "react";

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

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="border border-ink/10 bg-background p-5">
      <div className="text-[9.5px] tracking-[0.28em] uppercase text-foreground/50">{label}</div>
      <div className="mt-2 text-[26px] font-medium tracking-tight tabular-nums text-ink">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-foreground/55">{sub}</div>}
    </div>
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