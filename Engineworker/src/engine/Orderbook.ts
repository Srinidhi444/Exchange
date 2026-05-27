import { Fills, Order } from "../types/Orderbook.types";

export class Orderbook {
  bids: Order[];
  asks: Order[];
  baseAsset: string;
  quoteAsset: string = "USDT";
  lastTradeId: number;
  currentPrice: number;

  constructor(
    baseAsset: string,
    bids: Order[],
    asks: Order[],
    lastTradeId: number,
    currentPrice: number,
  ) {
    this.bids = bids;
    this.asks = asks;
    this.baseAsset = baseAsset;
    this.lastTradeId = lastTradeId;
    this.currentPrice = currentPrice;
  }

  ticker() {
    return `${this.baseAsset}_${this.quoteAsset}`;
  }

  getSnapshot() {
    return {
      baseAsset: this.baseAsset,
      bids: this.bids,
      asks: this.asks,
      lastTradeId: this.lastTradeId,
      currentPrice: this.currentPrice,
    };
  }

  addOrder(order: Order) {
    if (order.side == "BUY") {
      const result = this.matchBids(order);
      if (!result) return;
      const { executedQty, fills } = result;
      order.filledQuantity = executedQty;
      if (executedQty == order.quantity) {
        return {
          executedQty,
          fills,
        };
      }
      this.bids.push(order);
      return {
        executedQty,
        fills,
      };
    } else {
      const result = this.mactchAsks(order);
      if (!result) return;
      const { executedQty, fills } = result;
      order.filledQuantity = executedQty;
      if (executedQty == order.quantity) {
        return {
          executedQty,
          fills,
        };
      }
      this.asks.push(order);
      return {
        executedQty,
        fills,
      };
    }
  }

  matchBids(order: Order) {
    const fills: Fills[] = [];
    let executedQty: number = 0;

    this.asks.sort((a, b) => a.price - b.price);

    for (const ask of this.asks) {
      if (order.kind === "LIMIT" && Number(order.price) < Number(ask.price))
        break;

      if (order.price >= ask.price && executedQty < order.quantity) {
        const filledQty = Math.min(
          order.quantity - executedQty,
          ask.quantity - ask.filledQuantity,
        );

        ask.filledQuantity += filledQty;
        executedQty += filledQty;

        this.lastTradeId++;

        fills.push({
          price: ask.price,
          quantity: filledQty,
          tradeId: this.lastTradeId,
          marketOrderId: ask.orderId,
          otheruserId: ask.userId,
          marketRemainingQuantity: ask.quantity - ask.filledQuantity,
        });
      }
    }

    this.asks = this.asks.filter((a) => a.filledQuantity < a.quantity);

    return { executedQty, fills };
  }

  mactchAsks(order: Order) {
    const fills: Fills[] = [];
    let executedQty: number = 0;

    this.bids.sort((a, b) => b.price - a.price);

    for (let i = 0; i < this.bids.length; i++) {
      if (this.bids[i].price >= order.price && executedQty < order.quantity) {
        const remainingQty = Math.min(
          order.quantity - executedQty,
          this.bids[i].quantity - this.bids[i].filledQuantity,
        );

        this.bids[i].filledQuantity += remainingQty;
        executedQty += remainingQty;

        this.lastTradeId++;

        fills.push({
          price: this.bids[i].price,
          quantity: remainingQty,
          tradeId: this.lastTradeId,
          marketOrderId: this.bids[i].orderId,
          otheruserId: this.bids[i].userId,
          marketRemainingQuantity:
            this.bids[i].quantity - this.bids[i].filledQuantity,
        });
      }
    }

    this.bids = this.bids.filter((b) => b.filledQuantity < b.quantity);

    return { executedQty, fills };
  }

  cancelBid(order: Order) {
    const index = this.bids.findIndex((x) => x.orderId === order.orderId);
    if (index !== -1) {
      const price = this.bids[index].price;
      this.bids.splice(index, 1);
      return price;
    }
  }

  cancelAsk(order: Order) {
    const index = this.asks.findIndex((x) => x.orderId === order.orderId);
    if (index !== -1) {
      const price = this.asks[index].price;
      this.asks.splice(index, 1);
      return price;
    }
  }
}