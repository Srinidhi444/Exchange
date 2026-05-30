"use client";

import { create } from "zustand";
import { PublicTrade } from "@/types/api";

interface TradesState {
  publicTrades: PublicTrade[];
  myTrades: PublicTrade[];
  setPublicTrades: (trades: PublicTrade[]) => void;
  prependPublicTrade: (trade: PublicTrade) => void;
  setMyTrades: (trades: PublicTrade[]) => void;
  prependMyTrade: (trade: PublicTrade) => void;
  clearPublicTrades: () => void;
  clearMyTrades: () => void;
}

export const useTradesStore = create<TradesState>((set, get) => ({
  publicTrades: [],
  myTrades: [],
  setPublicTrades: (publicTrades) => set({ publicTrades }),
  prependPublicTrade: (trade) =>
    set({ publicTrades: [trade, ...get().publicTrades].slice(0, 50) }),
  setMyTrades: (myTrades) => set({ myTrades }),
  prependMyTrade: (trade) =>
    set({ myTrades: [trade, ...get().myTrades].slice(0, 50) }),
  clearPublicTrades: () => set({ publicTrades: [] }),
  clearMyTrades: () => set({ myTrades: [] }),
}));