import { WebSocket } from "ws";
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/incoming";

import { SubscriptionManager } from "./Mangers/SubscriptionManager";

// This architecture lets each user
// manage its own websocket connection

export class User {
  private id: string;

  private wss: WebSocket;

  constructor(id: string, wss: WebSocket) {
    this.id = id;
    this.wss = wss;

    this.addListeners();
  }

  emit(message: any) {
    this.wss.send(JSON.stringify(message));
  }

  private addListeners() {
    this.wss.on("message", (message: string) => {
      try {
        const parsedMessage: IncomingMessage = JSON.parse(message);

        // SUBSCRIBE

        if (parsedMessage.method === SUBSCRIBE) {
          parsedMessage.params.forEach((subscription) => {
            SubscriptionManager.getInstance().subscribe(this.id, subscription);
          });
        }

        // UNSUBSCRIBE

        if (parsedMessage.method === UNSUBSCRIBE) {
          parsedMessage.params.forEach((subscription) => {
            SubscriptionManager.getInstance().unsubscribe(
              this.id,
              subscription,
            );
          });
        }
      } catch (e) {
        console.log("Invalid WS message:", e);
      }
    });
  }
}
