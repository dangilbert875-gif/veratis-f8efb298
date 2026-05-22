import { Header } from "./Header";
import { Footer } from "./Footer";
import type { ReactNode } from "react";

export function Layout({ children, hideFooter }: { children: ReactNode; hideFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <section className="border-b border-border bg-mist/50">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-5">{eyebrow}</p>
        )}
        <h1 className="text-4xl md:text-6xl text-ink max-w-3xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{lead}</p>}
      </div>
    </section>
  );
}