"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColorType,
  createChart,
  CandlestickSeries,
  HistogramSeries,
  IChartApi,
} from "lightweight-charts";
import { getKlines } from "@/lib/api";
import { Kline, Market } from "@/types/api";

type Interval = "1m" | "5m" | "1h";

function normalizeKlines(klines: Kline[]) {
  return [...klines]
    .reverse()
    .map((k) => ({
      time: Math.floor(new Date(k.bucket).getTime() / 1000) as never,
      open: Number(k.open),
      high: Number(k.high),
      low: Number(k.low),
      close: Number(k.close),
      value: Number(k.volume),
    }));
}

export default function ChartPanel({ market }: { market: Market }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [interval, setInterval] = useState<Interval>("1m");
  const [klines, setKlines] = useState<Kline[]>([]);

  useEffect(() => {
    getKlines(market, interval)
      .then(setKlines)
      .catch((e) => console.error("Klines fetch failed", e));
  }, [market, interval]);

  const normalized = useMemo(() => normalizeKlines(klines), [klines]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#11151b" },
        textColor: "#8c98a9",
      },
      grid: {
        vertLines: { color: "#1a2029" },
        horzLines: { color: "#1a2029" },
      },
      width: containerRef.current.clientWidth,
      height: 360,
      rightPriceScale: {
        borderColor: "#232a34",
      },
      timeScale: {
        borderColor: "#232a34",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16c784",
      downColor: "#ea3943",
      borderVisible: false,
      wickUpColor: "#16c784",
      wickDownColor: "#ea3943",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      color: "#f0b90b",
    });

    candleSeries.setData(
      normalized.map(({ value, ...rest }) => rest)
    );

    volumeSeries.setData(
      normalized.map((item) => ({
        time: item.time,
        value: item.value,
        color: item.close >= item.open ? "rgba(22,199,132,0.35)" : "rgba(234,57,67,0.35)",
      }))
    );

    chart.priceScale("").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    chartRef.current = chart;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [normalized]);

  return (
    <div className="exchange-panel h-[420px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Chart</div>
        <div className="flex gap-2 text-xs text-[var(--muted)]">
          {(["1m", "5m", "1h"] as Interval[]).map((item) => (
            <button
              key={item}
              onClick={() => setInterval(item)}
              className={`rounded-md px-2 py-1 ${
                interval === item ? "bg-[var(--panel-3)] text-white" : "hover:bg-[var(--panel-3)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="h-[360px] w-full" />
    </div>
  );
}