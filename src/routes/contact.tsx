import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VERATIS" },
      { name: "description", content: "Get in touch with the VERATIS team. We reply within one business day." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a chemist, not a script."
        lead="Whether it's a batch question, a custom assay, or a wholesale inquiry — we respond within one business day."
      />
      <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-5 gap-12">
        <form
          onSubmit={(e) => { e.preventDefault(); }}
          className="md:col-span-3 space-y-5 bg-background border border-border rounded-xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Name" type="text" />
            <Field label="Email" type="email" />
          </div>
          <Field label="Subject" type="text" />
          <div>
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Message</label>
            <textarea
              required
              rows={6}
              className="mt-2 w-full border border-border bg-background rounded-md px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <button className="bg-ink text-background px-6 py-3 rounded-md text-sm font-medium hover:bg-ink/90 transition">
            Send message
          </button>
        </form>
        <aside className="md:col-span-2 space-y-6 text-sm">
          {[
            [Mail, "Email", "hello@veratisbio.com"],
            [Phone, "Phone", "+1 (415) 555-0142"],
            [MapPin, "Lab", "1148 Mission St, Suite 220\nSan Francisco, CA 94103"],
          ].map(([Icon, label, value], i) => {
            const I = Icon as typeof Mail;
            return (
              <div key={i} className="border border-border rounded-lg p-5 bg-mist/40">
                <div className="flex items-center gap-2 text-primary">
                  <I size={16} />
                  <p className="text-xs uppercase tracking-[0.18em]">{label as string}</p>
                </div>
                <p className="mt-2 text-ink whitespace-pre-line">{value as string}</p>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Support hours: Monday–Friday, 9am–6pm PT. Orders placed on weekends ship Monday.
          </p>
        </aside>
      </section>
    </Layout>
  );
}

function Field({ label, type }: { label: string; type: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <input
        required
        type={type}
        className="mt-2 w-full border border-border bg-background rounded-md px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}