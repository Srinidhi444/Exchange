"use client";

import { useBalancesStore } from "@/stores/balances-store";
import { formatNumber } from "@/lib/utils";

export default function BalancesPanel() {
  const { balances } = useBalancesStore();

  return (
    <div className="exchange-panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium">
        Balances
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-[var(--muted)]">
        <div>Asset</div>
        <div className="text-right">Available</div>
        <div className="text-right">Locked</div>
      </div>

      <div className="max-h-[220px] overflow-y-auto px-4 pb-3">
        {balances.map((balance) => (
          <div key={balance.asset} className="grid grid-cols-3 gap-2 py-2 text-sm">
            <div>{balance.asset}</div>
            <div className="text-right">{formatNumber(balance.available, 5)}</div>
            <div className="text-right text-[var(--muted)]">
              {formatNumber(balance.locked, 5)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}