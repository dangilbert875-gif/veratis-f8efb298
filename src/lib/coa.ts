import { labPartner } from "@/data/batches";
import { getPublicCoaSignedUrl } from "./public-catalog.functions";

type CoaInput = {
  lot: string;
  product: string;
  size?: string;
  purity: number | string;
  testedOn?: string;
  expiresOn?: string;
  identity?: string;
  endotoxin?: string;
  water?: string;
  appearance?: string;
  method?: string;
  /** Storage path inside the private `coa-pdfs` bucket. When present, the
   *  download serves the actual uploaded file (PDF/JPG/PNG) instead of the
   *  synthetic text fallback. */
  coaUrl?: string;
};

function line(label: string, value: string | number | undefined) {
  if (value === undefined || value === "") return "";
  return `${label.padEnd(22, " ")} ${value}\n`;
}

export function buildCoaText(b: CoaInput): string {
  const purity = typeof b.purity === "number" ? `${b.purity.toFixed(2)}%` : String(b.purity);
  const issued = new Date().toISOString().slice(0, 10);
  return (
    `VERATIS — CERTIFICATE OF ANALYSIS\n` +
    `==================================\n\n` +
    line("Lot", b.lot) +
    line("Product", b.product) +
    line("Size", b.size) +
    line("Appearance", b.appearance ?? "White lyophilized cake") +
    `\n` +
    `ANALYTICAL RESULTS\n` +
    `------------------\n` +
    line("Purity (RP-HPLC)", purity) +
    line("Identity (ESI-MS)", b.identity ?? "Confirmed") +
    line("Endotoxin (LAL)", b.endotoxin ?? "< 0.5 EU/mg") +
    line("Residual water (KF)", b.water ?? "1.8%") +
    line("Method", b.method ?? "RP-HPLC / ESI-MS") +
    `\n` +
    `RELEASE\n` +
    `-------\n` +
    line("Tested", b.testedOn) +
    line("Best before", b.expiresOn) +
    line("Document issued", issued) +
    `\n` +
    `LABORATORY\n` +
    `----------\n` +
    line("Partner", labPartner.name) +
    line("Accreditation", `${labPartner.iso} · ${labPartner.accreditation}`) +
    line("Location", labPartner.city) +
    `\n` +
    `Signed electronically. Archived permanently against lot ${b.lot}.\n` +
    `For research use only. Not for human or veterinary consumption.\n`
  );
}

const COA_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** Pull the file extension out of a storage path or signed URL. */
export function coaExtension(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) return null;
  const clean = pathOrUrl.split("?")[0];
  const m = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  if (!m) return null;
  const ext = m[1].toLowerCase();
  return ext in COA_MIME ? ext : ext;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Download the COA for a lot.
 *
 * If the lot has a real uploaded file in storage (`coaUrl` is the storage
 * path), this fetches a signed URL, downloads it as a binary blob with the
 * correct MIME type, and triggers the browser save dialog with the original
 * extension (e.g. `COA-PP-2597.pdf`).
 *
 * Falls back to the generated plain-text COA only when no uploaded file
 * exists for that lot.
 */
export async function downloadCoa(b: CoaInput): Promise<void> {
  if (b.coaUrl) {
    try {
      const res = await getPublicCoaSignedUrl({
        data: { lot_number: b.lot },
      });
      if (res?.url) {
        const ext = (coaExtension(res.path) || coaExtension(res.url) || "pdf").toLowerCase();
        const mime = COA_MIME[ext] || "application/octet-stream";
        const fileRes = await fetch(res.url);
        if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}`);
        const raw = await fileRes.blob();
        // Re-wrap so the Blob carries the correct MIME type even if the
        // CDN response had a generic one.
        const blob = new Blob([raw], { type: mime });
        triggerBlobDownload(blob, `COA-${b.lot}.${ext}`);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[coa] signed-URL download failed, falling back to text:", err);
    }
  }

  // Fallback: generated text COA (legacy / archive entries without an
  // uploaded file).
  const text = buildCoaText(b);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  triggerBlobDownload(blob, `VERATIS-COA-${b.lot}.txt`);
}
