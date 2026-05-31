import Link from "next/link";
import { TickerResponse } from "@/types/api";
import { formatCompact, formatNumber, shortMarketName } from "@/lib/utils";

export default function MarketTable({ tickers }: { tickers: TickerResponse[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-4 py-2">
        <div className="rounded-lg bg-[var(--panel-3)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]">
          Spot
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {["Name", "Price", "24h Change", "24h High", "24h Low", "24h Volume", ""].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker, i) => {
              const positive = ticker.change24h >= 0;
              return (
                <tr
                  key={ticker.market}
                  className="group transition-colors hover:bg-[var(--panel-2)]"
                  style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--panel-3)] text-[10px] font-bold text-[var(--text)]">
                        {shortMarketName(ticker.market).charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text)]">
                          {shortMarketName(ticker.market)}
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">
                          {ticker.market.split("_")[1]}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 tabular-nums text-sm text-[var(--text)]">
                    ${formatNumber(ticker.lastPrice, 2)}
                  </td>

                  <td className={`px-4 py-3.5 tabular-nums text-sm font-semibold ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                    {positive ? "+" : ""}{formatNumber(ticker.change24h, 2)}%
                  </td>

                  <td className="px-4 py-3.5 tabular-nums text-sm text-[var(--text)]">
                    {formatNumber(ticker.high24h, 2)}
                  </td>

                  <td className="px-4 py-3.5 tabular-nums text-sm text-[var(--text)]">
                    {formatNumber(ticker.low24h, 2)}
                  </td>

                  <td className="px-4 py-3.5 tabular-nums text-sm text-[var(--muted)]">
                    {formatCompact(ticker.volume24h)}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/trade/${ticker.market}`}
                      className="inline-block rounded-lg bg-[var(--green)] px-4 py-1.5 text-xs font-bold text-[#0b0e11] opacity-0 transition-opacity group-hover:opacity-100"
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