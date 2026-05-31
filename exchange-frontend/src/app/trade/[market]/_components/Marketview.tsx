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

export default function MarketView({ market, initialDepth, initialKlines }: Props) {
  const [viewMode,  setViewMode]      = useState<ViewMode>("chart");
  const [interval,  setIntervalValue] = useState<Interval>("1m");
  const [depth,     setDepth]         = useState<Depth>(() => createDepthFromSnapshot(initialDepth));

  useEffect(() => {
    setDepth(createDepthFromSnapshot(initialDepth));
  }, [initialDepth, market]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "SUBSCRIBE", market, channels: ["depth"] }));
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

    return () => { ws.close(); };
  }, [market]);

  return (
    <section
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center justify-between border-b px-4"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Chart / Depth tabs */}
        <div className="flex items-center">
          {(["chart", "depth"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="relative px-4 py-3 text-sm font-medium capitalize transition-colors duration-150"
              style={{ color: viewMode === mode ? "var(--text)" : "var(--muted)" }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {viewMode === mode && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: "var(--green)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Interval pills — only when chart is active */}
        {viewMode === "chart" && (
          <div
            className="flex items-center gap-1 rounded-lg border p-1"
            style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}
          >
            {(["1m", "5m", "1h"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setIntervalValue(item)}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150"
                style={
                  interval === item
                    ? { background: "var(--panel-3)", color: "var(--text)" }
                    : { color: "var(--muted)" }
                }
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="h-[420px]">
        {viewMode === "chart" ? (
          <ChartPanel market={market} interval={interval} initialKlines={initialKlines} />
        ) : (
          <DepthPanel depth={depth} />
        )}
      </div>
    </section>
  );
}