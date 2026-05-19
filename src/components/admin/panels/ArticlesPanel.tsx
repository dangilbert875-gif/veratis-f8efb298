import { articles } from "@/data/articles";
import { Card, Empty } from "../ui";

export function ArticlesPanel() {
  return (
    <Card title="Educational publications" hint="Reference library — edit via src/data/articles.ts">
      {!articles.length ? (
        <Empty>No articles.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="text-[10px] tracking-[0.18em] uppercase text-foreground/55 border-b border-ink/10">
              <tr>
                <th className="text-left font-medium px-5 py-3">Slug</th>
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Category</th>
                <th className="text-left font-medium px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.slug} className="border-b border-ink/5">
                  <td className="px-5 py-3 font-mono text-foreground/70">{a.slug}</td>
                  <td className="px-5 py-3">{a.title}</td>
                  <td className="px-5 py-3 text-foreground/70">{a.category}</td>
                  <td className="px-5 py-3 text-foreground/70">{a.updatedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}