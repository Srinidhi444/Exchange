import Link from "next/link";
import MarketTable from "@/components/landing/MarketTable";
import { MARKETS } from "@/lib/constants";
import { getTicker } from "@/lib/api";
import { formatNumber, formatCompact, shortMarketName } from "@/lib/utils";

export default async function HomePage() {
  const tickerResults = await Promise.allSettled(
    MARKETS.map((market) => getTicker(market))
  );

  const tickers = tickerResults
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getTicker>>> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  const topGainers = [...tickers]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3);

  const topVolume = [...tickers]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 3);

  return (
    <div className="space-y-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-8 py-10">
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(22,199,132,0.15)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(234,57,67,0.10)_0%,transparent_70%)]" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              Live Spot Trading
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">
              Trade crypto,{" "}
              <span className="text-[var(--green)]">simply.</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
              Real-time orderbook, depth charts, and trade history — all in one workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/trade/BTC_USDT"
              className="rounded-xl bg-[var(--green)] px-6 py-2.5 text-sm font-bold text-[#0b0e11] transition-opacity hover:opacity-80"
            >
              Start Trading
            </Link>
            <Link
              href="#markets"
              className="rounded-xl border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--text)] hover:text-[var(--text)]"
            >
              View Markets
            </Link>
          </div>
        </div>
      </div>

      {/* ── Three market panels ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MarketPanel
          title="Top Gainers"
          subtitle="24h change"
          rows={topGainers.map((t) => ({ market: t.market, price: t.lastPrice, change: t.change24h }))}
        />
        <MarketPanel
          title="Most Active"
          subtitle="24h volume"
          rows={topVolume.map((t) => ({ market: t.market, price: t.lastPrice, change: t.change24h }))}
        />
        <MarketPanel
          title="All Markets"
          subtitle="Last price"
          rows={tickers.map((t) => ({ market: t.market, price: t.lastPrice, change: t.change24h }))}
        />
      </div>

      {/* ── Ticker stat cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tickers.map((ticker) => {
          const positive = ticker.change24h >= 0;
          return (
            <Link
              key={ticker.market}
              href={`/trade/${ticker.market}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 transition-colors duration-150 hover:border-[var(--border)] hover:bg-[var(--panel-2)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--panel-3)] text-xs font-bold text-[var(--text)]">
                    {shortMarketName(ticker.market).charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)]">
                    {shortMarketName(ticker.market)}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {positive ? "+" : ""}{formatNumber(ticker.change24h, 2)}%
                </span>
              </div>

              <div className="text-xl font-bold tabular-nums text-[var(--text)]">
                ${formatNumber(ticker.lastPrice, 2)}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1 border-t border-[var(--border)] pt-3">
                {[
                  { label: "High", value: formatNumber(ticker.high24h, 2) },
                  { label: "Low",  value: formatNumber(ticker.low24h, 2) },
                  { label: "Vol",  value: formatCompact(ticker.volume24h) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
                    <div className="mt-0.5 text-xs font-medium tabular-nums text-[var(--text)]">{value}</div>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Market table ── */}
      <div id="markets">
        <MarketTable tickers={tickers} />
      </div>
    </div>
  );
}

function MarketPanel({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { market: string; price: number; change: number }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="text-sm font-semibold text-[var(--text)]">{title}</span>
        <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{subtitle}</span>
      </div>
      <div>
        {rows.map((row, i) => {
          const positive = row.change >= 0;
          return (
            <Link
              key={row.market}
              href={`/trade/${row.market}`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--panel-2)]"
              style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--panel-3)] text-[9px] font-bold text-[var(--text)]">
                  {shortMarketName(row.market).charAt(0)}
                </div>
                <span className="text-sm font-medium text-[var(--text)]">
                  {shortMarketName(row.market)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm tabular-nums text-[var(--text)]">${formatNumber(row.price, 2)}</div>
                <div className={`text-xs font-medium ${positive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {positive ? "+" : ""}{formatNumber(row.change, 2)}%
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}