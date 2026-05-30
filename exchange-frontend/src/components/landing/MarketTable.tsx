import Link from "next/link";
import { TickerResponse } from "@/types/api";
import { formatCompact, formatNumber, shortMarketName } from "@/lib/utils";

export default function MarketTable({
  tickers,
}: {
  tickers: TickerResponse[];
}) {
  return (
    <div className="exchange-panel overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-medium">
        Spot Markets
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 font-medium">Pair</th>
              <th className="px-4 py-3 font-medium">Last Price</th>
              <th className="px-4 py-3 font-medium">24h Change</th>
              <th className="px-4 py-3 font-medium">24h High</th>
              <th className="px-4 py-3 font-medium">24h Low</th>
              <th className="px-4 py-3 font-medium">24h Volume</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker) => {
              const positive = ticker.change24h >= 0;
              return (
                <tr
                  key={ticker.market}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-4 font-medium">{shortMarketName(ticker.market)}</td>
                  <td className="px-4 py-4">${formatNumber(ticker.lastPrice, 2)}</td>
                  <td
                    className={`px-4 py-4 ${
                      positive ? "text-bid" : "text-ask"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {formatNumber(ticker.change24h, 2)}%
                  </td>
                  <td className="px-4 py-4">{formatNumber(ticker.high24h, 2)}</td>
                  <td className="px-4 py-4">{formatNumber(ticker.low24h, 2)}</td>
                  <td className="px-4 py-4">{formatCompact(ticker.volume24h)}</td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/trade/${ticker.market}`}
                      className="rounded-lg bg-[var(--yellow)] px-3 py-2 text-xs font-semibold text-black"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}