import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { products } from "@/data/products";
import { articles } from "@/data/articles";
import { batches, findBatch } from "@/data/batches";
import { Search as SearchIcon, X } from "lucide-react";

type Result =
  | { kind: "product"; slug: string; title: string; meta: string }
  | { kind: "article"; slug: string; title: string; meta: string }
  | { kind: "batch"; lot: string; slug: string; title: string; meta: string };

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQ("");
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo<Result[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const out: Result[] = [];
    // Direct lot match first
    const exact = findBatch(s);
    if (exact) {
      out.push({
        kind: "batch",
        lot: exact.lot,
        slug: exact.slug,
        title: `Lot ${exact.lot}`,
        meta: `${exact.product} · ${exact.purity.toFixed(2)}% · ${exact.testedOn}`,
      });
    }
    for (const p of products) {
      if (
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        p.slug.toLowerCase().includes(s) ||
        p.lot.toLowerCase().includes(s)
      ) {
        out.push({
          kind: "product",
          slug: p.slug,
          title: p.name.replace(/\s*VIAL\s*$/i, ""),
          meta: `${p.category} · ${p.size} · $${p.price}`,
        });
      }
      if (out.length >= 24) break;
    }
    for (const b of batches) {
      if (out.length >= 30) break;
      if (b.lot.toLowerCase().includes(s) && b.lot.toLowerCase() !== s) {
        out.push({
          kind: "batch",
          lot: b.lot,
          slug: b.slug,
          title: `Lot ${b.lot}`,
          meta: `${b.product} · ${b.purity.toFixed(2)}%`,
        });
      }
    }
    for (const a of articles) {
      if (out.length >= 40) break;
      if (
        a.title.toLowerCase().includes(s) ||
        a.category.toLowerCase().includes(s) ||
        a.deck.toLowerCase().includes(s)
      ) {
        out.push({
          kind: "article",
          slug: a.slug,
          title: a.title,
          meta: `Education · ${a.category}`,
        });
      }
    }
    return out;
  }, [q]);

  if (!open) return null;

  function go(r: Result) {
    onClose();
    if (r.kind === "product") navigate({ to: "/shop/$slug", params: { slug: r.slug } });
    else if (r.kind === "article") navigate({ to: "/blog/$slug", params: { slug: r.slug } });
    else navigate({ to: "/shop/$slug", params: { slug: r.slug } });
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/55 backdrop-blur-sm flex items-start justify-center px-4 pt-[10vh] animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search the archive"
    >
      <div className="w-full max-w-2xl bg-background border border-border rounded-[4px] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] overflow-hidden">
        <div className="flex items-center gap-3 px-5 h-14 border-b border-border">
          <SearchIcon size={16} className="text-foreground/55" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search compounds, lots, or articles…"
            className="flex-1 bg-transparent outline-none text-[14px] text-ink placeholder:text-foreground/45"
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0]);
            }}
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-[3px] text-foreground/55 hover:text-ink hover:bg-mist transition"
          >
            <X size={15} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() === "" ? (
            <div className="px-5 py-10 text-center text-[12px] font-mono uppercase tracking-[0.2em] text-foreground/50">
              Type to search the archive
            </div>
          ) : results.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-foreground/60">
              No results for "{q}".
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((r, i) => (
                <li key={`${r.kind}-${i}`}>
                  <button
                    onClick={() => go(r)}
                    className="w-full text-left px-5 py-3.5 hover:bg-mist/60 transition flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-[13.5px] text-ink truncate">{r.title}</p>
                      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-foreground/55 truncate mt-1">
                        {r.meta}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/45 shrink-0">
                      {r.kind === "product" ? "Catalog" : r.kind === "article" ? "Article" : "Lot"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
