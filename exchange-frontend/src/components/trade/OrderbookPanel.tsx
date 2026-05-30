"use client";

import { useMemo } from "react";
import { useOrderbookStore } from "@/stores/orderbook-store";
import { formatNumber } from "@/lib/utils";

export default function OrderBookPanel() {
  const { bids, asks } = useOrderbookStore();

  const sortedAsks = useMemo(
    () => [...asks].sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 12),
    [asks]
  );

  const sortedBids = useMemo(
    () => [...bids].sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 12),
    [bids]
  );

  const maxAsk = Math.max(...sortedAsks.map(([, qty]) => Number(qty)), 1);
  const maxBid = Math.max(...sortedBids.map(([, qty]) => Number(qty)), 1);

  return (
    <div className="exchange-panel h-[420px] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium">
        Order Book
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-[var(--muted)]">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>

      <div className="px-4">
        {sortedAsks.map(([price, qty]) => {
          const width = `${(Number(qty) / maxAsk) * 100}%`;
          return (
            <div key={`ask-${price}`} className="relative grid grid-cols-3 gap-2 py-1 text-xs">
              <div className="absolute inset-y-0 right-0 bg-ask-soft" style={{ width }} />
              <div className="relative z-10 text-ask">{formatNumber(price, 2)}</div>
              <div className="relative z-10 text-right">{formatNumber(qty, 5)}</div>
              <div className="relative z-10 text-right text-[var(--muted)]">
                {formatNumber(Number(price) * Number(qty), 2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-y border-[var(--border)] bg-[var(--panel-2)] px-4 py-3 text-center text-sm font-semibold">
        {sortedBids[0] ? formatNumber(sortedBids[0][0], 2) : "--"}
      </div>

      <div className="px-4 py-2">
        {sortedBids.map(([price, qty]) => {
          const width = `${(Number(qty) / maxBid) * 100}%`;
          return (
            <div key={`bid-${price}`} className="relative grid grid-cols-3 gap-2 py-1 text-xs">
              <div className="absolute inset-y-0 right-0 bg-bid-soft" style={{ width }} />
              <div className="relative z-10 text-bid">{formatNumber(price, 2)}</div>
              <div className="relative z-10 text-right">{formatNumber(qty, 5)}</div>
              <div className="relative z-10 text-right text-[var(--muted)]">
                {formatNumber(Number(price) * Number(qty), 2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}