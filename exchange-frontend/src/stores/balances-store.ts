"use client";

import { create } from "zustand";
import { Balance } from "@/types/api";

interface BalancesState {
  balances: Balance[];
  setBalances: (balances: Balance[]) => void;
  patchBalance: (balance: { asset: string; available: number; locked: number }) => void;
  clear: () => void;
}

export const useBalancesStore = create<BalancesState>((set, get) => ({
  balances: [],
  setBalances: (balances) => set({ balances }),
  patchBalance: (incoming) => {
    const next = [...get().balances];
    const idx = next.findIndex((b) => b.asset === incoming.asset);
    const normalized = {
      asset: incoming.asset,
      available: incoming.available,
      locked: incoming.locked,
    };

    if (idx >= 0) next[idx] = normalized;
    else next.push(normalized);

    set({ balances: next });
  },
  clear: () => set({ balances: [] }),
}));