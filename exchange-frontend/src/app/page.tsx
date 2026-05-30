import MarketTable from "@/components/landing/MarketTable";
import TickerCards from "@/components/landing/TickerCards";
import { MARKETS } from "@/lib/constants";
import { getTicker } from "@/lib/api";

export default async function HomePage() {
  const tickerResults = await Promise.allSettled(MARKETS.map((market) => getTicker(market)));

  const tickers = tickerResults
    .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof getTicker>>> => result.status === "fulfilled")
    .map((result) => result.value);

  const topGainers = [...tickers].sort((a, b) => b.change24h - a.change24h).slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="exchange-panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              Realtime Spot Exchange
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Trade crypto with a clean, fast Backpack-style interface.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[var(--muted)] md:text-base">
              Live markets, orderbook depth, trade history, balances, and open orders —
              designed around a single trading workspace.
            </p>
          </div>

          <div className="exchange-panel-soft p-4">
            <div className="mb-3 text-sm font-medium">Top Gainers</div>
            <div className="space-y-3">
              {topGainers.map((market) => (
                <div
                  key={market.market}
                  className="flex items-center justify-between rounded-xl bg-[var(--panel-3)] px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{market.market.replace("_", "/")}</div>
                    <div className="text-xs text-[var(--muted)]">24h momentum</div>
                  </div>
                  <div className="text-right">
                    <div className={market.change24h >= 0 ? "text-bid font-semibold" : "text-ask font-semibold"}>
                      {market.change24h >= 0 ? "+" : ""}
                      {market.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-[var(--muted)]">${market.lastPrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TickerCards tickers={tickers} />
      <MarketTable tickers={tickers} />
    </div>
  );
}