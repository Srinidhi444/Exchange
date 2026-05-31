import { Depth, DepthLevel } from "@/types/api";

export type DepthSide = "bids" | "asks";

type DepthPoint = {
  price: number;
  cumulative: number;
};

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

export function buildDepthSeries(depth: Depth, limit = 60) {
  // Bids: sorted highest → lowest price (best bid first)
  const bidsRaw = (depth?.bids ?? [])
    .map(([price, qty]) => ({ price: Number(price), qty: Number(qty) }))
    .filter((x) => Number.isFinite(x.price) && Number.isFinite(x.qty) && x.qty > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, limit);

  // Asks: sorted lowest → highest price (best ask first)
  const asksRaw = (depth?.asks ?? [])
    .map(([price, qty]) => ({ price: Number(price), qty: Number(qty) }))
    .filter((x) => Number.isFinite(x.price) && Number.isFinite(x.qty) && x.qty > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, limit);

  // Bids accumulate from highest price → lowest price.
  // This means the point at the far LEFT (lowest price) has the MOST cumulative depth,
  // and the point nearest mid-price (highest price, rightmost bid) has the LEAST.
  // Result: a curve that starts tall on the left and descends toward mid-price. ✓
  let bidRunning = 0;
  const bidSeries: DepthPoint[] = bidsRaw.map((level) => {
    bidRunning += level.qty;
    return { price: level.price, cumulative: bidRunning };
  });
  // bidSeries is now ordered highest→lowest price with cumulative growing as we go left.
  // Reverse so chart receives points in ascending price order (Recharts requires this).
  bidSeries.reverse();

  // Asks accumulate from lowest price → highest price.
  // The point nearest mid-price (leftmost ask) has the LEAST cumulative depth,
  // and the far-right point has the MOST. Result: ascending curve away from mid. ✓
  let askRunning = 0;
  const askSeries: DepthPoint[] = asksRaw.map((level) => {
    askRunning += level.qty;
    return { price: level.price, cumulative: askRunning };
  });

  return { bidSeries, askSeries };
}