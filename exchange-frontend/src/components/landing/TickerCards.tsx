import Link from "next/link";
import { TickerResponse } from "@/types/api";
import { formatCompact, formatNumber, shortMarketName } from "@/lib/utils";

export default function TickerCards({
  tickers,
}: {
  tickers: TickerResponse[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {tickers.map((ticker) => {
        const positive = ticker.change24h >= 0;
        return (
          <Link
            key={ticker.market}
            href={`/trade/${ticker.market}`}
            className="exchange-panel p-4 transition hover:border-[var(--yellow)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">{shortMarketName(ticker.market)}</div>
              <div
                className={`rounded-full px-2 py-1 text-xs ${
                  positive ? "bg-bid-soft text-bid" : "bg-ask-soft text-ask"
                }`}
              >
                {positive ? "+" : ""}
                {formatNumber(ticker.change24h, 2)}%
              </div>
            </div>

            <div className="text-2xl font-semibold">${formatNumber(ticker.lastPrice, 2)}</div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[var(--muted)]">
              <div>
                <div>24h High</div>
                <div className="mt-1 text-sm text-white">{formatNumber(ticker.high24h, 2)}</div>
              </div>
              <div>
                <div>24h Low</div>
                <div className="mt-1 text-sm text-white">{formatNumber(ticker.low24h, 2)}</div>
              </div>
              <div>
                <div>24h Vol</div>
                <div className="mt-1 text-sm text-white">{formatCompact(ticker.volume24h)}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}