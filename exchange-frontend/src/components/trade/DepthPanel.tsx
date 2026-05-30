"use client";

import { useMemo, useState } from "react";
import { Depth } from "@/types/api";
import DepthChart from "./DepthChart";

type Props = {
  depth: Depth | null;
};

type DepthMode = "chart" | "table";

function fmtPrice(v: string | number) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "--";
}

function fmtQty(v: string | number) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(5) : "--";
}

export default function DepthPanel({ depth }: Props) {
  const [mode, setMode] = useState<DepthMode>("chart");

  const asks = useMemo(() => (depth?.asks ?? []).slice(0, 14), [depth]);
  const bids = useMemo(() => (depth?.bids ?? []).slice(0, 14), [depth]);

  const bestAsk = asks[0] ? Number(asks[0][0]) : null;
  const bestBid = bids[0] ? Number(bids[0][0]) : null;
  const spread =
    bestAsk !== null && bestBid !== null ? (bestAsk - bestBid).toFixed(2) : "--";

  if (!depth) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-[var(--muted)]">
        No depth data
      </div>
    );
  }

  return (
    <div className="flex h-[420px] flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("chart")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              mode === "chart"
                ? "bg-[var(--yellow)] font-medium text-black"
                : "bg-[var(--panel-3)] text-[var(--muted)]"
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => setMode("table")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              mode === "table"
                ? "bg-[var(--yellow)] font-medium text-black"
                : "bg-[var(--panel-3)] text-[var(--muted)]"
            }`}
          >
            Table
          </button>
        </div>

        <div className="text-xs text-[var(--muted)]">Spread: {spread}</div>
      </div>

      {mode === "chart" ? (
        <DepthChart depth={depth} />
      ) : (
        <>
          <div className="grid grid-cols-3 border-b border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Total</div>
          </div>

          <div className="grid flex-1 grid-rows-[1fr_auto_1fr] overflow-hidden">
            <div className="overflow-auto px-4 py-2">
              <div className="space-y-1">
                {asks.length === 0 ? (
                  <div className="py-6 text-center text-sm text-[var(--muted)]">No asks</div>
                ) : (
                  asks
                    .slice()
                    .reverse()
                    .map(([price, amount], i) => {
                      const total = Number(price) * Number(amount);
                      return (
                        <div
                          key={`ask-${price}-${i}`}
                          className="grid grid-cols-3 rounded-md px-2 py-1 text-sm"
                        >
                          <div className="font-medium text-ask">{fmtPrice(price)}</div>
                          <div className="text-right text-[var(--text)]">{fmtQty(amount)}</div>
                          <div className="text-right text-[var(--muted)]">{fmtQty(total)}</div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            <div className="border-y border-[var(--border)] bg-[var(--panel-2)] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Spread</span>
                <span className="text-sm font-medium text-[var(--text)]">{spread}</span>
              </div>
            </div>

            <div className="overflow-auto px-4 py-2">
              <div className="space-y-1">
                {bids.length === 0 ? (
                  <div className="py-6 text-center text-sm text-[var(--muted)]">No bids</div>
                ) : (
                  bids.map(([price, amount], i) => {
                    const total = Number(price) * Number(amount);
                    return (
                      <div
                        key={`bid-${price}-${i}`}
                        className="grid grid-cols-3 rounded-md px-2 py-1 text-sm"
                      >
                        <div className="font-medium text-bid">{fmtPrice(price)}</div>
                        <div className="text-right text-[var(--text)]">{fmtQty(amount)}</div>
                        <div className="text-right text-[var(--muted)]">{fmtQty(total)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}