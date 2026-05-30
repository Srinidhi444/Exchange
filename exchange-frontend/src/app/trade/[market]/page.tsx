import { notFound } from "next/navigation";
import { getDepth, getKlines, getTicker, getTrades } from "@/lib/api";
import { MARKETS } from "@/lib/constants";
import { Market } from "@/types/api";
import TradePageClient from "@/components/trade/TradePageClient";

export default async function TradePage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market } = await params;

  if (!MARKETS.includes(market as Market)) {
    notFound();
  }

  const typedMarket = market as Market;

  const [ticker, depth, trades, klines] = await Promise.all([
    getTicker(typedMarket),
    getDepth(typedMarket),
    getTrades(typedMarket),
    getKlines(typedMarket, "1m"),
  ]);

  return (
    <TradePageClient
      market={typedMarket}
      ticker={ticker}
      initialDepth={depth}
      initialTrades={trades}
      initialKlines={klines}
    />
  );
}