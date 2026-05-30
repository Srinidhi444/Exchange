"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { setAuthToken } from "@/lib/api";

export default function AuthBootstrap() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    setAuthToken(token ?? undefined);
  }, [token]);

  return null;
}