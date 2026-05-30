"use client";

import { useState } from "react";
import { signin, signup } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const setToken = useAuthStore((s) => s.setToken);
  const pushToast = useToastStore((s) => s.push);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function onSubmit() {
    try {
      setLoading(true);
      const response =
        mode === "signin"
          ? await signin(email, password)
          : await signup(email, password);

      setToken(response.token);
      pushToast({
        title: mode === "signin" ? "Signed in" : "Account created",
        description: "Private streams and account panels are now enabled.",
        tone: "success",
      });
      onClose();
    } catch (error) {
      console.error(error);
      pushToast({
        title: mode === "signin" ? "Sign in failed" : "Signup failed",
        description: "Check your credentials and backend connection.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h2>
          <button onClick={onClose} className="text-sm text-[var(--muted)]">
            Close
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${
              mode === "signin" ? "bg-[var(--yellow)] text-black" : "bg-[var(--panel-3)]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm ${
              mode === "signup" ? "bg-[var(--yellow)] text-black" : "bg-[var(--panel-3)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Email</label>
            <input
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-3)] px-3 py-2 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-3)] px-3 py-2 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-[var(--yellow)] px-4 py-2 font-semibold text-black"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}