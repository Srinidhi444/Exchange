import Redis from "ioredis";
import Engine from "./engine/Engine";

async function main(){
    const engine=new Engine();
    const client=new Redis();
   
    while(1){
        const result=await client.brpop("message",0);
        if(!result){
            console.log("No messages found");
        }else{
              const [, response] = result;
            const parsed=JSON.parse(response);
            console.log("This is the response we got",parsed);
            engine.processOrders({
                message:parsed.message,
                clientId:parsed.clientId
            });
        }
    }
}
main();