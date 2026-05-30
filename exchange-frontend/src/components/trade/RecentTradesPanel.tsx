"use client";

import { useTradesStore } from "@/stores/trades-store";
import { formatNumber } from "@/lib/utils";

export default function RecentTradesPanel() {
  const { publicTrades } = useTradesStore();

  return (
    <div className="exchange-panel h-[280px] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium">
        Recent Trades
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-[var(--muted)]">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Time</div>
      </div>

      <div className="max-h-[220px] overflow-y-auto px-4 pb-2">
        {publicTrades.map((trade, i) => {
          const price = Number(trade.price);
          const quantity = Number(trade.quantity);
          const isMaker = !!trade.is_buyer_maker;

          return (
            <div key={`${trade.id ?? i}-${i}`} className="grid grid-cols-3 gap-2 py-1 text-xs">
              <div className={isMaker ? "text-ask" : "text-bid"}>
                {formatNumber(price, 2)}
              </div>
              <div className="text-right">{formatNumber(quantity, 5)}</div>
              <div className="text-right text-[var(--muted)]">
                {trade.created_at
                  ? new Date(trade.created_at).toLocaleTimeString()
                  : "--"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}