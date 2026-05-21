import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VERATIS" },
      { name: "description", content: "Get in touch with the VERATIS team. We reply within one business day." },
      { property: "og:title", content: "Contact VERATIS" },
      { property: "og:description", content: "Talk to a chemist, not a script. Batch questions, custom assays, and wholesale inquiries answered within one business day." },
      { property: "og:url", content: "https://pure-peptide-labs.lovable.app/contact" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const subject = encodeURIComponent(String(data.get("subject") ?? "VERATIS inquiry"));
    const body = encodeURIComponent(
      `Name: ${data.get("name") ?? ""}\nEmail: ${data.get("email") ?? ""}\n\n${data.get("message") ?? ""}`,
    );
    // Open the user's mail client as a graceful submission fallback.
    window.location.href = `mailto:support@veratisbio.com?subject=${subject}&body=${body}`;
    setSent(true);
    form.reset();
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a chemist, not a script."
        lead="Whether it's a batch question, a custom assay, or a wholesale inquiry — we respond within one business day."
      />
      <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-5 gap-12">
        <form
          onSubmit={onSubmit}
          className="md:col-span-3 space-y-5 bg-background border border-border rounded-xl p-8"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Name" type="text" name="name" />
            <Field label="Email" type="email" name="email" />
          </div>
          <Field label="Subject" type="text" name="subject" />
          <div>
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Message</label>
            <textarea
              name="message"
              required
              rows={6}
              className="mt-2 w-full border border-border bg-background rounded-md px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-ink text-background px-6 py-3 rounded-md text-sm font-medium hover:bg-ink/90 transition"
            >
              Send message
            </button>
            {sent && (
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                Draft opened in your mail client
              </p>
            )}
          </div>
        </form>
        <aside className="md:col-span-2 space-y-6 text-sm">
          {[
            [Mail, "Email", "support@veratisbio.com"],
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

function Field({ label, type, name }: { label: string; type: string; name: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <input
        name={name}
        required
        type={type}
        className="mt-2 w-full border border-border bg-background rounded-md px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}