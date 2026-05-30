"use client";

import { useEffect } from "react";
import { getBalances } from "@/lib/api";
import { useBalancesStore } from "@/stores/balances-store";
import { formatNumber } from "@/lib/utils";

export default function PortfolioPage() {
  const { balances, setBalances } = useBalancesStore();

  useEffect(() => {
    getBalances()
      .then(setBalances)
      .catch(() => setBalances([]));
  }, [setBalances]);

  return (
    <div className="space-y-4">
      <div className="exchange-panel p-6">
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your asset balances update in real time as orders fill and balances change.
        </p>
      </div>

      <div className="exchange-panel overflow-hidden">
        <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium">
          Holdings
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-[var(--muted)]">
          <div>Asset</div>
          <div className="text-right">Available</div>
          <div className="text-right">Locked</div>
        </div>

        <div className="px-4 pb-4">
          {balances.map((balance) => (
            <div key={balance.asset} className="grid grid-cols-3 gap-2 py-3 text-sm">
              <div>{balance.asset}</div>
              <div className="text-right">{formatNumber(balance.available, 5)}</div>
              <div className="text-right text-[var(--muted)]">
                {formatNumber(balance.locked, 5)}
              </div>
            </div>
          ))}

          {balances.length === 0 && (
            <div className="py-8 text-center text-sm text-[var(--muted)]">
              No balances found. Login to view your portfolio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}