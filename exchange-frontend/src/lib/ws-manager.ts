import { IncomingWsEvent, WsSubscribeMessage } from "@/types/ws";
import { WS_URL } from "./constants";

type Listener = (event: IncomingWsEvent) => void;

function buildKey(payload: WsSubscribeMessage) {
  return JSON.stringify({
    method: payload.method,
    params: [...payload.params].sort(),
    token: payload.token ?? null,
  });
}

class WSManager {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private queuedMessages: string[] = [];
  private isConnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private activeSubscriptions = new Map<string, WsSubscribeMessage>();

  connect() {
    if (this.socket || this.isConnecting) return;

    this.isConnecting = true;
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      this.isConnecting = false;

      while (this.queuedMessages.length) {
        const msg = this.queuedMessages.shift();
        if (msg) this.socket?.send(msg);
      }

      for (const subscription of this.activeSubscriptions.values()) {
        this.socket?.send(JSON.stringify(subscription));
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as IncomingWsEvent;
        console.log("listening",parsed)
        this.listeners.forEach((listener) => listener(parsed));
      } catch (error) {
        console.error("WS parse error", error);
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.isConnecting = false;

      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 1500);
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(payload: WsSubscribeMessage) {
    console.log("sending subsciption form client",payload);
    const serialized = JSON.stringify(payload);

    if (payload.method === "SUBSCRIBE") {
      this.activeSubscriptions.set(buildKey(payload), payload);
    }

    if (payload.method === "UNSUBSCRIBE") {
      for (const [key, value] of this.activeSubscriptions.entries()) {
        const sameParams =
          [...value.params].sort().join("|") === [...payload.params].sort().join("|");
        if (sameParams) {
          this.activeSubscriptions.delete(key);
        }
      }
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(serialized);
    } else {
      this.queuedMessages.push(serialized);
      this.connect();
    }
  }

  clearPrivateSubscriptions() {
    for (const [key, value] of this.activeSubscriptions.entries()) {
      const isPrivate =
        value.params.includes("balances") ||
        value.params.includes("orders") ||
        value.params.includes("trades");

      if (isPrivate) {
        this.activeSubscriptions.delete(key);
      }
    }
  }

  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }
}

export const wsManager = new WSManager();