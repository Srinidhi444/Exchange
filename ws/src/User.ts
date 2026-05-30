import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/incoming";

import { SubscriptionManager } from "./Mangers/SubscriptionManager";

export class User {
  private id: string;

  private ws: WebSocket;

  private authenticatedUserId?: string;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;

    this.addListeners();
  }

  emit(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  private addListeners() {
    this.ws.on("message", (message) => {
      try {
        const parsedMessage: IncomingMessage = JSON.parse(message.toString());

        // SUBSCRIBE

        if (parsedMessage.method === SUBSCRIBE) {
          // optional auth

          if (parsedMessage.token) {
            const decoded = jwt.verify(
              parsedMessage.token,
              process.env.JWT_SECRET!,
            ) as any;

            this.authenticatedUserId = decoded.userId;
          }

          parsedMessage.params.forEach((subscription) => {
            let finalSubscription = subscription;

            // private streams

            if (
              subscription === "balances" ||
              subscription === "orders" ||
              subscription === "trades"
            ) {
              if (!this.authenticatedUserId) {
                this.emit({
                  error: "Authentication required",
                });

                return;
              }

              finalSubscription = `${subscription}@${this.authenticatedUserId}`;
            }

            SubscriptionManager.getInstance().subscribe(
              this.id,
              finalSubscription,
            );
          });

          this.emit({
            message: "Subscribed successfully",
          });
        }

        // UNSUBSCRIBE

        if (parsedMessage.method === UNSUBSCRIBE) {
          parsedMessage.params.forEach((subscription) => {
            let finalSubscription = subscription;

            if (
              subscription === "balances" ||
              subscription === "orders" ||
              subscription === "trades"
            ) {
              if (!this.authenticatedUserId) {
                return;
              }

              finalSubscription = `${subscription}@${this.authenticatedUserId}`;
            }

            SubscriptionManager.getInstance().unsubscribe(
              this.id,
              finalSubscription,
            );
          });
        }
      } catch (e) {
        console.log("Invalid WS message:", e);

        this.emit({
          error: "Invalid WS message",
        });
      }
    });
  }
}
