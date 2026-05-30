"use client";

import { create } from "zustand";

interface OrderbookState {
  bids: [string, string][];
  asks: [string, string][];
  setDepth: (bids: [string, string][], asks: [string, string][]) => void;
  patchDepth: (bids: [string, string][], asks: [string, string][]) => void;
  clear: () => void;
}

function mergeSide(current: [string, string][], updates: [string, string][]) {
  const map = new Map(current.map(([price, qty]) => [price, qty]));
  for (const [price, qty] of updates) {
    if (qty === "0") map.delete(price);
    else map.set(price, qty);
  }
  return Array.from(map.entries()) as [string, string][];
}

export const useOrderbookStore = create<OrderbookState>((set, get) => ({
  bids: [],
  asks: [],
  setDepth: (bids, asks) => set({ bids, asks }),
  patchDepth: (bids, asks) =>
    set({
      bids: mergeSide(get().bids, bids),
      asks: mergeSide(get().asks, asks),
    }),
  clear: () => set({ bids: [], asks: [] }),
}));