"use client";

import { create } from "zustand";
import { OpenOrder } from "@/types/api";

interface OrdersState {
  openOrders: OpenOrder[];
  setOpenOrders: (orders: OpenOrder[]) => void;
  addOpenOrder: (order: OpenOrder) => void;
  upsertOrder: (update: Partial<OpenOrder> & { orderId: string }) => void;
  removeOrder: (orderId: string) => void;
  clear: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  openOrders: [],
  setOpenOrders: (openOrders) => set({ openOrders }),
  addOpenOrder: (order) =>
    set({ openOrders: [order, ...get().openOrders.filter((o) => o.orderId !== order.orderId)] }),
  upsertOrder: (update) => {
    const existing = get().openOrders;
    const index = existing.findIndex((o) => o.orderId === update.orderId);
    if (index === -1) return;
    const next = [...existing];
    next[index] = { ...next[index], ...update } as OpenOrder;
    set({ openOrders: next });
  },
  removeOrder: (orderId) =>
    set({ openOrders: get().openOrders.filter((o) => o.orderId !== orderId) }),
  clear: () => set({ openOrders: [] }),
}));