import Redis from "ioredis"
const REDIS_URL="redis://localhost:6379"
import { v4 as uuidv4 } from "uuid";
class RedisClient {
    private client:Redis;
    private publisher:Redis;
    private static instance:RedisClient;

    private constructor(){
        this.client=new Redis(REDIS_URL);
        this.client.on("connect",()=>{
            console.log("Redis is connected");
        })
        this.client.on("error",()=>{
            console.log("Error while connecting redis client");
        })
        this.publisher=new Redis(REDIS_URL);
         this.publisher.on("connect",()=>{
            console.log("publisher is connected");
        })
        this.publisher.on("error",()=>{
            console.log("Error while connecting publisher client");
        })
    }
    public static getInstance(){
        if(!this.instance){
            this.instance=new RedisClient();
        }
        return this.instance;
    }
    public sendMessage(message: any) {
        this.publisher.rpush(
            "message",
            JSON.stringify({
                clientId: null,
                message
            })
        );
    }

    public sendAndawait(message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = this.generateRandomID();

            // Timeout after 10 seconds
            const timeout = setTimeout(() => {
            this.client.unsubscribe(id);
            this.client.off("message", handler);
            reject(new Error("Engine response timeout"));
            }, 10000);

            const handler = (channel: string, msg: string) => {
            if (channel === id) {
                clearTimeout(timeout);
                this.client.unsubscribe(id);
                this.client.off("message", handler);
                resolve(JSON.parse(msg));
            }
            };

            this.client.subscribe(id);
            this.client.on("message", handler);
            this.publisher.rpush("message", JSON.stringify({ clientId: id, message }));
        });
    }
    public generateRandomID(){
        const id=uuidv4();
        return id;
    }
}

export default RedisClient;