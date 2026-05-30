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
  const { myTrades, setMyTrades } = useTradesStore();

  useEffect(() => {
    getOpenOrders(market).then(setOpenOrders).catch(() => setOpenOrders([]));
  }, [market, setOpenOrders]);

  useEffect(() => {
    getMyTrades().then(setMyTrades).catch(() => setMyTrades([]));
  }, [setMyTrades]);

  return (
    <div className="space-y-4">
      <div className="exchange-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              View open orders and your recent trade activity.
            </p>
          </div>

          <div className="flex gap-2">
            {MARKETS.map((item) => (
              <button
                key={item}
                onClick={() => setMarket(item)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  item === market
                    ? "bg-[var(--yellow)] text-black"
                    : "bg-[var(--panel-3)] text-[var(--muted)]"
                }`}
              >
                {item.replace("_", "/")}
              </button>
            ))}
          </div>
        </div>
      </div>

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
      </div>

      {tab === "open" ? (
        <div className="exchange-panel overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[var(--muted)]">
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 font-medium">Market</th>
                <th className="px-4 py-3 font-medium">Side</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Filled</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {openOrders.map((order) => (
                <tr key={order.orderId} className="border-b border-[var(--border)]">
                  <td className="px-4 py-3">{order.market}</td>
                  <td className={`px-4 py-3 ${order.side === "BUY" ? "text-bid" : "text-ask"}`}>
                    {order.side}
                  </td>
                  <td className="px-4 py-3">{order.type}</td>
                  <td className="px-4 py-3">{formatNumber(order.price, 2)}</td>
                  <td className="px-4 py-3">{formatNumber(order.quantity, 5)}</td>
                  <td className="px-4 py-3">{formatNumber(order.filledQuantity, 5)}</td>
                  <td className="px-4 py-3">{order.status}</td>
                </tr>
              ))}
              {openOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                    No open orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="exchange-panel overflow-hidden">
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
              {myTrades.map((trade, i) => (
                <tr key={`${trade.id ?? i}-${i}`} className="border-b border-[var(--border)]">
                  <td className="px-4 py-3">{trade.market}</td>
                  <td className="px-4 py-3">{formatNumber(trade.price, 2)}</td>
                  <td className="px-4 py-3">{formatNumber(trade.quantity, 5)}</td>
                  <td className="px-4 py-3">
                    {trade.created_at ? new Date(trade.created_at).toLocaleString() : "--"}
                  </td>
                </tr>
              ))}
              {myTrades.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">
                    No trade history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}