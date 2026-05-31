"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api";
import { Market } from "@/types/api";
import { useToastStore } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";

export default function OrderForm({ market }: { market: Market }) {
  const token     = useAuthStore((s) => s.token);
  const pushToast = useToastStore((s) => s.push);

  const [side,     setSide]     = useState<"BUY" | "SELL">("BUY");
  const [kind,     setKind]     = useState<"LIMIT" | "MARKET">("LIMIT");
  const [price,    setPrice]    = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function onSubmit() {
    if (!token) {
      pushToast({ title: "Login required", description: "Sign in to place orders.", tone: "info" });
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      pushToast({ title: "Invalid quantity", description: "Enter a valid quantity.", tone: "error" });
      return;
    }
    if (kind === "LIMIT" && (!price || Number(price) <= 0)) {
      pushToast({ title: "Invalid price", description: "Enter a valid price for limit orders.", tone: "error" });
      return;
    }

    try {
      setLoading(true);
      const result = await createOrder({
        market,
        side,
        kind,
        price:    kind === "LIMIT" ? Number(price) : null,
        quantity: Number(quantity),
      });
      setQuantity("");
      if (kind === "LIMIT") setPrice("");
      pushToast({
        title: `${side} order submitted`,
        description: result?.orderId
          ? `Order ${result.orderId.slice(0, 8)} created.`
          : "Order sent to matching engine.",
        tone: "success",
      });
    } catch (error) {
      console.error("Create order failed", error);
      pushToast({ title: "Order failed", description: "Unable to place order.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  const isBuy = side === "BUY";

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--panel)", borderColor: "var(--border)" }}
    >
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2">
        <button
          onClick={() => setSide("BUY")}
          className="py-3 text-sm font-semibold transition-colors duration-150"
          style={{
            color:        isBuy ? "var(--green)" : "var(--muted)",
            borderBottom: isBuy
              ? "2px solid var(--green)"
              : "2px solid var(--border)",
            background: "transparent",
          }}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("SELL")}
          className="py-3 text-sm font-semibold transition-colors duration-150"
          style={{
            color:        !isBuy ? "var(--red)" : "var(--muted)",
            borderBottom: !isBuy
              ? "2px solid var(--red)"
              : "2px solid var(--border)",
            background: "transparent",
          }}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Limit / Market pill toggle */}
        <div
          className="flex items-center gap-1 self-start rounded-lg border p-1"
          style={{ borderColor: "var(--border)", background: "var(--panel-2)", width: "fit-content" }}
        >
          {(["LIMIT", "MARKET"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150"
              style={
                kind === k
                  ? { background: "var(--panel-4, var(--panel-3))", color: "var(--text)" }
                  : { color: "var(--muted)" }
              }
            >
              {k.charAt(0) + k.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Price input — only for LIMIT */}
        {kind === "LIMIT" && (
          <div>
            <label
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Price
            </label>
            <div
              className="flex items-center rounded-xl border px-3 py-2.5 transition-colors focus-within:border-[var(--text)]"
              style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}
            >
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                step="any"
                className="flex-1 bg-transparent text-sm tabular-nums outline-none"
                style={{ color: "var(--text)" }}
                placeholder="0.00"
              />
              <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>USDT</span>
            </div>
          </div>
        )}

        {/* Quantity input */}
        <div>
          <label
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            Quantity
          </label>
          <div
            className="flex items-center rounded-xl border px-3 py-2.5 transition-colors focus-within:border-[var(--text)]"
            style={{ borderColor: "var(--border)", background: "var(--panel-2)" }}
          >
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              min="0"
              step="any"
              className="flex-1 bg-transparent text-sm tabular-nums outline-none"
              style={{ color: "var(--text)" }}
              placeholder="0.00000"
            />
            <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>
              {market.split("_")[0]}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-bold transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{
            background: isBuy ? "var(--green)" : "var(--red)",
            color:      isBuy ? "#0b0e11" : "#ffffff",
          }}
        >
          {loading ? "Submitting…" : isBuy ? "Buy" : "Sell"}
        </button>
      </div>
    </div>
  );
}