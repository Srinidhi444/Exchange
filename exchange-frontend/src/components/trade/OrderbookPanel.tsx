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

  // Max total (price × qty) for bar scaling — matches the reference
  const askTotals = sortedAsks.map(([p, q]) => Number(p) * Number(q));
  const bidTotals = sortedBids.map(([p, q]) => Number(p) * Number(q));
  const maxAskTotal = Math.max(...askTotals, 1);
  const maxBidTotal = Math.max(...bidTotals, 1);

  const asksWithCumulative = useMemo(() => {
    let cum = 0;
    return [...sortedAsks].reverse().map(([price, qty]) => {
      cum += Number(qty);
      return { price, qty, cumulative: cum };
    }).reverse();
  }, [sortedAsks]);

  const bidsWithCumulative = useMemo(() => {
    let cum = 0;
    return sortedBids.map(([price, qty]) => {
      cum += Number(qty);
      return { price, qty, cumulative: cum };
    });
  }, [sortedBids]);

  const bestBid = sortedBids[0]?.[0];
  const bestAsk = sortedAsks[sortedAsks.length - 1]?.[0];
  const spread =
    bestBid && bestAsk
      ? (Number(bestAsk) - Number(bestBid)).toFixed(2)
      : null;

  return (
    <div
      className="exchange-panel flex h-[480px] flex-col overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="text-sm font-semibold tracking-wide text-[var(--text)]">Order Book</span>
        {spread && (
          <span className="text-xs text-[var(--muted)]">
            Spread <span className="ml-1 text-[var(--text)]">{spread}</span>
          </span>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-4 pb-1 pt-2 text-[10px] uppercase tracking-widest text-[var(--muted)]">
        <div>Price (USD)</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks — highest ask at top, lowest ask nearest spread */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden">
        <div className="flex flex-col">
          {asksWithCumulative.map(({ price, qty }) => {
            const total = Number(price) * Number(qty);
            const barPct = (total / maxAskTotal) * 100;
            return (
              <div
                key={`ask-${price}`}
                className="grid grid-cols-3 px-4 py-[4px] text-xs hover:bg-white/[0.03]"
              >
                <div className="font-medium text-[#ea3943]">
                  {formatNumber(price, 2)}
                </div>
                <div className="text-right text-[var(--text)]">
                  {formatNumber(qty, 5)}
                </div>
                {/* Total cell with background bar inside it */}
                <div className="relative text-right">
                  <div
                    className="absolute inset-y-0 right-0"
                    style={{
                      width: `${barPct}%`,
                      background: "rgba(180,30,40,0.55)",
                      borderRadius: "2px 0 0 2px",
                    }}
                  />
                  <span className="relative z-10 text-[var(--text)]">
                    {formatNumber(total, 2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mid price row */}
      <div className="flex items-center justify-center border-y border-[var(--border)] bg-[var(--panel-2)] px-4 py-2">
        <span className="text-sm font-bold tabular-nums text-[var(--text)]">
          {bestBid ? formatNumber(bestBid, 2) : "--"}
        </span>
        {spread && (
          <span className="ml-3 text-[10px] text-[var(--muted)]">
            spread {spread}
          </span>
        )}
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {bidsWithCumulative.map(({ price, qty }) => {
          const total = Number(price) * Number(qty);
          const barPct = (total / maxBidTotal) * 100;
          return (
            <div
              key={`bid-${price}`}
              className="grid grid-cols-3 px-4 py-[4px] text-xs hover:bg-white/[0.03]"
            >
              <div className="font-medium text-[#16c784]">
                {formatNumber(price, 2)}
              </div>
              <div className="text-right text-[var(--text)]">
                {formatNumber(qty, 5)}
              </div>
              {/* Total cell with background bar inside it */}
              <div className="relative text-right">
                <div
                  className="absolute inset-y-0 right-0"
                  style={{
                    width: `${barPct}%`,
                    background: "rgba(14,120,80,0.55)",
                    borderRadius: "2px 0 0 2px",
                  }}
                />
                <span className="relative z-10 text-[var(--text)]">
                  {formatNumber(total, 2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}