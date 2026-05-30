"use client";

import { create } from "zustand";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().remove(id), 3200);
  },
  remove: (id) =>
    set({
      toasts: get().toasts.filter((toast) => toast.id !== id),
    }),
}));