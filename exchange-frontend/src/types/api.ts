export type Market = "BTC_USDT" | "ETH_USDT" | "SOL_USDT";

export interface DepthResponse {
  bids: [string, string][];
  asks: [string, string][];
}

export interface PublicTrade {
  id?: number;
  market: string;
  buyer_user_id?: string;
  seller_user_id?: string;
  price: string | number;
  quantity: string | number;
  quote_quantity?: string | number;
  is_buyer_maker?: boolean;
  created_at?: string;
}

export interface TradesResponse {
  trades: PublicTrade[];
}

export interface TickerResponse {
  market: string;
  lastPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  change24h: number;
}

export interface Balance {
  asset: string;
  available: string | number;
  locked: string | number;
}

export interface BalancesResponse {
  balances: Balance[];
}

export interface OpenOrder {
  orderId: string;
  market: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET" | string;
  price: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED" | string;
  createdAt: string;
}

export interface OpenOrdersResponse extends Array<OpenOrder> {}

export interface AuthResponse {
  token: string;
}

export interface CreateOrderPayload {
  market: string;
  side: "BUY" | "SELL";
  kind: "LIMIT" | "MARKET";
  price?: number | null;
  quantity: number;
}
export interface Kline {
  bucket: string;
  open: string | number;
  high: string | number;
  low: string | number;
  close: string | number;
  volume: string | number;
}
export type DepthLevel = [string, string];

export interface Depth {
  bids: DepthLevel[];
  asks: DepthLevel[];
}