import { create } from "zustand";
import { DepthLevel } from "@/types/api";

interface OrderbookState {
  bids: DepthLevel[];
  asks: DepthLevel[];
  setDepth: (bids: DepthLevel[], asks: DepthLevel[]) => void;
  applyDepthDelta: (bids: DepthLevel[], asks: DepthLevel[]) => void;
  clear: () => void;
}

function mergeSide(
  current: DepthLevel[],
  updates: DepthLevel[],
  descending: boolean
): DepthLevel[] {
  const map = new Map<string, string>();

  for (const [price, qty] of current) {
    if (Number(qty) > 0) map.set(price, qty);
  }

  for (const [price, qty] of updates) {
    if (Number(qty) <= 0) {
      map.delete(price);
    } else {
      map.set(price, qty);
    }
  }

  return Array.from(map.entries())
    .map(([price, qty]) => [price, qty] as DepthLevel)
    .sort((a, b) =>
      descending
        ? Number(b[0]) - Number(a[0])
        : Number(a[0]) - Number(b[0])
    );
}

export const useOrderbookStore = create<OrderbookState>((set, get) => ({
  bids: [],
  asks: [],

  setDepth: (bids, asks) => set({ bids, asks }),

  applyDepthDelta: (bids, asks) => {
    const current = get();
    set({
      bids: mergeSide(current.bids, bids, true),
      asks: mergeSide(current.asks, asks, false),
    });
  },

  clear: () => set({ bids: [], asks: [] }),
}));