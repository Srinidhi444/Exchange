import { WebSocket } from "ws";
import { User } from "../User";
import { SubscriptionManager } from "./SubscriptionManager";

export class UserManager {

    private static instance: UserManager;

    private users: Map<string, User> = new Map();

    private constructor() {}

    public static getInstance() {

        if (!this.instance) {
            this.instance = new UserManager();
        }

        return this.instance;
    }

    public addUser(ws: WebSocket) {

        const socketId = crypto.randomUUID();

        const user = new User(socketId, ws);

        this.users.set(socketId, user);

        this.registerOnClose(ws, socketId);

        console.log(`User Connected with ${socketId}`);

        return user;
    }

    public getUser(id: string) {
        return this.users.get(id);
    }

    registerOnClose(
        ws: WebSocket,
        id: string
    ) {
        ws.on("close", () => {

            console.log("User Disconnected with id", id);

            this.users.delete(id);

            SubscriptionManager
                .getInstance()
                .userLeft(id);
        });
    }
}