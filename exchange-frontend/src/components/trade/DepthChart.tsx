"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Depth } from "@/types/api";
import { buildDepthSeries } from "@/lib/depth-utils";

type Props = {
  depth: Depth;
};

function formatYAxis(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function formatPrice(value: number) {
  return Number(value).toFixed(2);
}

// Recharts <Area> with two different `data` props on the same <AreaChart> requires
// the parent chart to have a combined dataset OR we use a trick: render a single
// AreaChart with a merged/unified x-axis and pass per-series `data` overrides.
// Recharts supports per-series `data` prop on <Area> — each series uses its own
// points while sharing the same axes. This is the correct approach.

export default function DepthChart({ depth }: Props) {
  const { bidData, askData, minPrice, maxPrice, midPrice, maxCumulative } =
    useMemo(() => {
      const { bidSeries, askSeries } = buildDepthSeries(depth, 60);

      // bidSeries: ascending price, cumulative grows toward the LEFT (index 0 = lowest price = highest cumulative)
      // askSeries: ascending price, cumulative grows toward the RIGHT
      const bidData = bidSeries.map((item) => ({
        price: item.price,
        value: item.cumulative,
      }));

      const askData = askSeries.map((item) => ({
        price: item.price,
        value: item.cumulative,
      }));

      const bestBid =
        bidSeries.length > 0 ? bidSeries[bidSeries.length - 1].price : undefined;
      const bestAsk =
        askSeries.length > 0 ? askSeries[0].price : undefined;

      const midPrice =
        bestBid !== undefined && bestAsk !== undefined
          ? (bestBid + bestAsk) / 2
          : undefined;

      const minPrice =
        bidData.length > 0
          ? bidData[0].price
          : askData.length > 0
          ? askData[0].price
          : 0;

      const maxPrice =
        askData.length > 0
          ? askData[askData.length - 1].price
          : bidData.length > 0
          ? bidData[bidData.length - 1].price
          : 0;

      const maxCumulative = Math.max(
        bidData.length > 0 ? bidData[0].value : 0,
        askData.length > 0 ? askData[askData.length - 1].value : 0
      );

      return { bidData, askData, minPrice, maxPrice, midPrice, maxCumulative };
    }, [depth]);

  // We render a single AreaChart with no top-level `data` prop.
  // Each <Area> receives its own `data` prop — this is a supported Recharts pattern
  // that lets two independent series share a unified numeric X axis.
  return (
    <div className="h-full w-full bg-[#0b0f19] px-3 py-2">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart margin={{ top: 8, right: 10, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="bidFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16c784" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#16c784" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="askFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea3943" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#ea3943" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.10)"
              strokeDasharray="3 4"
              vertical={true}
              horizontal={false}
            />

            <XAxis
              type="number"
              dataKey="price"
              domain={[minPrice, maxPrice]}
              tickFormatter={formatPrice}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              tickLine={false}
              minTickGap={28}
            />

            <YAxis
              tickFormatter={formatYAxis}
              domain={[0, Math.ceil(maxCumulative * 1.08)]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              tickLine={false}
              width={42}
            />

            {midPrice !== undefined && (
              <ReferenceLine
                x={midPrice}
                stroke="rgba(226, 232, 240, 0.15)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            )}

            <Tooltip
              cursor={{ stroke: "rgba(148,163,184,0.2)", strokeWidth: 1 }}
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                borderRadius: "10px",
                color: "#e5e7eb",
                boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
                fontSize: 12,
              }}
              labelStyle={{ color: "#cbd5e1" }}
              labelFormatter={(label) => `Price: ${formatPrice(Number(label))}`}
              formatter={(value: number | string | null, name: string) => [
                value ?? "--",
                name === "bidValue" ? "Bid Depth" : "Ask Depth",
              ]}
            />

            {/* Bids: left side, descends toward mid-price */}
            <Area
              data={bidData}
              type="stepAfter"
              dataKey="value"
              name="bidValue"
              stroke="#18c58f"
              strokeWidth={1.5}
              fill="url(#bidFill)"
              isAnimationActive={false}
            />

            {/* Asks: right side, ascends away from mid-price */}
            <Area
              data={askData}
              type="stepBefore"
              dataKey="value"
              name="askValue"
              stroke="#f0525f"
              strokeWidth={1.5}
              fill="url(#askFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}