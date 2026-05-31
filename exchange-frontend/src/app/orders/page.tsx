"use client";

import { useEffect, useState } from "react";
import { getMyTrades, getOpenOrders } from "@/lib/api";
import { MARKETS } from "@/lib/constants";
import { useOrdersStore } from "@/stores/orders-store";
import { useTradesStore } from "@/stores/trades-store";
import { formatNumber } from "@/lib/utils";

export default function OrdersPage() {
  const [market, setMarket] = useState<"BTC_USDT" | "ETH_USDT" | "SOL_USDT">("BTC_USDT");
  const [tab, setTab] = useState<"open" | "trades">("open");

  const { openOrders, setOpenOrders } = useOrdersStore();
  const { myTrades, setMyTrades }     = useTradesStore();

  useEffect(() => {
    getOpenOrders(market).then(setOpenOrders).catch(() => setOpenOrders([]));
  }, [market, setOpenOrders]);

  useEffect(() => {
    getMyTrades().then(setMyTrades).catch(() => setMyTrades([]));
  }, [setMyTrades]);

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Orders</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
            Open orders and trade history across your markets.
          </p>
        </div>

        {/* Market selector */}
        <div
          className="flex items-center gap-1 rounded-xl border p-1"
          style={{ borderColor: "var(--border)", background: "var(--panel)" }}
        >
          {MARKETS.map((item) => (
            <button
              key={item}
              onClick={() => setMarket(item)}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150"
              style={
                item === market
                  ? { background: "var(--panel-3)", color: "var(--text)" }
                  : { color: "var(--muted)" }
              }
            >
              {item.replace("_", "/")}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b" style={{ borderColor: "var(--border)" }}>
        {(["open", "trades"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative px-4 py-3 text-sm font-medium transition-colors duration-150"
            style={{ color: tab === t ? "var(--text)" : "var(--muted)" }}
          >
            {t === "open" ? "Open Orders" : "Trade History"}
            {tab === t && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: "var(--green)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tables */}
      {tab === "open" ? (
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Market", "Side", "Type", "Price", "Qty", "Filled", "Status"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest"
                      style={{ color: "var(--muted)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order, i) => (
                  <tr
                    key={order.orderId}
                    className="transition-colors hover:bg-[var(--panel-2)]"
                    style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text)" }}>
                      {order.market.replace("_", "/")}
                    </td>
                    <td
                      className="px-4 py-3 text-sm font-semibold"
                      style={{ color: order.side === "BUY" ? "var(--green)" : "var(--red)" }}
                    >
                      {order.side}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>
                      {order.type}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm" style={{ color: "var(--text)" }}>
                      {formatNumber(order.price, 2)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm" style={{ color: "var(--text)" }}>
                      {formatNumber(order.quantity, 5)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm" style={{ color: "var(--muted)" }}>
                      {formatNumber(order.filledQuantity, 5)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          background:
                            order.status === "OPEN"
                              ? "rgba(22,199,132,0.12)"
                              : "rgba(140,152,169,0.12)",
                          color:
                            order.status === "OPEN" ? "var(--green)" : "var(--muted)",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {openOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
                      No open orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Market", "Price", "Quantity", "Time"].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest"
                      style={{ color: "var(--muted)" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myTrades.map((trade, i) => (
                  <tr
                    key={`${trade.id ?? i}-${i}`}
                    className="transition-colors hover:bg-[var(--panel-2)]"
                    style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text)" }}>
                      {trade.market?.replace("_", "/")}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm" style={{ color: "var(--text)" }}>
                      {formatNumber(trade.price, 2)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm" style={{ color: "var(--text)" }}>
                      {formatNumber(trade.quantity, 5)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>
                      {trade.created_at ? new Date(trade.created_at).toLocaleString() : "--"}
                    </td>
                  </tr>
                ))}
                {myTrades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
                      No trade history
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}