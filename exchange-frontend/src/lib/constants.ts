import { Market } from "@/types/api";

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export const WS_URL = "ws://localhost:8080"

export const MARKETS: Market[] = ["BTC_USDT", "ETH_USDT", "SOL_USDT"];

export const MARKET_META: Record<Market, { base: string; quote: string }> = {
  BTC_USDT: { base: "BTC", quote: "USDT" },
  ETH_USDT: { base: "ETH", quote: "USDT" },
  SOL_USDT: { base: "SOL", quote: "USDT" },
};