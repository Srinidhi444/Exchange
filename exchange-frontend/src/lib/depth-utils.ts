import { Depth, DepthLevel } from "@/types/api";

export type DepthSide = "bids" | "asks";

function toNum(v: string | number) {
  return Number(v);
}

export function normalizeLevels(levels: DepthLevel[] = []) {
  return levels
    .map(([price, quantity]) => [String(price), String(quantity)] as DepthLevel)
    .filter(([price, quantity]) => toNum(price) > 0 && toNum(quantity) >= 0);
}

export function sortLevels(levels: DepthLevel[], side: DepthSide) {
  return [...levels].sort((a, b) =>
    side === "bids"
      ? toNum(b[0]) - toNum(a[0])
      : toNum(a[0]) - toNum(b[0])
  );
}

export function mergeDepthSide(
  current: DepthLevel[],
  updates: DepthLevel[],
  side: DepthSide
): DepthLevel[] {
  const map = new Map<string, string>();

  for (const [price, quantity] of normalizeLevels(current)) {
    if (toNum(quantity) > 0) map.set(price, quantity);
  }

  for (const [price, quantity] of normalizeLevels(updates)) {
    if (toNum(quantity) <= 0) {
      map.delete(price);
    } else {
      map.set(price, quantity);
    }
  }

  return sortLevels(
    Array.from(map.entries()).map(([price, quantity]) => [price, quantity] as DepthLevel),
    side
  );
}

export function mergeDepth(current: Depth, delta: Partial<Depth>): Depth {
  return {
    bids: mergeDepthSide(current?.bids ?? [], delta?.bids ?? [], "bids"),
    asks: mergeDepthSide(current?.asks ?? [], delta?.asks ?? [], "asks"),
  };
}

export function buildDepthSeries(depth: Depth, limit = 40) {
  const bids = (depth?.bids ?? []).slice(0, limit);
  const asks = (depth?.asks ?? []).slice(0, limit);

  let cumulativeBid = 0;
  const bidSeries = bids
    .slice()
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([price, quantity]) => {
      cumulativeBid += Number(quantity);
      return {
        price: Number(price),
        quantity: Number(quantity),
        cumulative: cumulativeBid,
      };
    });

  let cumulativeAsk = 0;
  const askSeries = asks.map(([price, quantity]) => {
    cumulativeAsk += Number(quantity);
    return {
      price: Number(price),
      quantity: Number(quantity),
      cumulative: cumulativeAsk,
    };
  });

  return { bidSeries, askSeries };
}