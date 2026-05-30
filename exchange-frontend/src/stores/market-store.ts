"use client";

import { create } from "zustand";
import { Market } from "@/types/api";

interface MarketState {
  currentMarket: Market;
  setCurrentMarket: (market: Market) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  currentMarket: "BTC_USDT",
  setCurrentMarket: (currentMarket) => set({ currentMarket }),
}));