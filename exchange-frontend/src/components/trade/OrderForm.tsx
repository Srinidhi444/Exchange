"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api";
import { Market } from "@/types/api";
import { useToastStore } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";

export default function OrderForm({ market }: { market: Market }) {
  const token = useAuthStore((s) => s.token);
  const pushToast = useToastStore((s) => s.push);

  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [kind, setKind] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!token) {
      pushToast({
        title: "Login required",
        description: "Sign in to place orders and receive private order updates.",
        tone: "info",
      });
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      pushToast({
        title: "Invalid quantity",
        description: "Enter a valid quantity before submitting.",
        tone: "error",
      });
      return;
    }

    if (kind === "LIMIT" && (!price || Number(price) <= 0)) {
      pushToast({
        title: "Invalid price",
        description: "Enter a valid price for limit orders.",
        tone: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const result = await createOrder({
        market,
        side,
        kind,
        price: kind === "LIMIT" ? Number(price) : null,
        quantity: Number(quantity),
      });

      setQuantity("");
      if (kind === "LIMIT") setPrice("");

      pushToast({
        title: `${side} order submitted`,
        description: result?.orderId
          ? `Order ${result.orderId.slice(0, 8)} created successfully.`
          : "Order sent to matching engine.",
        tone: "success",
      });
    } catch (error) {
      console.error("Create order failed", error);
      pushToast({
        title: "Order failed",
        description: "Unable to place order. Check auth, funds, or engine connectivity.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="exchange-panel h-[280px] p-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setSide("BUY")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            side === "BUY" ? "bg-[var(--green)] text-black" : "bg-[var(--panel-3)]"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("SELL")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            side === "SELL" ? "bg-[var(--red)] text-white" : "bg-[var(--panel-3)]"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mb-4 flex gap-2 text-xs">
        <button
          onClick={() => setKind("LIMIT")}
          className={`rounded-md px-3 py-1 ${
            kind === "LIMIT" ? "bg-[var(--yellow)] text-black" : "bg-[var(--panel-3)]"
          }`}
        >
          Limit
        </button>
        <button
          onClick={() => setKind("MARKET")}
          className={`rounded-md px-3 py-1 ${
            kind === "MARKET" ? "bg-[var(--yellow)] text-black" : "bg-[var(--panel-3)]"
          }`}
        >
          Market
        </button>
      </div>

      <div className="space-y-3">
        {kind === "LIMIT" && (
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-3)] px-3 py-2 outline-none"
              placeholder="Enter price"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">Quantity</label>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel-3)] px-3 py-2 outline-none"
            placeholder="Enter quantity"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full rounded-lg px-4 py-2 font-semibold transition ${
            side === "BUY" ? "bg-[var(--green)] text-black" : "bg-[var(--red)] text-white"
          }`}
        >
          {loading ? "Submitting..." : `${side} ${market.replace("_USDT", "")}`}
        </button>
      </div>
    </div>
  );
}