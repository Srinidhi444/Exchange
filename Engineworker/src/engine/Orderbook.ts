import { Fills, Order } from "../types/Orderbook.types"
export class Orderbook{
    bids:Order[];
    asks:Order[];
    baseAsset:string;
    quoteAsset:string="USDT";
    lastTradeId:number;
    currentPrice:number;

    constructor(baseAsset:string,bids:Order[],asks:Order[],lastTradeId:number,currentPrice:number){
        this.bids=bids;
        this.asks=asks;
        this.baseAsset=baseAsset;
        this.lastTradeId=lastTradeId;
        this.currentPrice=currentPrice;
    } 

    ticker(){
        return `${this.baseAsset}_${this.quoteAsset}`;
    }
    getSnapshot(){
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        }
    }
    addOrder(order:Order){
        if(order.side=="BUY"){
            const result=this.matchBids(order);
            if(!result) return;
            const {executedqty,fills}=result;
            order.filledQuantity=executedqty;
            if(executedqty==order.quantity){
                return {
                    executedqty,
                    fills
                }
            }
            this.bids.push(order);
            return {
                executedqty,
                fills
            }
                
        }else{
            const result=this.mactchAsks(order);
            if(!result) return;
            const {executedqty,fills}=result;
            order.filledQuantity=executedqty;
            if(executedqty==order.quantity){
                return {
                    executedqty,
                    fills
                }
            }
            this.asks.push(order);
            return {
                executedqty,
                fills
            }
        }
    }

    matchBids(order:Order){
        const fills:Fills[]=[];
        let executedqty:number=0;
        this.asks.sort((a,b)=>a.price-b.price);
        for(const ask of this.asks){
            
            if (order.kind === "LIMIT" && Number(order.price) < Number(ask.price)) break;
            if(order.kind=="LIMIT"){
                if(order.price>=ask.price && executedqty<order.quantity){
                    const filledqty=Math.min(order.quantity-executedqty,ask.quantity-ask.filledQuantity);
                    ask.filledQuantity+=filledqty;
                    executedqty+=filledqty;
                    this.lastTradeId++;
                    fills.push({
                        price:ask.price,
                        quantity:filledqty,
                        tradeId:this.lastTradeId,
                        marketOrderId:order.orderId,
                        otheruserId:ask.userId,
                    })
                    
                }
               
             
            }
        }
        this.asks = this.asks.filter(a => a.filledQuantity < a.quantity);

         return { executedqty, fills };
    }
    mactchAsks(order:Order){
        let fills:Fills[]=[];
        let executedqty:number=0;
        this.bids.sort((a,b)=>b.price-a.price);
        for(let i=0;i<this.bids.length;i++){
            
            if(this.bids[i].price>=order.price && executedqty<order.quantity){
                const remainingqty=Math.min(order.quantity-executedqty,this.bids[i].quantity-this.bids[i].filledQuantity);
                this.bids[i].filledQuantity+=remainingqty;
                executedqty+=remainingqty;
                this.lastTradeId++;
                fills.push({
                    price:this.bids[i].price,
                    quantity:remainingqty,
                    tradeId:this.lastTradeId,
                    marketOrderId:order.orderId,
                    otheruserId:this.bids[i].userId,
                })
                
               
            }
        }
        this.bids = this.bids.filter(b => b.filledQuantity < b.quantity);
         return { executedqty, fills };
    }

}