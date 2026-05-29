import RedisManager from "../RedisManager";
import fs from "fs";
import { Orderbook } from "./Orderbook";
import { Fills, KIND, Order, SIDE } from "../types/Orderbook.types";
import { v4 as uuidv4 } from "uuid";
import {getOpenOrders} from "../db/query";
export const BASE_CURRENCY = "BTC";

interface UserBalance {
  [key: string]: {
    available: number;
    locked: number;
  };
}

class Engine {
  private orderbooks: Orderbook[] = [];
  private userBalances: Map<string, UserBalance> = new Map();

  constructor() {
    let snapshot = null;

    try {
      if (process.env.WITH_SNAPSHOT) {
        snapshot = fs.readFileSync("./snapshot.json", "utf-8");
      }
    } catch (e) {
      console.log("No shapshot found", e);
    }

    if (snapshot) {
      const data = JSON.parse(snapshot.toString());

      this.orderbooks = data.orderbooks.map(
        (o: any) =>
          new Orderbook(
            o.baseAsset,
            o.bids,
            o.asks,
            o.lastTradeId,
            o.currentPrice,
          ),
      );

      this.userBalances = new Map(data.userBalances);
    } else {
      this.orderbooks = [new Orderbook("BTC", [], [], 0, 0)];
      this.setBaseBalances();
    }

    setInterval(() => {
      this.saveSnapshot();
    }, 1000 * 3);
  }

  saveSnapshot() {
    console.log("SNAPSHOT SAVED", Date.now());

    const snap = {
      orderbooks: this.orderbooks.map((o) => o.getSnapshot()),
      userBalances: Array.from(this.userBalances.entries()),
    };

    fs.writeFileSync("./snapshot.json", JSON.stringify(snap));
  }

 async processOrders({ message, clientId }: { message: any; clientId: string }) {
    const typeOfOrder = message.type.toUpperCase();

    console.log("this is the message", message);

    switch (typeOfOrder) {
      case "CREATE_ORDER":
        try {
          const { executedQty, fills, orderId } = this.createOrder(
            message.data.market,
            message.data.side,
            message.data.kind,
            message.data.price,
            message.data.quantity,
            message.data.userId,
          );

          const redis = RedisManager.getInstance();

          redis.sendToApi(clientId, {
            type: "ORDER_PLACED",
            payload: {
              orderId,
              executedQty,
              fills,
            },
          });
        } catch (err) {
          console.error("Create order error:", err);
        }

        break;

      case "CANCEL_ORDER":
        try {
          const { orderId, market, userId } = message.data;

          const cancelledOrder = this.cancelOrder(orderId, market, userId);

          const redis = RedisManager.getInstance();

          redis.sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: cancelledOrder,
          });
          RedisManager.getInstance().pushMessageToDB({
            type: "ORDER_CANCELLED",
            data: cancelledOrder,
          });
        } catch (err) {
          console.error("Error in cancelling order", err);
        }

        break;

      case "GET_ORDERS":
        console.log("Entered here")
        try{
            const {userId,market}=message.data;
            const orderbook=this.orderbooks.find((o)=>o.ticker()==market);
            if(!orderbook){
                throw new Error("No OrderBook found");
            }
            const orders= await getOpenOrders(userId,market);
            console.log("this is the orders",orders);
            const formattedOrders=orders.map((order)=>({
                orderId: order.id,
                market: order.market,
                side: order.side,
                type: order.type,

                price: Number(order.price),

                quantity: Number(order.quantity),

                filledQuantity: Number(
                order.filled_quantity
                ),

                remainingQuantity: Number(
                order.remaining_quantity
                ),

                status: order.status,

                createdAt: order.created_at
            })
        );
            const redis=RedisManager.getInstance();
            redis.sendToApi(clientId,{
                type:"OPEN_ORDERS",
                payload:formattedOrders
            });
        }catch(error){
            console.error("error while getting open orders");
        }
        break;

      case "GET_DEPTH":
        try {

            const market = message.data.market;

            const orderbook = this.orderbooks.find(
            (o) => o.ticker() === market
            );

            if (!orderbook) {
            throw new Error("No Orderbook found");
            }

            const redis = RedisManager.getInstance();

            redis.sendToApi(clientId, {
            type: "DEPTH",
            payload: orderbook.getDepth(),
            });

        } catch (error) {

            console.log("GET_DEPTH error", error);

            RedisManager.getInstance().sendToApi(clientId, {
            type: "DEPTH",
            payload: {
                bids: [],
                asks: [],
            },
            });
        }

