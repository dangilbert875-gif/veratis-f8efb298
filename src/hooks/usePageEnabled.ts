import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "enabled" | "disabled";

const cache = new Map<string, boolean>();

export function usePageEnabled(pageKey: string): State {
  const [state, setState] = useState<State>(() => {
    if (cache.has(pageKey)) return cache.get(pageKey) ? "enabled" : "disabled";
    return "loading";
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("page_toggles")
        .select("enabled")
        .eq("page_key", pageKey)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        cache.set(pageKey, true);
        setState("enabled");
        return;
      }
      cache.set(pageKey, data.enabled);
      setState(data.enabled ? "enabled" : "disabled");
    })();
    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  return state;
}