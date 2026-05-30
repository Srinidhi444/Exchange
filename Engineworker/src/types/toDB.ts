export type DBMessage =
  | {
      type: "ORDER_CREATED";
      data: {
        orderId: string;
        userId: string;
        market: string;
        side: "BUY" | "SELL";
        kind: "LIMIT" | "MARKET";
        price: number;
        quantity: number;
        remainingQuantity: number;
        status: "OPEN" | "PARTIALLY_FILLED" | "FILLED";
      };
    }
  | {
      type: "ORDER_UPDATED";
      data: {
        orderId: string;
        filledQuantity: number;
        remainingQuantity: number;
        status: "PARTIALLY_FILLED" | "FILLED";
      };
    }
  | {
      type: "ORDER_CANCELLED";
      data: {
        orderId: string;
        executedQty: number;
        remainingQuantity: number;
        status: "CANCELLED";
      };
    }
  | {
      type: "TRADE_CREATED";
      data: {
        tradeId: number;
        market: string;
        buyerUserId: string;
        sellerUserId: string;
        price: number;
        quantity: string;
        quoteQuantity: string;
        isBuyerMaker: boolean;
        timestamp: number;
      };
    }
  | {
      type: "MARKET_TICK_ADDED";
      data: {
        market: string;
        price: number;
        volume: number;
        createdAt: number;
      };
    }
  | {
      type: "BALANCE_UPDATED";
      data: {
        userId: string;
        asset: string;
        available: number;
        locked: number;
      };
    };