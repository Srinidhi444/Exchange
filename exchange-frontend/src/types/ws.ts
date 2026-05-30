export interface WsSubscribeMessage {
  method: "SUBSCRIBE" | "UNSUBSCRIBE";
  params: string[];
  token?: string;
}

export interface DepthStreamEvent {
  stream: string;
  data: {
    a: [string, string][];
    b: [string, string][];
    e: "depth";
  };
}

export interface PublicTradeStreamEvent {
  stream: string;
  data: {
    e: "trade";
    t: number;
    s: string;
    p: string;
    q: string;
    m: boolean;
    T: number;
  };
}

export interface BalanceStreamEvent {
  stream: string;
  data: {
    asset: string;
    available: number;
    locked: number;
  };
}

export interface OrdersStreamEvent {
  stream: string;
  data: {
    event: "ORDER_CREATED" | "ORDER_UPDATED" | "ORDER_CANCELLED";
    orderId?: string;
    executedQty?: number;
    remainingQuantity?: number;
    status?: string;
    order?: unknown;
  };
}

export interface UserTradeStreamEvent {
  stream: string;
  data: {
    tradeId: number;
    market: string;
    price: number;
    quantity: number;
    side: "BUY" | "SELL";
    timestamp: number;
  };
}

export type IncomingWsEvent =
  | DepthStreamEvent
  | PublicTradeStreamEvent
  | BalanceStreamEvent
  | OrdersStreamEvent
  | UserTradeStreamEvent
  | { message?: string; error?: string };