import { KIND, SIDE } from "./Orderbook.types";

export type MessageToDB = {
    type: "TRADE_CREATED";
    data: {
        tradeId: number;
        market: string;
        price: number;
        isbuyerMaker: boolean;
        quantity: string;
        quoteQuantity: string;
        timestamp: Date;
    }
}
export type OrderUpdatedMessageToDB={
    type:"ORDER_UPDATED";
    data:{
        orderId:string;
        executedqty:number;
        market:string;
        price:string;
        quantity:string;
        side:SIDE;
        kind:KIND;
    } | {
        orderId:string;
        executedqty:number;
    }
} 
export type OrderCreated = {
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
  };
};


export type DBOrders= MessageToDB | OrderUpdatedMessageToDB | OrderCreated;