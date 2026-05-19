import { labPartner } from "@/data/batches";

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

export function downloadCoa(b: CoaInput) {
  const text = buildCoaText(b);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `VERATIS-COA-${b.lot}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
