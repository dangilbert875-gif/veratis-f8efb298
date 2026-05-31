import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { Mail, MessageCircle, Megaphone, Clock, HelpCircle, Package, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact. VERATIS" },
      { name: "description", content: "Get in touch with the VERATIS team. We reply within one business day." },
      { property: "og:title", content: "Contact VERATIS" },
      { property: "og:description", content: "Talk to a chemist, not a script. Batch questions, custom assays, and wholesale inquiries answered within one business day." },
      { property: "og:url", content: "https://veratisbio.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://veratisbio.com/contact" }],
  }),
  component: Contact,
});

const SUBJECTS = [
  "COA or verification question",
  "Order status or shipping",
  "Bulk / Wholesale inquiry",
  "Custom assay request",
  "Press or partnership",
  "Other",
];

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

function Contact() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function onEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const v = e.currentTarget.value.trim();
    if (v && !validateEmail(v)) {
      setErrors((p) => ({ ...p, email: "Enter a valid email address." }));
    } else {
      setErrors((p) => ({ ...p, email: undefined }));
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot. silently reject bots
    if (String(data.get("website") ?? "").length > 0) {
      setSent(true);
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const emailV = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "");
    const messageV = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = "Please enter your name.";
    if (!emailV) next.email = "Email is required.";
    else if (!validateEmail(emailV)) next.email = "Enter a valid email address.";
    if (!subject) next.subject = "Please select a topic.";
    if (!messageV) next.message = "Message is required.";
    else if (messageV.length < 20) next.message = "Message must be at least 20 characters.";
    else if (messageV.length > 1000) next.message = "Message must be 1000 characters or fewer.";

    if (Object.values(next).some(Boolean)) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSentEmail(emailV);

    const subj = encodeURIComponent(subject);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${emailV}\n\n${messageV}`);
    window.location.href = `mailto:support@veratisbio.com?subject=${subj}&body=${body}`;
    setSent(true);
    form.reset();
    setMessage("");
    setEmail("");
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayLabel = tomorrow.toLocaleDateString(undefined, { weekday: "long" });

  return (
    <Layout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a chemist, not a script."
        lead="Reach us on Telegram for the fastest response. Email works too. we reply within one business day."
      />

      {/* Self-serve prompt */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link
          to="/faq"
          className="flex items-center justify-between gap-3 border border-primary/30 bg-primary/5 rounded-md px-4 py-3 text-sm hover:bg-primary/10 transition"
        >
          <span className="flex items-center gap-2 text-ink">
            <HelpCircle size={16} className="text-primary" />
            Most questions are answered in our FAQ
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Browse FAQ →</span>
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          {sent ? (
            <div className="bg-background border border-border rounded-xl p-8 text-center space-y-4">
              <CheckCircle2 className="mx-auto text-primary" size={36} />
              <h3 className="font-serif text-2xl text-ink">Message received.</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                A chemist will reply within one business day to{" "}
                <span className="text-ink font-medium">{sentEmail || "your email"}</span>. Check spam if you don't see a reply by {dayLabel}.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setSentEmail("");
                }}
                className="mt-2 border border-border px-5 py-2.5 rounded-md text-sm hover:border-ink transition"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              className="space-y-5 bg-background border border-border rounded-xl p-8"
            >
              {/* Response time badge */}
              <div className="inline-flex items-center gap-2 bg-mist/70 px-3 py-1.5 rounded-full">
                <Clock size={12} className="text-muted-foreground" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Median response time: 4 hours during support hours
                </span>
              </div>

              {/* Honeypot */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Name" type="text" name="name" required error={errors.name} />
                <Field
                  label="Email"
                  type="email"
                  name="email"
                  required
                  error={errors.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={onEmailBlur}
                />
              </div>

              <div>
                <label htmlFor="field-subject" className="block mb-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Subject <span className="text-destructive">*</span>
                </label>
                <select
                  id="field-subject"
                  aria-label="Subject"
                  name="subject"
                  required
                  defaultValue=""
                  className={`w-full border bg-background rounded-md px-3 py-[14px] text-sm outline-none focus:border-primary transition ${
                    errors.subject ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="" disabled>Select a topic…</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.subject && <p className="mt-1.5 text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="field-message" className="block mb-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="field-message"
                  aria-label="Message"
                  name="message"
                  required
                  rows={6}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full border bg-background rounded-md px-3 py-[14px] text-sm outline-none focus:border-primary transition ${
                    errors.message ? "border-destructive" : "border-border"
                  }`}
                />
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-destructive">{errors.message ?? ""}</span>
                  <span className={`font-mono ${message.length > 1000 || message.length < 20 ? "text-muted-foreground" : "text-muted-foreground"}`}>
                    {message.length} / 1000 {message.length < 20 && <span className="ml-1">(min 20)</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-ink text-background px-6 py-3 rounded-md text-sm font-medium hover:bg-ink/90 transition min-h-[48px]"
                >
                  Send to chemist →
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="md:col-span-2 space-y-4 text-sm">
          {/* Existing order redirect */}
          <div className="flex items-start gap-2 border border-border/70 bg-mist/30 rounded-md px-4 py-3">
            <Package size={14} className="mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="text-ink font-medium">Existing order?</span> Reply directly to your order confirmation email for the fastest service.
            </p>
          </div>

          {/* Channel notice */}
          <div className="flex items-start gap-2 border border-primary/20 bg-primary/5 rounded-md px-4 py-3">
            <Zap size={14} className="mt-0.5 text-primary shrink-0" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="text-ink font-medium">Telegram is our fastest response channel.</span> We also respond to emails. typically within one business day.
            </p>
          </div>

          <ContactCard
            Icon={MessageCircle}
            label="Telegram"
            value="@veratisbio"
            href="https://t.me/veratisbio"
            helper="Fastest way to reach us. Typical reply in under 30 minutes during support hours."
            primary
            badge="FASTEST RESPONSE"
            cta={{ label: "Open Telegram", href: "https://t.me/veratisbio" }}
          />
          <ContactCard
            Icon={Megaphone}
            label="Telegram channel"
            value="@VeratisUpdates"
            href="https://t.me/VeratisUpdates"
            helper="Public announcements only. New lots, COAs, standards. No DMs."
          />
          <ContactCard
            Icon={Mail}
            label="Email"
            value="support@veratisbio.com"
            href="mailto:support@veratisbio.com"
            helper="Also available for written inquiries. Typical reply within one business day. Tracked and logged."
          />

          <p className="text-xs text-muted-foreground leading-relaxed pt-2">
            Support hours: Monday–Friday, 9am–6pm PT. Orders placed on weekends ship Monday.
          </p>
        </aside>
      </section>

      {/* By the numbers */}
      <section className="border-t border-border bg-mist/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground text-center mb-10">
            By the numbers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
            <Stat value="04 hours" label="Median response time" />
            <Stat value="24 hours" label="Max response time, business days" />
            <Stat value="100%" label="Responses from a chemist, not a script" />
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-4xl md:text-5xl text-ink">{value}</p>
      <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
        {label}
      </p>
    </div>
  );
}

function ContactCard({
  Icon,
  label,
  value,
  href,
  helper,
  primary,
  badge,
  cta,
}: {
  Icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  helper: string;
  primary?: boolean;
  badge?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className={`border rounded-lg bg-mist/40 ${primary ? "border-primary/30 p-6 bg-mist/70" : "border-border p-5"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Icon size={16} />
          <p className="text-xs font-mono uppercase tracking-[0.18em]">{label}</p>
        </div>
        {badge && (
          <span className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
            {badge}
          </span>
        )}
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 text-ink whitespace-pre-line block hover:underline">
          {value}
        </a>
      ) : (
        <p className="mt-2 text-ink whitespace-pre-line">{value}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground/80 leading-relaxed">{helper}</p>
      {cta && (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 border border-ink px-4 py-2 rounded-md text-sm hover:bg-ink hover:text-background transition"
        >
          {cta.label}
          <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
}

function Field({
  label,
  type,
  name,
  required,
  error,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  type: string;
  name: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={`field-${name}`} className="block mb-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={`field-${name}`}
        aria-label={label}
        name={name}
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full border bg-background rounded-md px-3 py-[14px] text-sm outline-none focus:border-primary transition ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
