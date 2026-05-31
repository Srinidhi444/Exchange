"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Balance,
  Depth,
  Kline,
  Market,
  OpenOrder,
  PublicTrade,
  TickerResponse,
} from "@/types/api";
import TradingHeader from "./TradingHeader";
import ChartPanel from "./ChartPanel";
import DepthPanel from "./DepthPanel";
import OrderBookPanel from "./OrderbookPanel";
import RecentTradesPanel from "./RecentTradesPanel";
import OrderForm from "./OrderForm";
import BottomTabs from "./BottomTabs";
import { wsManager } from "@/lib/ws-manager";
import { getBalances, getMyTrades, getOpenOrders } from "@/lib/api";
import { useOrderbookStore } from "@/stores/orderbook-store";
import { useTradesStore } from "@/stores/trades-store";
import { useBalancesStore } from "@/stores/balances-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useAuthStore } from "@/stores/auth-store";
import { IncomingWsEvent } from "@/types/ws";

interface TradePageClientProps {
  market: Market;
  ticker: TickerResponse;
  initialDepth: Depth;
  initialTrades: PublicTrade[];
  initialKlines: Kline[];
}

type ChartInterval = "1m" | "5m" | "1h";
type CenterView = "chart" | "depth";

export default function TradePageClient({
  market,
  ticker,
  initialDepth,
  initialTrades,
  initialKlines,
}: TradePageClientProps) {
  const token    = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  const setDepth        = useOrderbookStore((s) => s.setDepth);
  const clearDepth      = useOrderbookStore((s) => s.clear);
  const bids            = useOrderbookStore((s) => s.bids);
  const asks            = useOrderbookStore((s) => s.asks);

  const setPublicTrades    = useTradesStore((s) => s.setPublicTrades);
  const prependPublicTrade = useTradesStore((s) => s.prependPublicTrade);
  const setMyTrades        = useTradesStore((s) => s.setMyTrades);
  const prependMyTrade     = useTradesStore((s) => s.prependMyTrade);
  const clearPublicTrades  = useTradesStore((s) => s.clearPublicTrades);
  const clearMyTrades      = useTradesStore((s) => s.clearMyTrades);

  const setBalances   = useBalancesStore((s) => s.setBalances);
  const patchBalance  = useBalancesStore((s) => s.patchBalance);
  const clearBalances = useBalancesStore((s) => s.clear);

  const setOpenOrders = useOrdersStore((s) => s.setOpenOrders);
  const addOpenOrder  = useOrdersStore((s) => s.addOpenOrder);
  const upsertOrder   = useOrdersStore((s) => s.upsertOrder);
  const removeOrder   = useOrdersStore((s) => s.removeOrder);
  const clearOrders   = useOrdersStore((s) => s.clear);

  const [privateLoading, setPrivateLoading] = useState(false);
  const [activeView, setActiveView]         = useState<CenterView>("chart");
  const [interval, setInterval]             = useState<ChartInterval>("1m");
  const privateSubscribedRef                = useRef(false);

  // ── Seed initial snapshot ────────────────────────────────────────────────
  useEffect(() => {
    setDepth(initialDepth.bids, initialDepth.asks);
    setPublicTrades(initialTrades);
  }, [initialDepth, initialTrades, setDepth, setPublicTrades]);

  // ── Public websocket ─────────────────────────────────────────────────────
  useEffect(() => {
    wsManager.connect();

    const unsubscribeListener = wsManager.subscribe((event: IncomingWsEvent) => {
      if ("stream" in event && event.stream === `depth@${market}` && "data" in event && event.data?.e === "depth") {
        useOrderbookStore.getState().applyDepthDelta(event.data.b ?? [], event.data.a ?? []);
      }

      if ("stream" in event && event.stream === `trade@${market}` && "data" in event && event.data?.e === "trade") {
        prependPublicTrade({
          market:          event.data.s,
          price:           event.data.p,
          quantity:        event.data.q,
          is_buyer_maker:  event.data.m,
          created_at:      new Date(event.data.T).toISOString(),
        });
      }

      if ("stream" in event && event.stream.startsWith("balances@") && "data" in event) {
        patchBalance(event.data as { asset: string; available: number; locked: number });
      }

      if ("stream" in event && event.stream.startsWith("trades@") && "data" in event) {
        const data = event.data as { tradeId: number; market: string; price: number; quantity: number; side: "BUY" | "SELL"; timestamp: number };
        prependMyTrade({ id: data.tradeId, market: data.market, price: data.price, quantity: data.quantity, created_at: new Date(data.timestamp).toISOString() });
      }

      if ("stream" in event && event.stream.startsWith("orders@") && "data" in event) {
        const data = event.data as {
          event: string;
          orderId?: string;
          filledQuantity?: number;
          remainingQuantity?: number;
          status?: string;
          order?: {
            orderId: string; market?: string; side?: "BUY" | "SELL"; kind?: "LIMIT" | "MARKET";
            price?: number; quantity?: number; filledQuantity?: number; remainingQuantity?: number;
            status?: string; createdAt?: string;
          };
        };

        if (data.event === "ORDER_CREATED" && data.order) {
          if (data.order.status !== "FILLED" && (data.order.remainingQuantity ?? 0) > 0) {
            addOpenOrder({
              orderId:           data.order.orderId,
              market:            (data.order.market as Market) ?? market,
              side:              data.order.side ?? "BUY",
              type:              data.order.kind ?? "LIMIT",
              price:             data.order.price ?? 0,
              quantity:          data.order.quantity ?? 0,
              filledQuantity:    data.order.filledQuantity ?? 0,
              remainingQuantity: data.order.remainingQuantity ?? (data.order.quantity ?? 0) - (data.order.filledQuantity ?? 0),
              status:            data.order.status ?? "OPEN",
              createdAt:         data.order.createdAt ?? new Date().toISOString(),
            });
          }
        }

        if (data.event === "ORDER_CANCELLED" && data.orderId) removeOrder(data.orderId);

        if (data.event === "ORDER_UPDATED" && data.orderId) {
          if (data.status === "FILLED" || data.status === "CANCELLED" || (data.remainingQuantity ?? 0) <= 0) {
            removeOrder(data.orderId);
          } else {
            upsertOrder({ orderId: data.orderId, filledQuantity: data.filledQuantity ?? 0, remainingQuantity: data.remainingQuantity ?? 0, status: data.status ?? "OPEN" });
          }
        }
      }
    });

    wsManager.send({ method: "SUBSCRIBE", params: [`depth@${market}`, `trade@${market}`] });

    return () => {
      wsManager.send({ method: "UNSUBSCRIBE", params: [`depth@${market}`, `trade@${market}`] });
      unsubscribeListener();
      clearDepth();
      clearPublicTrades();
    };
  }, [market, clearDepth, clearPublicTrades, patchBalance, prependMyTrade, prependPublicTrade, addOpenOrder, upsertOrder, removeOrder]);

  // ── Private websocket ────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      if (privateSubscribedRef.current) {
        wsManager.send({ method: "UNSUBSCRIBE", params: ["balances", "orders", "trades"] });
        privateSubscribedRef.current = false;
      }
      clearBalances(); clearOrders(); clearMyTrades();
      return;
    }

    async function bootstrapPrivateData() {
      try {
        setPrivateLoading(true);
        const [balances, orders, myTrades] = await Promise.all([getBalances(), getOpenOrders(market), getMyTrades()]);
        setBalances(balances as Balance[]);
        setOpenOrders(orders as OpenOrder[]);
        setMyTrades(myTrades as PublicTrade[]);
      } catch (error) {
        console.error("Private bootstrap failed", error);
      } finally {
        setPrivateLoading(false);
      }
    }

    bootstrapPrivateData();
    wsManager.send({ method: "SUBSCRIBE", params: ["balances", "orders", "trades"], token });
    privateSubscribedRef.current = true;

    return () => {
      if (privateSubscribedRef.current) wsManager.send({ method: "UNSUBSCRIBE", params: ["balances", "orders", "trades"] });
      privateSubscribedRef.current = false;
    };
  }, [token, hydrated, market, setBalances, setOpenOrders, setMyTrades, clearBalances, clearOrders, clearMyTrades]);

  const authState = useMemo(() => {
    if (!hydrated) return "loading";
    if (!token) return "guest";
    if (privateLoading) return "bootstrapping";
    return "ready";
  }, [hydrated, token, privateLoading]);

  const liveDepth = useMemo<Depth>(() => ({ bids: bids ?? [], asks: asks ?? [] }), [bids, asks]);

  return (
    <div className="space-y-4">
      <TradingHeader market={market} ticker={ticker} />

      {authState === "guest" && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--panel)", color: "var(--muted)" }}
        >
          Login to enable balances, open orders, personal trades, and private realtime streams.
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[220px_1.45fr_0.75fr]">
        <MarketSidebar currentMarket={market} />

        <div className="grid gap-4">
          {/* Chart / Depth panel */}
          <section
            className="overflow-hidden rounded-2xl border"
            style={{ background: "var(--panel)", borderColor: "var(--border)" }}
          >
            {/* Tab bar */}
            <div
              className="flex items-center justify-between border-b px-4"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Chart / Depth tabs */}
              <div className="flex items-center">
                {(["chart", "depth"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setActiveView(mode)}
                    className="relative px-4 py-3 text-sm font-medium capitalize transition-colors duration-150"
                    style={{ color: activeView === mode ? "var(--text)" : "var(--muted)" }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    {activeView === mode && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                        style={{ background: "var(--green)" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Interval pills / depth label */}
              {activeView === "chart" ? (
                <div
                  className="flex items-center gap-1 rounded-lg border p-1"
                  style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}
                >
                  {(["1m", "5m", "1h"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setInterval(item)}
                      className="rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150"
                      style={
                        interval === item
                          ? { background: "var(--panel-3)", color: "var(--text)" }
                          : { color: "var(--muted)" }
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)", boxShadow: "0 0 4px var(--green)" }} />
                  Live
                </div>
              )}
            </div>

            <div className="h-[420px]">
              {activeView === "chart" ? (
                <ChartPanel market={market} interval={interval} initialKlines={initialKlines} />
              ) : (
                <DepthPanel depth={liveDepth} />
              )}
            </div>
          </section>

          <RecentTradesPanel />
        </div>

        <div className="grid gap-4">
          <OrderBookPanel />
          <OrderForm market={market} />
        </div>
      </section>

      <BottomTabs market={market} authState={authState} />
    </div>
  );
}

function MarketSidebar({ currentMarket }: { currentMarket: Market }) {
  const [query, setQuery] = useState("");
  const markets: Market[] = ["BTC_USDT", "ETH_USDT", "SOL_USDT"];

  const filtered = markets.filter((m) =>
    m.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside
      className="overflow-hidden rounded-2xl border p-3"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Markets
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="mb-3 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--muted)]"
        style={{
          borderColor: "var(--border)",
          background:  "var(--panel-2)",
          color:       "var(--text)",
        }}
      />
      <div className="space-y-1">
        {filtered.map((market) => (
          <Link
            key={market}
            href={`/trade/${market}`}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors duration-150"
            style={
              market === currentMarket
                ? { background: "var(--panel-3)", color: "var(--text)", fontWeight: 600 }
                : { color: "var(--muted)" }
            }
          >
            <span>{market.replace("_", "/")}</span>
            {market === currentMarket && (
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} />
            )}
          </Link>
        ))}
      </div>
    </aside>
  );
}