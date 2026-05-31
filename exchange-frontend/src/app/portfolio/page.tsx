"use client";

import { useEffect } from "react";
import { getBalances } from "@/lib/api";
import { useBalancesStore } from "@/stores/balances-store";
import { formatNumber } from "@/lib/utils";

export default function PortfolioPage() {
  const { balances, setBalances } = useBalancesStore();

  useEffect(() => {
    getBalances().then(setBalances).catch(() => setBalances([]));
  }, [setBalances]);

  const totalAssets = balances.length;
  const hasBalances = balances.some((b) => Number(b.available) > 0 || Number(b.locked) > 0);

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Portfolio</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
            Balances update in real time as orders fill.
          </p>
        </div>
        {totalAssets > 0 && (
          <div
            className="rounded-lg border px-3 py-1.5 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--panel)" }}
          >
            {totalAssets} asset{totalAssets !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Summary cards */}
      {hasBalances && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {balances.filter((b) => Number(b.available) > 0 || Number(b.locked) > 0).map((b) => (
            <div
              key={b.asset}
              className="rounded-2xl border p-4"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black"
                  style={{ background: "var(--panel-3)", color: "var(--text)" }}
                >
                  {b.asset.charAt(0)}
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {b.asset}
                </span>
              </div>
              <div className="tabular-nums text-lg font-bold" style={{ color: "var(--text)" }}>
                {formatNumber(b.available, 4)}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Available
              </div>
              {Number(b.locked) > 0 && (
                <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: "var(--border)" }}>
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>Locked</span>
                  <span className="tabular-nums text-xs" style={{ color: "var(--muted)" }}>
                    {formatNumber(b.locked, 4)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Full holdings table */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        <div
          className="border-b px-4 py-3 text-[10px] font-medium uppercase tracking-widest"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          All Holdings
        </div>

        {/* Table header */}
        <div
          className="grid grid-cols-3 border-b px-4 py-2"
          style={{ borderColor: "var(--border)" }}
        >
          {["Asset", "Available", "Locked"].map((col, i) => (
            <div
              key={col}
              className={`text-[10px] font-medium uppercase tracking-widest ${i > 0 ? "text-right" : ""}`}
              style={{ color: "var(--muted)" }}
            >
              {col}
            </div>
          ))}
        </div>

        <div>
          {balances.map((balance, i) => (
            <div
              key={balance.asset}
              className="grid grid-cols-3 px-4 py-3.5 transition-colors hover:bg-[var(--panel-2)]"
              style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black"
                  style={{ background: "var(--panel-3)", color: "var(--text)" }}
                >
                  {balance.asset.charAt(0)}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {balance.asset}
                </span>
              </div>
              <div className="text-right tabular-nums text-sm" style={{ color: "var(--text)" }}>
                {formatNumber(balance.available, 5)}
              </div>
              <div className="text-right tabular-nums text-sm" style={{ color: "var(--muted)" }}>
                {formatNumber(balance.locked, 5)}
              </div>
            </div>
          ))}

          {balances.length === 0 && (
            <div className="px-4 py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
              No balances found. Login to view your portfolio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}