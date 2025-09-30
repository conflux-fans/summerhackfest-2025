// React hook for UX state management
// Based on UX_STATE_MANAGEMENT_SPEC.md

import type { UXState, UXStore } from "@chainbrawler/core";
import { useEffect, useState } from "react";

export function useUXState(store: UXStore): UXState {
  const [state, setState] = useState<UXState>(store.getState());

  useEffect(() => {
    // Update state when store changes
    setState(store.getState());
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, [store]);

  return state;
}
