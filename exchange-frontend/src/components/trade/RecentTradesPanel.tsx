"use client";

import { useTradesStore } from "@/stores/trades-store";
import { formatNumber } from "@/lib/utils";

export default function RecentTradesPanel() {
  const { publicTrades } = useTradesStore();

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--panel)", borderColor: "var(--border)", height: "280px", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Recent Trades
        </span>
        <span
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest"
          style={{ color: "var(--muted)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--green)", boxShadow: "0 0 4px var(--green)" }}
          />
          Live
        </span>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-3 border-b px-4 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        {["Price", "Amount", "Time"].map((col, i) => (
          <div
            key={col}
            className={`text-[10px] font-medium uppercase tracking-widest ${i > 0 ? "text-right" : ""}`}
            style={{ color: "var(--muted)" }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Trades list */}
      <div className="flex-1 overflow-y-auto px-4 py-1">
        {publicTrades.length === 0 ? (
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: "var(--muted)" }}
          >
            Waiting for trades…
          </div>
        ) : (
          publicTrades.map((trade, i) => {
            const price    = Number(trade.price);
            const quantity = Number(trade.quantity);
            const isMaker  = !!trade.is_buyer_maker;

            return (
              <div
                key={`${trade.id ?? i}-${i}`}
                className="grid grid-cols-3 py-[3px] text-xs transition-colors hover:bg-[var(--panel-2)] rounded-md px-1 -mx-1"
              >
                <div
                  className="tabular-nums font-medium"
                  style={{ color: isMaker ? "var(--red)" : "var(--green)" }}
                >
                  {formatNumber(price, 2)}
                </div>
                <div
                  className="text-right tabular-nums"
                  style={{ color: "var(--text)" }}
                >
                  {formatNumber(quantity, 5)}
                </div>
                <div
                  className="text-right tabular-nums"
                  style={{ color: "var(--muted)" }}
                >
                  {trade.created_at
                    ? new Date(trade.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "--"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}