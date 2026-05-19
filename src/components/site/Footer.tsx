import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { batches } from "@/data/batches";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function Footer() {
  const lotCount = batches.length;
  const avgPurity = (batches.reduce((s, b) => s + b.purity, 0) / batches.length).toFixed(2);

  return (
    <footer className="bg-ink text-background/80 mt-32">
      {/* Top: institutional verification rail */}
      <div className="border-b border-background/10">
        <div className="mx-auto max-w-7xl px-6 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-3 text-[10.5px] font-mono uppercase tracking-[0.2em] text-background/55">
            <ShieldCheck size={14} className="text-primary" strokeWidth={1.5} />
            <span>Verification archive</span>
            <span className="text-background/20">·</span>
            <span className="tabular-nums">{lotCount} lots</span>
            <span className="text-background/20">·</span>
            <span className="tabular-nums">{avgPurity}% mean purity</span>
          </div>
          <Link
            to="/verify"
            className="group inline-flex items-center justify-between gap-3 h-11 pl-4 pr-2 rounded-[3px] border border-background/15 bg-background/[0.04] hover:border-primary/60 transition w-full md:w-[340px]"
          >
            <span className="font-mono text-[12px] tabular-nums tracking-[0.08em] text-background/55">
              PP-XXXX
            </span>
            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[2px] bg-primary text-primary-foreground text-[10.5px] font-medium uppercase tracking-[0.16em]">
              Verify <ArrowRight size={11} />
            </span>
          </Link>
        </div>
      </div>

      {/* Body: 4 columns + brand block */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-10">
        <div className="col-span-2 md:col-span-4">
          <Logo className="h-auto w-[140px] opacity-90" />
          <p className="mt-6 text-[13px] text-background/55 leading-[1.75] max-w-xs">
            A verification platform for research peptides. Every lot independently assayed, signed, archived, and publicly retrievable.
          </p>
          <p className="mt-6 text-[10.5px] font-mono uppercase tracking-[0.2em] text-background/40">
            Veratisbio.com
          </p>
        </div>

        <FooterCol title="Catalog" links={[
          ["All peptides", "/shop"],
          ["Tissue recovery", "/shop"],
          ["Neuro research", "/shop"],
          ["Cellular longevity", "/shop"],
          ["Performance research", "/shop"],
        ]} />
        <FooterCol title="Verification" links={[
          ["Verify a batch", "/verify"],
          ["COA archive", "/coa-archive"],
          ["Testing standards", "/standards"],
          ["Lab partner", "/lab-testing"],
        ]} />
        <FooterCol title="Company" links={[
          ["About", "/about"],
          ["Education", "/blog"],
          ["FAQ", "/faq"],
          ["How to pay", "/how-to-pay"],
          ["Shipping & returns", "/shipping-returns"],
          ["Contact", "/contact"],
        ]} />
      </div>

      {/* Legal */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-[11px] leading-relaxed text-background/45 space-y-4">
          <p className="max-w-4xl">
            For research use only. Products are intended for in-vitro laboratory and research applications and are not intended to diagnose, treat, cure, or prevent any disease. Not for human or veterinary consumption.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10.5px] font-mono uppercase tracking-[0.16em] text-background/35">
            <p>© {new Date().getFullYear()} Veratis · All rights reserved</p>
            <p>Documented · Verified · Archived</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="md:col-span-2">
      <h4 className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-background/40 mb-5">{title}</h4>
      <ul className="space-y-3 text-[13px]">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-background/75 hover:text-background transition">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}