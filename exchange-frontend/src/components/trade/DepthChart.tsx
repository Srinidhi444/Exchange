"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Depth } from "@/types/api";
import { buildDepthSeries } from "@/lib/depth-utils";

type Props = {
  depth: Depth;
};

export default function DepthChart({ depth }: Props) {
  const data = useMemo(() => {
    const { bidSeries, askSeries } = buildDepthSeries(depth, 40);

    const bidData = bidSeries.map((item) => ({
      price: item.price,
      bids: item.cumulative,
      asks: null,
    }));

    const askData = askSeries.map((item) => ({
      price: item.price,
      bids: null,
      asks: item.cumulative,
    }));

    return [...bidData, ...askData].sort((a, b) => a.price - b.price);
  }, [depth]);

  return (
    <div className="h-[420px] w-full rounded-xl bg-[var(--panel-2)] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[var(--text)]">Market Depth</div>
          <div className="text-xs text-[var(--muted)]">Cumulative bids and asks</div>
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis
              dataKey="price"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              type="number"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "var(--panel-3)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                color: "var(--text)",
              }}
              formatter={(value: number | string | null, name: string) => [
                value ?? "--",
                name === "bids" ? "Bid Depth" : "Ask Depth",
              ]}
              labelFormatter={(label) => `Price: ${label}`}
            />
            <Area
              type="stepAfter"
              dataKey="bids"
              stroke="#16c784"
              fill="#16c784"
              fillOpacity={0.22}
              strokeWidth={2}
              connectNulls
            />
            <Area
              type="stepBefore"
              dataKey="asks"
              stroke="#ea3943"
              fill="#ea3943"
              fillOpacity={0.22}
              strokeWidth={2}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}