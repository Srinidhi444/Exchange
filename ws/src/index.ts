import {WebSocketServer} from "ws";
const wss=new WebSocketServer({port:8080});

wss.on("connection",(ws)=>{
    console.log("Client Connected");
    ws.on("message",(message)=>{
        console.log(message.toString());
    })
    ws.on("close",()=>{
        console.log("Client Disconnected");
    })
})