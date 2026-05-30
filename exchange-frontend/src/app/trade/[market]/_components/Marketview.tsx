"use client";

import { useEffect, useState } from "react";
import ChartPanel from "@/components/trade/ChartPanel";
import DepthPanel from "@/components/trade/DepthPanel";
import { applyDepthDelta, createDepthFromSnapshot } from "@/lib/depth-book";
import { WS_URL } from "@/lib/constants";
import { Depth, Kline, Market } from "@/types/api";

type ViewMode = "chart" | "depth";
type Interval = "1m" | "5m" | "1h";

type Props = {
  market: Market;
  initialDepth: Depth;
  initialKlines: Kline[];
};

export default function MarketView({
  market,
  initialDepth,
  initialKlines,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [interval, setIntervalValue] = useState<Interval>("1m");
  const [depth, setDepth] = useState<Depth>(() => createDepthFromSnapshot(initialDepth));

  useEffect(() => {
    setDepth(createDepthFromSnapshot(initialDepth));
  }, [initialDepth, market]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE",
          market,
          channels: ["depth"],
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.market !== market) return;

        if (message.type === "depth_snapshot") {
          setDepth(createDepthFromSnapshot(message.data));
          return;
        }

        if (message.type === "depth_delta") {
          setDepth((prev) => applyDepthDelta(prev, message.data));
        }
      } catch (error) {
        console.error("depth stream parse failed", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [market]);

  return (
    <section className="exchange-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("chart")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              viewMode === "chart"
                ? "bg-[var(--panel-3)] text-[var(--text)]"
                : "text-[var(--muted)]"
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setViewMode("depth")}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              viewMode === "depth"
                ? "bg-[var(--panel-3)] text-[var(--text)]"
                : "text-[var(--muted)]"
            }`}
          >
            Depth
          </button>
        </div>

        {viewMode === "chart" ? (
          <div className="flex items-center gap-2">
            {(["1m", "5m", "1h"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setIntervalValue(item)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  interval === item
                    ? "bg-[var(--panel-3)] text-[var(--text)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {viewMode === "chart" ? (
        <ChartPanel
          market={market}
          interval={interval}
          initialKlines={initialKlines}
        />
      ) : (
        <DepthPanel depth={depth} />
      )}
    </section>
  );
}