"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  ColorType,
  createChart,
  CandlestickSeries,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  CrosshairMode,
  Time,
} from "lightweight-charts";
import { getKlines } from "@/lib/api";
import { Kline, Market } from "@/types/api";
import { wsManager } from "@/lib/ws-manager";
import { IncomingWsEvent } from "@/types/ws";

type Interval = "1m" | "5m" | "1h";

interface Props {
  market: Market;
  interval: Interval;
  initialKlines: Kline[];
}

function toUnixSec(bucket: string): Time {
  return Math.floor(new Date(bucket).getTime() / 1000) as Time;
}

function normalizeKlines(klines: Kline[]) {
  return [...klines].reverse().map((k) => ({
    time: toUnixSec(k.bucket),
    open: Number(k.open),
    high: Number(k.high),
    low: Number(k.low),
    close: Number(k.close),
    volume: Number(k.volume),
  }));
}

export default function ChartPanel({ market, interval, initialKlines }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // ── Build & rebuild chart when interval changes ──────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous chart instance on interval change
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0d1117" },
        textColor: "#8b98a9",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(139,152,169,0.3)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1e2530",
        },
        horzLine: {
          color: "rgba(139,152,169,0.3)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1e2530",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.06)",
        textColor: "#8b98a9",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16c784",
      downColor: "#ea3943",
      borderVisible: false,
      wickUpColor: "#16c784",
      wickDownColor: "#ea3943",
      priceLineVisible: true,
      priceLineColor: "rgba(139,152,169,0.4)",
      priceLineWidth: 1,
      lastValueVisible: true,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });

    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;
    chartRef.current = chart;

    // Load initial data then fetch fresh data for this interval
    const initial = normalizeKlines(initialKlines);
    if (initial.length > 0) {
      candleSeries.setData(
        initial.map(({ volume, ...rest }) => rest as CandlestickData)
      );
      volumeSeries.setData(
        initial.map((item) => ({
          time: item.time,
          value: item.volume,
          color:
            item.close >= item.open
              ? "rgba(22,199,132,0.30)"
              : "rgba(234,57,67,0.30)",
        })) as HistogramData[]
      );
    }

    // Fetch correct interval data
    getKlines(market, interval)
      .then((klines) => {
        const data = normalizeKlines(klines);
        candleSeries.setData(
          data.map(({ volume, ...rest }) => rest as CandlestickData)
        );
        volumeSeries.setData(
          data.map((item) => ({
            time: item.time,
            value: item.volume,
            color:
              item.close >= item.open
                ? "rgba(22,199,132,0.30)"
                : "rgba(234,57,67,0.30)",
          })) as HistogramData[]
        );
        chart.timeScale().fitContent();
      })
      .catch((e) => console.error("Klines fetch failed", e));

    chart.timeScale().fitContent();

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, [market, interval]);

  // ── Live kline updates via WebSocket ─────────────────────────────────────
  useEffect(() => {
    const stream = `kline_${interval}@${market}`;

    const unsub = wsManager.subscribe((event: IncomingWsEvent) => {
      if (
        "stream" in event &&
        event.stream === stream &&
        "data" in event &&
        event.data?.e === "kline"
      ) {
        const k = event.data.k;
        if (!k) return;

        const candle: CandlestickData = {
          time: Math.floor(k.t / 1000) as Time,
          open: Number(k.o),
          high: Number(k.h),
          low: Number(k.l),
          close: Number(k.c),
        };

        const vol: HistogramData = {
          time: candle.time,
          value: Number(k.v),
          color:
            Number(k.c) >= Number(k.o)
              ? "rgba(22,199,132,0.30)"
              : "rgba(234,57,67,0.30)",
        };

        candleRef.current?.update(candle);
        volumeRef.current?.update(vol);
      }
    });

    wsManager.send({ method: "SUBSCRIBE", params: [stream] });

    return () => {
      wsManager.send({ method: "UNSUBSCRIBE", params: [stream] });
      unsub();
    };
  }, [market, interval]);

  return (
    <div className="h-full w-full bg-[#0d1117]">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}