export type MessageToApi =
  | {
      type: "ORDER_PLACED";
      payload: {
        orderId: string;
        executedQty: number;
        fills: {
          price: string;
          quantity: number;
          tradeId: number;
        }[];
      };
    }

  | {
      type: "ORDER_CANCELLED";
      payload: {
        orderId: string;
        remainingQuantity: number;
      };
    }

  | {
      type: "OPEN_ORDERS";
      payload: {
        orderId: string;
        market: string;
        side: string;
        type: string;

        price: number;

        quantity: number;

        filledQuantity: number;

        remainingQuantity: number;

        status: string;

        createdAt: Date;
      }[];
    }

  | {
    type:"DEPTH",
    payload:{
      
      bids: [string, string][];
      asks: [string, string][];

    }
  }