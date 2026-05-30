"use client";

import { useState } from "react";
import { Market, PublicTrade } from "@/types/api";
import OpenOrdersPanel from "./OpenOrdersPanel";
import BalancesPanel from "./BalancesPanel";
import { useTradesStore } from "@/stores/trades-store";
import { formatNumber } from "@/lib/utils";

function TradeHistoryTable({ trades }: { trades: PublicTrade[] }) {
  return (
    <div className="exchange-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 font-medium">Market</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={`${trade.id ?? i}-${i}`} className="border-b border-[var(--border)]">
                <td className="px-4 py-3">{trade.market}</td>
                <td className="px-4 py-3">{formatNumber(trade.price, 2)}</td>
                <td className="px-4 py-3">{formatNumber(trade.quantity, 5)}</td>
                <td className="px-4 py-3">
                  {trade.created_at ? new Date(trade.created_at).toLocaleString() : "--"}
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">
                  No trade history
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BottomTabs({
  market,
  authState,
}: {
  market: Market;
  authState: "loading" | "guest" | "bootstrapping" | "ready";
}) {
  const [tab, setTab] = useState<"open" | "trades" | "balances">("open");
  const myTrades = useTradesStore((s) => s.myTrades);

  const locked = authState === "guest" || authState === "loading";

  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-[var(--border)]">
        <button
          className={`exchange-tab px-1 py-3 text-sm ${tab === "open" ? "active" : ""}`}
          onClick={() => setTab("open")}
        >
          Open Orders
        </button>
        <button
          className={`exchange-tab px-1 py-3 text-sm ${tab === "trades" ? "active" : ""}`}
          onClick={() => setTab("trades")}
        >
          Trade History
        </button>
        <button
          className={`exchange-tab px-1 py-3 text-sm ${tab === "balances" ? "active" : ""}`}
          onClick={() => setTab("balances")}
        >
          Balances
        </button>
      </div>

      {locked ? (
        <div className="exchange-panel-soft px-4 py-8 text-center text-sm text-[var(--muted)]">
          Login to view private orders, balances, and personal trades.
        </div>
      ) : authState === "bootstrapping" ? (
        <div className="exchange-panel-soft px-4 py-8 text-center text-sm text-[var(--muted)]">
          Loading private account data...
        </div>
      ) : (
        <>
          {tab === "open" && <OpenOrdersPanel market={market} />}
          {tab === "trades" && <TradeHistoryTable trades={myTrades} />}
          {tab === "balances" && <BalancesPanel />}
        </>
      )}
    </div>
  );
}