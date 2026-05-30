import { Depth, DepthLevel } from "@/types/api";

function normalize(levels: DepthLevel[] = []) {
  return levels
    .map(([price, amount]) => [String(price), String(amount)] as DepthLevel)
    .filter(([price, amount]) => Number(price) > 0 && Number(amount) >= 0);
}

function mergeSide(
  current: DepthLevel[],
  updates: DepthLevel[],
  side: "bids" | "asks"
): DepthLevel[] {
  const map = new Map<string, string>();

  for (const [price, amount] of normalize(current)) {
    map.set(price, amount);
  }

  for (const [price, amount] of normalize(updates)) {
    if (Number(amount) === 0) {
      map.delete(price);
    } else {
      map.set(price, amount);
    }
  }

  const next = Array.from(map.entries()).map(
    ([price, amount]) => [price, amount] as DepthLevel
  );

  next.sort((a, b) =>
    side === "bids"
      ? Number(b[0]) - Number(a[0])
      : Number(a[0]) - Number(b[0])
  );

  return next;
}

export function createDepthFromSnapshot(snapshot: Depth): Depth {
  return {
    bids: mergeSide([], snapshot.bids ?? [], "bids"),
    asks: mergeSide([], snapshot.asks ?? [], "asks"),
  };
}

export function applyDepthDelta(current: Depth, delta: Partial<Depth>): Depth {
  return {
    bids: mergeSide(current.bids ?? [], delta.bids ?? [], "bids"),
    asks: mergeSide(current.asks ?? [], delta.asks ?? [], "asks"),
  };
}