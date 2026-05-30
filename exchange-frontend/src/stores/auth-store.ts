"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken } from "@/lib/api";

interface AuthState {
  token: string | null;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      hydrated: false,
      setToken: (token) => {
        setAuthToken(token ?? undefined);
        set({ token });
      },
      setHydrated: (hydrated) => set({ hydrated }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "exchange-auth",
      onRehydrateStorage: () => (state) => {
        const token = state?.token ?? null;
        setAuthToken(token ?? undefined);
        state?.setHydrated(true);
      },
    }
  )
);