        break;

    case "USER_CREATED":
        const { userId, balances } = message.data;

    this.userBalances.set(userId, balances);

    console.log("New user added to engine");
    break;
     }
  }

  checklockfunds(
    userId: string,
    baseAsset: string,
    quoteAsset: string,
    side: SIDE,
    price: number,
    quantity: number,
  ) {
    const userbalance = this.userBalances.get(userId);

    if (side == "BUY") {
      const cost = price * quantity;

      if (userbalance![quoteAsset].available < cost) {
        throw new Error("Insufficient Funds");
      }

      userbalance![quoteAsset].available -= cost;
      userbalance![quoteAsset].locked += cost;
      this.persistBalance(userId, quoteAsset);
    } else {
      if (userbalance![baseAsset].available < quantity) {
        throw new Error("Insufficient Funds");
      }

      userbalance![baseAsset].available -= quantity;
      userbalance![baseAsset].locked += quantity;
      this.persistBalance(userId, baseAsset);
    }
  }

  createOrder(
    market: string,
    side: SIDE,
    kind: string,
    price: number,
    quantity: number,
    userId: string,
  ) {
    const [baseAsset, quoteAsset] = market.split("_");

    this.checklockfunds(userId, baseAsset, quoteAsset, side, price, quantity);

    console.log("ORDERBOOKS:", this.orderbooks.map((o) => o.ticker()));
    console.log("REQUEST MARKET:", market);

    const orderbook = this.orderbooks.find((o) => o.ticker() === market);

    if (!orderbook) {
      throw new Error("Market not found");
    }

    const order: Order = {
      price: Number(price),
      quantity,
      filledQuantity: 0,
      side,
      kind: kind as KIND,
      userId,
      orderId: uuidv4(),
    };

    RedisManager.getInstance().pushMessageToDB({
      type: "ORDER_CREATED",
      data: {
        orderId: order.orderId,
        userId: order.userId,
        market,
        side: order.side,
        kind: order.kind,
        price: order.price,
        quantity: order.quantity,
        remainingQuantity: order.quantity,
        status: "OPEN",
      },
    });

    RedisManager.getInstance().publishMessage(
    `orders@${userId}`,
    {
        stream: `orders@${userId}`,
        data: {
        event: "ORDER_CREATED",
        order
        }
    }
    );

    // @ts-ignore
    const { executedQty, fills } = orderbook.addOrder(order);

    this.updateBalances(userId, baseAsset, quoteAsset, side, fills);
    fills.forEach((fill:any) => {
    RedisManager.getInstance().pushMessageToDB({
        type: "MARKET_TICK_ADDED",
        data: {
        market,
        price: fill.price,
        volume: fill.quantity,
        createdAt: Date.now()
        }
    });
    });
    this.createDBOrder(fills, market, userId,side);

    this.updateDBOrders(order, executedQty, fills, market);
    this.publishWsDepthUpdates(fills,order.price,side,market);
    this.publishWsTrades(fills, userId, market);

    return {
      orderId: order.orderId,
      executedQty,
      fills,
    };
  }

  publishWsDepthUpdates(
    fills: Fills[],
    price: number,
    side: "BUY" | "SELL",
    market: string
) {
    console.log("this is side",side);
    const orderbook = this.orderbooks.find(
        (o) => o.ticker() === market
    );
    console.log("PUBLISH ORDERBOOK INSTANCE", orderbook);

    if (!orderbook) {
        throw new Error("No orderbook found");
    }

    const depth = orderbook.getDepth();

    if (side === "BUY") {

        const updatedAsks = depth.asks.filter(
            x =>
                fills
                    .map(f => f.price.toString())
                    .includes(x[0])
        );

        const updatedBid = depth.bids.find(
            x => Number(x[0]) === price
            );
        console.log(price, typeof price);
        console.log("publish ws depth updates");
        console.log(updatedBid);
        console.log(updatedAsks);
        RedisManager.getInstance().publishMessage(
            `depth@${market}`,
            {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBid ? [updatedBid] : [],
                    e: "depth"
                }
            }
        );
    }

    if (side === "SELL") {

        const updatedBids = depth.bids.filter(
            x =>
                fills
                    .map(f => f.price.toString())
                    .includes(x[0])
        );

        const updatedAsk = depth.asks.find(
            x => Number(x[0]) === price
            );

        console.log("publish ws depth updates");
        console.log(updatedBids);
        console.log(updatedAsk);
        RedisManager.getInstance().publishMessage(
            `depth@${market}`,
            {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsk ? [updatedAsk] : [],
                    b: updatedBids,
                    e: "depth"
                }
            }
        );
    }
}


    publishWsTrades(fills: Fills[],userId:string, market: string) {
    fills.forEach(fill => {
        RedisManager.getInstance().publishMessage(
            `trade@${market}`,
            {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    s: market,
                    p: fill.price.toString(),
                    q: fill.quantity.toString(),
                    m: fill.otheruserId==userId,
                    T: Date.now()
                }
            }
        );
        RedisManager.getInstance().publishMessage(
  `trades@${userId}`,
  {
    stream: `trades@${userId}`,
    data: {
      tradeId: fill.tradeId,
      market,
      price: fill.price,
      quantity: fill.quantity,
      side:
        fill.otheruserId === userId
          ? "SELL"
          : "BUY",
      timestamp: Date.now()
    }
  }
);
RedisManager.getInstance().publishMessage(
  `trades@${fill.otheruserId}`,
  {
    stream: `trades@${fill.otheruserId}`,
    data: {
      tradeId: fill.tradeId,
      market,
      price: fill.price,
      quantity: fill.quantity,
      side:
        fill.otheruserId === userId
          ? "BUY"
          : "SELL",
      timestamp: Date.now()
    }
  }
);
    });
}

 

  cancelOrder(orderId: string, market: string, userId: string) {
    const orderbook = this.orderbooks.find((o) => o.ticker() == market);

    if (!orderbook) {
      throw new Error("No orderbook found for this market");
    }

    const [baseAsset, quoteAsset] = market.split("_");

    const order =
      orderbook.bids.find((bid) => bid.orderId == orderId) ||
      orderbook.asks.find((ask) => ask.orderId == orderId);

    if (!order) {
      throw new Error("No order found in the orderbook");
    }

    if (order.userId != userId) {
      throw new Error("Unauthorized");
    }

    const remainingQuantity = order.quantity - order.filledQuantity;

    let pricelevel: any;

    if (order.side == "BUY") {
      pricelevel = orderbook.cancelBid(order);

      const refund = remainingQuantity * order.price;

      this.userBalances.get(userId)![quoteAsset].available += refund;
      this.userBalances.get(userId)![quoteAsset].locked -= refund;
      this.persistBalance(userId, quoteAsset);
      if (pricelevel) {
        this.sendUpdatedDepthAt(pricelevel.toString(), market);
        }
    } else {
      pricelevel = orderbook.cancelAsk(order);

      const leftQuantity = order.quantity - order.filledQuantity;

    //@ts-ignore
    this.userBalances.get(userId)[baseAsset].available += leftQuantity;

    //@ts-ignore
    this.userBalances.get(userId)[baseAsset].locked -= leftQuantity;

    this.persistBalance(userId, baseAsset);
    if (pricelevel) {
        this.sendUpdatedDepthAt(pricelevel.toString(), market);
    }
    }
    RedisManager.getInstance().publishMessage(
    `orders@${userId}`,
    {
        stream: `orders@${userId}`,
        data: {
        event: "ORDER_CANCELLED",
        orderId
        }
    }
    );
    return {
      orderId: order.orderId,
      executedQty: order.filledQuantity,
      remainingQuantity,
      status: "CANCELLED" as const,
    };
  }

   sendUpdatedDepthAt(price: string, market: string) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth?.bids.filter(x => x[0] === price);
        const updatedAsks = depth?.asks.filter(x => x[0] === price);
        
        RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }

 
  createDBOrder(
  fills: Fills[],
  market: string,
  userId: string,
  side: SIDE
) {
  fills.forEach((fill) => {

    RedisManager.getInstance().pushMessageToDB({
      type: "TRADE_CREATED",
      data: {
        tradeId: fill.tradeId,

        market,

        buyerUserId:
          side === "BUY"
            ? userId
            : fill.otheruserId,

        sellerUserId:
          side === "SELL"
            ? userId
            : fill.otheruserId,

        price: fill.price,

        isBuyerMaker:
          fill.otheruserId === userId,

        quantity: fill.quantity.toString(),

        quoteQuantity:
          (fill.price * fill.quantity).toString(),

        timestamp: Date.now(),
      },
    });

  });
  
}

  updateDBOrders(
    orders: Order,
    executedQty: number,
    fills: Fills[],
    market: string,
  ) {
    const remainingQuantity = orders.quantity - executedQty;
    console.log(
  "UPDATE DB ORDER",
  orders,
  executedQty
);
    RedisManager.getInstance().pushMessageToDB({
      type: "ORDER_UPDATED",
      data: {
        orderId: orders.orderId,
        executedQty,
        remainingQuantity,
        status:
          remainingQuantity === 0
            ? ("FILLED" as const)
            : ("PARTIALLY_FILLED" as const),
      },
    });

    RedisManager.getInstance().publishMessage(
    `orders@${orders.userId}`,
    {
        stream: `orders@${orders.userId}`,
        data: {
        event: "ORDER_UPDATED",
        orderId: orders.orderId,
        executedQty,
        remainingQuantity,
        status:
            remainingQuantity === 0
            ? "FILLED"
            : "PARTIALLY_FILLED"
        }
    }
    );

    fills.forEach((fill) => {
      RedisManager.getInstance().pushMessageToDB({
        type: "ORDER_UPDATED",
        data: {
          orderId: fill.marketOrderId,
          executedQty: fill.quantity,
          remainingQuantity: fill.marketRemainingQuantity,
          status:
            fill.marketRemainingQuantity === 0
              ? ("FILLED" as const)
              : ("PARTIALLY_FILLED" as const),
        },
      });

       RedisManager.getInstance().publishMessage(
    `orders@${fill.otheruserId}`,
    {
      stream: `orders@${fill.otheruserId}`,
      data: {
        event: "ORDER_UPDATED",
        orderId: fill.marketOrderId,
        executedQty: fill.quantity,
        remainingQuantity:
          fill.marketRemainingQuantity,
        status:
          fill.marketRemainingQuantity === 0
            ? "FILLED"
            : "PARTIALLY_FILLED"
      }
    }
  );
    });
  }

 updateBalances(
  userId: string,
  baseAsset: string,
  quoteAsset: string,
  side: SIDE,
  fills: Fills[],
) {
  if (side == "BUY") {
    fills.forEach((fill) => {

      this.userBalances.get(fill.otheruserId)![quoteAsset].available +=
        fill.price * fill.quantity;

      this.persistBalance(fill.otheruserId, quoteAsset);

      this.userBalances.get(fill.otheruserId)![baseAsset].locked -=
        fill.quantity;

      this.persistBalance(fill.otheruserId, baseAsset);

      this.userBalances.get(userId)![quoteAsset].locked -=
        fill.price * fill.quantity;

      this.persistBalance(userId, quoteAsset);

      this.userBalances.get(userId)![baseAsset].available +=
        fill.quantity;

      this.persistBalance(userId, baseAsset);
    });

  } else {

    fills.forEach((fill) => {

      this.userBalances.get(fill.otheruserId)![baseAsset].available +=
        fill.quantity;

      this.persistBalance(fill.otheruserId, baseAsset);

      this.userBalances.get(fill.otheruserId)![quoteAsset].locked -=
        fill.price * fill.quantity;

      this.persistBalance(fill.otheruserId, quoteAsset);

      this.userBalances.get(userId)![baseAsset].locked -=
        fill.quantity;

      this.persistBalance(userId, baseAsset);

      this.userBalances.get(userId)![quoteAsset].available +=
        fill.price * fill.quantity;

      this.persistBalance(userId, quoteAsset);
    });
  }
}

  persistBalance(userId: string, asset: string) {
  const balance = this.userBalances.get(userId)?.[asset];

  if (!balance) return;

  RedisManager.getInstance().pushMessageToDB({
    type: "BALANCE_UPDATED",
    data: {
      userId,
      asset,
      available: balance.available,
      locked: balance.locked,
    },
  });
  RedisManager.getInstance().publishMessage(
  `balances@${userId}`,
  {
    stream: `balances@${userId}`,
    data: {
      asset,
      available: balance.available,
      locked: balance.locked
    }
  }
);
}

  setBaseBalances() {
    this.userBalances.set("6f8c7c4e-3c5a-4e4c-9c72-8c9a6d2f7b11", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      USDT: {
        available: 10000000,
        locked: 0,
      },
    });

    this.userBalances.set("b2e4f5a1-91c7-4e7d-8c8f-5f0a2d4b9a33", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      USDT: {
        available: 10000000,
        locked: 0,
      },
    });
  }
}


export default Engine;