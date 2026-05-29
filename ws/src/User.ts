import { WebSocket } from "ws";

export class User {
  private id: string;
  private wss: WebSocket;

  constructor(id: string, wss: WebSocket) {
    this.id = id;
    this.wss = wss;
  }

  emit(message: any) {
    this.wss.send(JSON.stringify(message));
  }

  getId() {
    return this.id;
  }
}