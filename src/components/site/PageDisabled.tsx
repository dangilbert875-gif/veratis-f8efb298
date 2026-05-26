import { Layout, PageHeader } from "./Layout";

export function PageDisabled({ title = "Page unavailable" }: { title?: string }) {
  return (
    <Layout>
      <PageHeader eyebrow="Notice" title={title} />
      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <p className="text-[14px] leading-relaxed text-foreground/70">
          This page is currently unavailable. Please check back later.
        </p>
      </section>
    </Layout>
  );
}