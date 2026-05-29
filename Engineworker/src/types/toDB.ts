import { KIND, SIDE } from "./Orderbook.types";

export type TradeCreatedMessage = {
    type: "TRADE_CREATED";
    data: {
        tradeId: number;
        market: string;
        price: number;
        isBuyerMaker: boolean;
        quantity: string;
        quoteQuantity: string;
        timestamp: Date;
    };
};

export type OrderCreatedMessage = {
    type: "ORDER_CREATED";
    data: {
        orderId: string;
        userId: string;
        market: string;
        side: SIDE;
        kind: KIND;
        price: number;
        quantity: number;
        remainingQuantity: number;
        status: "OPEN";
    };
};

export type OrderUpdatedMessage = {
    type: "ORDER_UPDATED";
    data: {
        orderId: string;
        executedQty: number;
        remainingQuantity: number;
        status: "PARTIALLY_FILLED" | "FILLED";
    };
};

export type OrderCancelledMessage = {
    type: "ORDER_CANCELLED";
    data: {
        orderId: string;
        executedQty: number;
        remainingQuantity: number;
        status: "CANCELLED";
    };
};
export type MarketTickMessage={
    type:"MARKET_TICK_ADDED",
    data:{
        market:string,
        price:number;
        volume:number;
        createdAt: number
    }
}

export type DBMessage =
    | TradeCreatedMessage
    | OrderCreatedMessage
    | OrderUpdatedMessage
    | OrderCancelledMessage
    | MarketTickMessage;