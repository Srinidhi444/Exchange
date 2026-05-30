"use client";

import { useToastStore } from "@/stores/toast-store";

export default function ToastViewport() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg transition-all ${
            toast.tone === "success"
              ? "border-emerald-500/30 bg-[#0f1f19]"
              : toast.tone === "error"
              ? "border-red-500/30 bg-[#241416]"
              : "border-[var(--border)] bg-[var(--panel)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{toast.title}</div>
              {toast.description && (
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="text-xs text-[var(--muted)]"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}