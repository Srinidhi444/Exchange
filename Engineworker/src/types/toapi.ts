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
    };