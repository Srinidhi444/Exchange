import axios from "axios";
import {
  AuthResponse,
  BalancesResponse,
  CreateOrderPayload,
  DepthResponse,
  Market,
  OpenOrder,
  PublicTrade,
  TickerResponse,
  Kline 
} from "@/types/api";
import { API_URL } from "./constants";
import "dotenv/config"
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});
console.log("this is api url",API_URL)

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function signup(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/signup", { email, password });
  return data;
}

export async function signin(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/signin", { email, password });
  return data;
}

export async function getTicker(market: Market) {
  const { data } = await api.get<TickerResponse>("/ticker", { params: { market } });
  return data;
}

export async function getDepth(market: Market) {
  const { data } = await api.get<DepthResponse>("/depth", { params: { symbol: market } });
  return data;
}

export async function getTrades(market: Market) {
  const { data } = await api.get<{ trades: PublicTrade[] }>("/trades", { params: { market } });
  return data.trades;
}

export async function getBalances() {
  const { data } = await api.get<BalancesResponse>("/balances");
  return data.balances;
}

export async function getOpenOrders(market: Market) {
  const { data } = await api.get<OpenOrder[]>("/orders/open", { params: { market } });
  return data;
}

export async function getMyTrades() {
  const { data } = await api.get<{ trades: PublicTrade[] }>("/trades/my-trades");
  return data.trades;
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await api.post("/orders", payload);
  return data;
}

export async function cancelOrder(orderId: string, market: Market) {
  const { data } = await api.delete(`/orders/${orderId}`, { data: { market } });
  return data;
}
export async function getKlines(
  market: Market,
  interval: "1m" | "5m" | "1h" = "1m"
) {
  const { data } = await api.get<{ klines: Kline[] }>("/klines", {
    params: { market, interval },
  });
  return data.klines;
}

export default api;