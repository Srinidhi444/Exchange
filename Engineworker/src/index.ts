import Redis from "ioredis";
import Engine from "./engine/Engine";
import { connectDB } from "./db";
async function main(){
    const engine=new Engine();
    await connectDB(engine);
    const client=new Redis();
   
    while(1){
        const result=await client.brpop("message",0);
        if(!result){
            console.log("No messages found");
        }else{
              const [, response] = result;
            const parsed=JSON.parse(response);
            console.log("This is the response we got",parsed);
            await engine.processOrders({
                message:parsed.message,
                clientId:parsed.clientId
            });
        }
    }
}
main();