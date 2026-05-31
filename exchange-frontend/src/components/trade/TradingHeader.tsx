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
  const positive = ticker.change24h >= 0;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border px-5 py-3 xl:flex-row xl:items-center xl:justify-between"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      {/* Left — market name + stats */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

        {/* Market name */}
        <div>
          <div className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {shortMarketName(market)}
          </div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Spot
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-px xl:block" style={{ background: "var(--border)" }} />

        {/* Last price — most prominent */}
        <div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Last Price
          </div>
          <div className="text-lg font-bold tabular-nums" style={{ color: "var(--text)" }}>
            ${formatNumber(ticker.lastPrice, 2)}
          </div>
        </div>

        {/* 24h Change */}
        <StatCell
          label="24h Change"
          value={`${positive ? "+" : ""}${formatNumber(ticker.change24h, 2)}%`}
          valueColor={positive ? "var(--green)" : "var(--red)"}
        />

        {/* 24h High */}
        <StatCell label="24h High" value={formatNumber(ticker.high24h, 2)} />

        {/* 24h Low */}
        <StatCell label="24h Low" value={formatNumber(ticker.low24h, 2)} />

        {/* 24h Volume */}
        <StatCell label="24h Vol" value={formatNumber(ticker.volume24h, 2)} />
      </div>

      {/* Right — market switcher */}
      <div
        className="flex items-center gap-1 rounded-xl border p-1"
        style={{ borderColor: "var(--border)", background: "var(--panel-2)", width: "fit-content" }}
      >
        {MARKETS.map((item) => (
          <Link
            key={item}
            href={`/trade/${item}`}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150"
            style={
              item === market
                ? { background: "var(--panel-3)", color: "var(--text)" }
                : { color: "var(--muted)" }
            }
          >
            {shortMarketName(item)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div
        className="text-sm tabular-nums font-medium"
        style={{ color: valueColor ?? "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}