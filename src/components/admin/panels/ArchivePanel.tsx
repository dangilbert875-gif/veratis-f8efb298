import { batches, labPartner } from "@/data/batches";
import { Card, Empty, StatusPill } from "../ui";

export function ArchivePanel() {
  return (
    <Card title="Verification archive" hint={`Released lots — analysis by ${labPartner.name}`}>
      {!batches.length ? (
        <Empty>No batches recorded.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
              <tr>
                <th className="text-left font-medium px-5 py-3">Lot</th>
                <th className="text-left font-medium px-5 py-3">Product</th>
                <th className="text-right font-medium px-5 py-3">Purity</th>
                <th className="text-left font-medium px-5 py-3">Tested</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.lot} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono">{b.lot}</td>
                  <td className="px-5 py-3">{b.product}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{b.purity.toFixed(2)}%</td>
                  <td className="px-5 py-3 text-foreground/70">{b.testedOn}</td>
                  <td className="px-5 py-3">
                    <StatusPill tone={b.released ? "ok" : "warn"}>{b.released ? "Released" : "Pending"}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}