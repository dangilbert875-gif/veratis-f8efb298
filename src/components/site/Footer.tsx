import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { batches, labPartner } from "@/data/batches";
import { ArrowRight, ShieldCheck, Snowflake, Lock, Archive } from "lucide-react";

export function Footer() {
  const lotCount = batches.length;
  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);
  const lastRelease = batches[0]?.testedOn ?? "—";

  return (
    <footer className="bg-ink text-background/80 mt-20">
      {/* Top: institutional verification rail */}
      <div className="border-b border-background/10">
        <div className="mx-auto max-w-7xl px-6 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em] text-background/55">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" strokeWidth={1.5} />
              Verification archive
            </span>
            <span className="text-background/20">·</span>
            <span className="tabular-nums">{lotCount} lots</span>
            <span className="text-background/20">·</span>
            <span className="tabular-nums">{avgPurity}% mean purity</span>
            <span className="hidden md:inline text-background/20">·</span>
            <span className="hidden md:inline tabular-nums">last release {lastRelease}</span>
          </div>
          <Link
            to="/verify"
            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-2 sm:h-11 sm:py-0 sm:pl-4 sm:pr-2 rounded-[3px] border border-background/15 bg-background/[0.04] hover:border-primary/60 active:scale-[0.99] transition w-full md:w-[340px]"
          >
            <span className="font-mono text-[12px] tabular-nums tracking-[0.08em] text-background/55 px-1 sm:px-0">
              PP-XXXX
            </span>
            <span className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-8 px-3 rounded-[2px] bg-primary text-primary-foreground text-[10.5px] font-medium uppercase tracking-[0.16em]">
              Verify <ArrowRight size={11} />
            </span>
          </Link>
        </div>
      </div>

      {/* Body: editorial brand block + linkrails */}
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-16 grid grid-cols-2 md:grid-cols-12 gap-y-14 gap-x-10">
        <div className="col-span-2 md:col-span-4 lg:col-span-4">
          <p className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.022em] text-background max-w-md">
            Documented. Verified. Archived.
          </p>
          <p className="mt-5 text-[13.5px] text-background/55 leading-[1.8] max-w-md">
            A verification platform for research peptides. Every lot independently assayed, signed, archived, and publicly retrievable — for the lifetime of the lot.
          </p>
          <Logo className="mt-8 h-auto w-[168px] lg:w-[188px] text-background opacity-90" />
          <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] font-mono uppercase tracking-[0.18em] text-background/50">
            {[
              [ShieldCheck, "ISO 17025"],
              [Snowflake, "Cold-chain"],
              [Lock, "Encrypted checkout"],
              [Archive, "Permanent archive"],
            ].map(([Ic, l], i) => {
              const I = Ic as typeof ShieldCheck;
              return (
                <li key={i} className="inline-flex items-center gap-1.5">
                  <I size={11} className="text-primary/80" strokeWidth={1.5} /> {l as string}
                </li>
              );
            })}
          </ul>
        </div>

        <FooterCol title="Catalog" links={[
          ["All peptides", "/shop"],
          ["Tissue recovery", "/shop?category=Tissue%20Recovery"],
          ["Regenerative", "/shop?category=Regenerative"],
          ["Growth hormone", "/shop?category=Growth%20Hormone"],
          ["Metabolic", "/shop?category=Metabolic"],
          ["Mitochondrial", "/shop?category=Mitochondrial"],
        ]} />
        <FooterCol title="Verification" links={[
          ["Verify a batch", "/verify"],
          ["How we verify", "/verification"],
          ["COA archive", "/coa-archive"],
          ["Testing standards", "/standards"],
        ]} />
        <FooterCol title="Standards" links={[
          ["Privacy policy", "/privacy"],
          ["Terms & conditions", "/terms"],
          ["Shipping & returns", "/shipping-returns"],
          ["Research use disclaimer", "/research-use"],
          ["Payment policy", "/payment-policy"],
        ]} />
        <FooterCol title="Company" links={[
          ["About", "/about"],
          ["Education", "/blog"],
          ["FAQ", "/faq"],
          ["How to pay", "/how-to-pay"],
          ["Contact", "/contact"],
        ]} />
      </div>

      {/* Calibration footer — operational signature */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-6 py-6 grid md:grid-cols-3 gap-y-3 gap-x-6 items-center text-[10px] font-mono uppercase tracking-[0.2em] text-background/40">
          <a
            href="https://customer.a2la.org/index.cfm?event=directory.detail&labPID=21BAB387-46B2-4FC4-A09C-7593CB8AC4C9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start md:self-center px-3 py-1.5 rounded-full border border-background/25 text-background/70 hover:border-primary/60 hover:text-background transition-colors tabular-nums w-fit"
          >
            <ShieldCheck size={11} className="text-primary" strokeWidth={1.5} />
            <span>{labPartner.iso} · {labPartner.accreditation}</span>
          </a>
          <p className="text-center tabular-nums">Archive partition 01 · veratis-archive · main</p>
          <p className="md:text-right tabular-nums">Build · ver. {new Date().getFullYear()}.{(new Date().getMonth() + 1).toString().padStart(2, "0")}</p>
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-[11px] leading-relaxed text-background/45 space-y-4">
          <div className="flex items-center gap-3 text-background/55">
            <span className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-background/40">Secure checkout</span>
            <span className="h-px flex-1 max-w-[40px] bg-background/15" aria-hidden />
            <div className="flex items-center gap-2.5 opacity-80" aria-label="Accepted payment methods">
              {/* Stripe */}
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-[3px] border border-background/20 text-[9.5px] font-bold tracking-wide text-background/70">stripe</span>
              {/* Visa */}
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-[3px] border border-background/20 text-[9.5px] font-bold italic tracking-wider text-background/70">VISA</span>
              {/* Mastercard */}
              <span className="inline-flex items-center justify-center h-6 w-9 rounded-[3px] border border-background/20" aria-label="Mastercard">
                <span className="relative inline-block w-6 h-3">
                  <span className="absolute left-0 top-0 w-3 h-3 rounded-full bg-background/55" />
                  <span className="absolute right-0 top-0 w-3 h-3 rounded-full bg-background/35" />
                </span>
              </span>
              {/* Amex */}
              <span className="inline-flex items-center justify-center h-6 px-2 rounded-[3px] border border-background/20 text-[9.5px] font-bold tracking-tight text-background/70">AMEX</span>
            </div>
          </div>
          <p className="max-w-4xl">
            For research use only. Products are intended for in-vitro laboratory and research applications and are not intended to diagnose, treat, cure, or prevent any disease. Not for human or veterinary consumption.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10.5px] font-mono uppercase tracking-[0.16em] text-background/35">
            <p>© {new Date().getFullYear()} Veratis · All rights reserved</p>
            <p>Veratisbio.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2 lg:col-span-2">
      <h4 className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/85 mb-6 pb-3 border-b border-background/10">
        {title}
      </h4>
      <ul className="space-y-3.5 text-[13px]">
        {links.map(([label, to]) => {
          const [pathname, query] = to.split("?");
          const search = query
            ? Object.fromEntries(new URLSearchParams(query).entries())
            : undefined;
          return (
            <li key={label}>
              <Link
                to={pathname}
                search={search as any}
                className="group inline-flex items-center gap-1.5 text-background/75 hover:text-background transition-colors"
              >
                <span className="border-b border-transparent group-hover:border-background/40 transition-colors">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
