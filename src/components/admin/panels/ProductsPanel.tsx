import { products } from "@/data/products";
import { Card, Empty, formatUSD } from "../ui";

export function ProductsPanel() {
  return (
    <Card title="Catalog" hint="Static product registry — edit via src/data/products.ts">
      {!products.length ? (
        <Empty>No products.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
              <tr>
                <th className="text-left font-medium px-5 py-3">Slug</th>
                <th className="text-left font-medium px-5 py-3">Name</th>
                <th className="text-left font-medium px-5 py-3">Category</th>
                <th className="text-right font-medium px-5 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.slug} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono text-foreground/70">{p.slug}</td>
                  <td className="px-5 py-3">{p.name}</td>
                  <td className="px-5 py-3 text-foreground/70">{p.category ?? "—"}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatUSD(p.price ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}