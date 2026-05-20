import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPublishedProducts } from "./public-catalog.functions";
import { products as staticProducts, type Product } from "@/data/products";
import vialMaster from "@/assets/vial-master.jpg";

// Map a DB products row → the existing Product shape so the storefront UI
// renders unchanged regardless of data source.
export function mapDbProduct(row: any): Product {
  return {
    slug: row.slug,
    name: row.name,
    dosage: row.dosage ?? "",
    category: row.category ?? "Uncategorised",
    classification: row.molecular_class ?? undefined,
    size: row.size_label ?? row.dosage ?? "",
    price: Number(row.price_usd ?? 0),
    purity: row.purity ?? "—",
    image: row.featured_image || vialMaster,
    inStock: (row.stock_status ?? "in_stock") === "in_stock",
    lot: row.lot_number ?? "—",
    short: row.short_description ?? "",
    description: row.full_description ?? row.short_description ?? "",
  };
}

type State = {
  products: Product[];
  loading: boolean;
  error: string | null;
  source: "backend" | "fallback";
};

/**
 * Live catalog hook. Fetches published products from the backend and falls
 * back to the bundled static catalog if the request fails — the storefront
 * is never broken by a transient backend hiccup.
 */
export function useCatalog(): State {
  const fetchProducts = useServerFn(listPublishedProducts);
  const [state, setState] = useState<State>({
    products: staticProducts,
    loading: true,
    error: null,
    source: "fallback",
  });

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((rows) => {
        if (cancelled) return;
        const mapped = (rows ?? []).map(mapDbProduct);
        if (mapped.length === 0) {
          setState({ products: staticProducts, loading: false, error: null, source: "fallback" });
        } else {
          setState({ products: mapped, loading: false, error: null, source: "backend" });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // Silent fallback — keep the static catalog visible. Log for debugging.
        // eslint-disable-next-line no-console
        console.warn("[catalog] backend unavailable, using fallback:", err?.message ?? err);
        setState({
          products: staticProducts,
          loading: false,
          error: err?.message ?? "Catalog unavailable",
          source: "fallback",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchProducts]);

  return state;
}

/** Derive category list from a product set. */
export function deriveCategories(list: Product[]) {
  const names = Array.from(new Set(list.map((p) => p.category)));
  return names.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    count: list.filter((p) => p.category === name).length,
  }));
}