import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-mist mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <span className="font-display text-[1.4rem] tracking-[0.34em] text-ink leading-none block">
            VERATIS
          </span>
          <p className="mt-5 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Research-grade peptides with verified purity and full batch documentation.
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
            VeratisBio.com
          </p>
          <form className="mt-6 flex max-w-sm border border-border rounded-md overflow-hidden bg-background">
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
            />
            <button type="submit" className="px-4 text-sm font-medium bg-ink text-background hover:bg-ink/90 transition">
              Subscribe
            </button>
          </form>
        </div>
        <FooterCol title="Shop" links={[
          ["Shop all", "/shop"],
          ["Recovery", "/shop"],
          ["Cognition", "/shop"],
          ["Stacks", "/shop"],
        ]} />
        <FooterCol title="Trust" links={[
          ["Verify batch", "/verify"],
          ["COA archive", "/coa-archive"],
          ["Testing standards", "/standards"],
          ["Shipping & Returns", "/shipping-returns"],
        ]} />
        <FooterCol title="Company" links={[
          ["About", "/about"],
          ["Education", "/blog"],
          ["FAQ", "/faq"],
          ["Contact", "/contact"],
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 text-[11px] leading-relaxed text-muted-foreground space-y-3">
          <p className="max-w-4xl">
            Disclaimer: Products are intended for research purposes only and are not intended to diagnose, treat, cure, or prevent any disease. All products sold by VERATIS are for in-vitro laboratory and research use. Not for human or veterinary consumption.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Veratis · VeratisBio.com · All rights reserved.</p>
            <p>Made with care in the USA.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.18em] text-ink/70 font-sans font-semibold mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-foreground/75 hover:text-foreground transition">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}