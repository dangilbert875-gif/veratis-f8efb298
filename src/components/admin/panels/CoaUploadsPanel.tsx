import { Card } from "../ui";
import { batches, labPartner } from "@/data/batches";

export function CoaUploadsPanel() {
  return (
    <div className="space-y-5">
      <Card title="Certificate uploads" hint={`Lab of record · ${labPartner.name} · ${labPartner.iso}`}>
        <div className="px-5 py-6 text-[12.5px] text-foreground/70 leading-relaxed">
          Released certificates are signed and rendered on demand from the verification archive.
          To attach a new PDF or replace a signed certificate, drop the file into the lot folder
          on the secure analytical share — the archive will pick it up on the next index sweep.
        </div>
      </Card>
      <Card title="Pending lots" hint="Awaiting release signature">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
              <tr>
                <th className="text-left font-medium px-5 py-3">Lot</th>
                <th className="text-left font-medium px-5 py-3">Product</th>
                <th className="text-left font-medium px-5 py-3">Tested</th>
              </tr>
            </thead>
            <tbody>
              {batches.filter((b) => !b.released).slice(0, 12).map((b) => (
                <tr key={b.lot} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono">{b.lot}</td>
                  <td className="px-5 py-3">{b.product}</td>
                  <td className="px-5 py-3 text-foreground/70">{b.testedOn}</td>
                </tr>
              ))}
              {!batches.some((b) => !b.released) && (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-[12px] text-foreground/50">All released.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}