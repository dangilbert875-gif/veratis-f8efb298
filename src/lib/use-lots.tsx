import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPublicLots } from "./public-catalog.functions";
import { batches as staticBatches, type Batch } from "@/data/batches";

/** Map a public DB lot row → the existing Batch shape used across the UI. */
export function mapDbLot(row: any): Batch {
  const purityNum = (() => {
    const m = String(row.purity ?? "").match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  })();
  return {
    lot: row.lot_number ?? "",
    product: row.products?.name ?? "—",
    slug: row.products?.slug ?? "",
    size: "",
    purity: purityNum,
    identity: "Confirmed",
    endotoxin: row.endotoxin ?? "—",
    water: row.water_content ?? "—",
    appearance: "—",
    testedOn: row.release_date ?? "",
    expiresOn: row.best_before ?? "",
    lab: row.lab_partner ?? "—",
    method: row.identity_method ?? "—",
    released: true,
    notes: undefined,
  };
}

type State = {
  batches: Batch[];
  loading: boolean;
  source: "backend" | "fallback";
};

/**
 * Public verification-archive hook. Fetches released + publicly visible
 * lots, falls back to the bundled static archive only on backend error
 * (never when the backend returns an empty published set — empty means
 * "nothing is publicly released right now").
 */
export function usePublicLots(): State {
  const fetchLots = useServerFn(listPublicLots);
  const [state, setState] = useState<State>({
    batches: staticBatches,
    loading: true,
    source: "fallback",
  });

  useEffect(() => {
    let cancelled = false;
    fetchLots()
      .then((rows) => {
        if (cancelled) return;
        const mapped = (rows ?? []).map(mapDbLot);
        setState({ batches: mapped, loading: false, source: "backend" });
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn("[lots] backend unavailable, using fallback:", err?.message ?? err);
        setState({ batches: staticBatches, loading: false, source: "fallback" });
      });
    return () => { cancelled = true; };
  }, [fetchLots]);

  return state;
}
