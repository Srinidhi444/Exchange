import { WebSocketServer } from "ws";
import { UserManager } from "./Mangers/UserManager";

const wss = new WebSocketServer({
  port: 8080,
});

console.log("WebSocket Server running on port 8080");

wss.on("connection", (ws) => {

  console.log("Client Connected");

  UserManager
    .getInstance()
    .addUser(ws);

  ws.on("close", () => {
    console.log("Client Disconnected");
  });

});