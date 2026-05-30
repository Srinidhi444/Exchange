"use client";

import Link from "next/link";
import { TickerResponse } from "@/types/api";
import { MARKETS } from "@/lib/constants";
import { formatNumber, shortMarketName } from "@/lib/utils";

export default function TradingHeader({
  market,
  ticker,
}: {
  market: string;
  ticker: TickerResponse;
}) {
  return (
    <div className="exchange-panel p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-xl font-semibold">{shortMarketName(market)}</div>
            <div className="text-xs text-[var(--muted)]">Spot Market</div>
          </div>

          <div className="h-8 w-px bg-[var(--border)]" />

          <div>
            <div className="text-xs text-[var(--muted)]">Last Price</div>
            <div className="text-lg font-semibold">${formatNumber(ticker.lastPrice, 2)}</div>
          </div>

          <div>
            <div className="text-xs text-[var(--muted)]">24h Change</div>
            <div className={ticker.change24h >= 0 ? "text-bid" : "text-ask"}>
              {ticker.change24h >= 0 ? "+" : ""}
              {formatNumber(ticker.change24h, 2)}%
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--muted)]">24h High</div>
            <div>{formatNumber(ticker.high24h, 2)}</div>
          </div>

          <div>
            <div className="text-xs text-[var(--muted)]">24h Low</div>
            <div>{formatNumber(ticker.low24h, 2)}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {MARKETS.map((item) => (
            <Link
              key={item}
              href={`/trade/${item}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                item === market
                  ? "bg-[var(--yellow)] font-semibold text-black"
                  : "bg-[var(--panel-3)] text-[var(--muted)] hover:text-white"
              }`}
            >
              {shortMarketName(item)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}