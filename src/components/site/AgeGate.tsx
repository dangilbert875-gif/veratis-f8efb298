import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const STORAGE_KEY = "pp-age-verified";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setVerified(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setVerified(false);
    }
  }, []);

  useEffect(() => {
    if (verified === false) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [verified]);

  const handleYes = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setVerified(true);
  };

  const handleNo = () => {
    window.location.href = "/age-restricted-not-found";
  };

  const gated = verified === false;
  const pending = verified === null;

  return (
    <>
      {/*
        Security: do not render gated content into the DOM until the visitor
        has confirmed age. Visual blur is not a content guard. withholding the
        markup prevents trivial DevTools bypass of the gate.
      */}
      {verified === true ? (
        children
      ) : (
        <div aria-hidden="true" className="min-h-screen bg-background" />
      )}
      {gated && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          onKeyDown={(e) => e.preventDefault()}
        >
          <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-8 md:p-10 text-center">
            <div className="flex justify-center">
              <Logo height={22} />
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-primary">
              Age verification
            </p>
            <h2
              id="age-gate-title"
              className="mt-3 font-display text-2xl md:text-3xl text-ink"
            >
              Are you over 21?
            </h2>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              You must be over 21 to visit this site. By clicking{" "}
              <span className="text-ink">"Yes"</span>, you confirm that you are
              21 years of age or older, agree that any products purchased will
              be used strictly for research purposes and accept our{" "}
              <a
                href="/shipping-returns"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                Terms of Service
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNo}
                className="order-2 sm:order-1 flex-1 border border-border bg-background text-ink rounded-md text-sm font-medium px-6 py-3.5 hover:bg-mist transition"
              >
                No
              </button>
              <button
                onClick={handleYes}
                autoFocus
                className="order-1 sm:order-2 flex-1 bg-ink text-background rounded-md text-sm font-medium px-6 py-3.5 hover:bg-ink/90 transition"
              >
                Yes, I am 21+
              </button>
            </div>
          </div>
        </div>
      )}
      {pending && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[100] bg-background"
        />
      )}
    </>
  );
}
