
import { subscriber } from "./RedisManger";
import { UserManager } from "./UserManager";

export class SubscriptionManager{
    private static instance:SubscriptionManager;
    // use Set instead of array for faster lookup (O(1)) and to avoid duplications
    private subscriptions=new Map<string,Set<string>>();
    private reversesubscriptions=new Map<string,Set<string>>();


    private constructor(){
        subscriber.on(
            "message",
            this.redisCallbackHandler
        )
    }
    public static getInstance(){
        if(!this.instance){
            this.instance=new SubscriptionManager();
        }
        return this.instance;
    }

    subscribe(userId:string,subscription:string){
        // user to subscriptions
        if(!this.subscriptions.has(userId)){
            this.subscriptions.set(userId,new Set());
        }
        this.subscriptions.get(userId)?.add(subscription);

        // reverse mapping subsciption to the users
        const ispresentAlready=this.reversesubscriptions.has(subscription);
        if(!ispresentAlready){
            this.reversesubscriptions.set(subscription,new Set());
        }
        this.reversesubscriptions.get(subscription)?.add(userId);
        if(!ispresentAlready){
            subscriber.subscribe(subscription);
        }
    }
    unsubscribe(userId:string,subscription:string){
        this.subscriptions.get(userId)?.delete(subscription);

        const users=this.reversesubscriptions.get(subscription);
        users?.delete(userId);
        // very important only unsubscribe when all users are gone
        if(users?.size==0){
            this.reversesubscriptions.delete(subscription);
            subscriber.unsubscribe(subscription);
        }
    }
    private redisCallbackHandler = (
    channel: string,
    message: string
) => {

    const parsedMessage = JSON.parse(message);

    this.reversesubscriptions
        .get(channel)
        ?.forEach(userId => {

            UserManager
                .getInstance()
                .getUser(userId)
                ?.emit(parsedMessage);

        });
}
    userLeft(userId:string){
        this.subscriptions.get(userId)?.forEach(subscription=>{
            this.unsubscribe(userId,subscription);
        })
        this.subscriptions.delete(userId);
    }
}