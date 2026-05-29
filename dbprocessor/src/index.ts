import { Client } from "pg";
import Redis from "ioredis";
import "dotenv/config";

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

client
  .connect()
  .then(() => {
    console.log("Connected to Postgres DB");
  })
  .catch((err) => {
    console.error("Error connecting to Postgres DB", err);
  });

async function main() {
  const redisClient = new Redis();
  console.log("Connected to Redis");

  while (true) {
    try {
      const res = await redisClient.blpop("db", 0);
      if (!res) continue;

      const message = JSON.parse(res[1]);
      console.log("DB Worker received message:", message.type);

      if (message.type === "TRADE_CREATED") {
  const trade = message.data;

  await client.query(
    `
    INSERT INTO trades (
      market,
      buyer_user_id,
      seller_user_id,
      price,
      quantity,
      quote_quantity,
      is_buyer_maker,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      trade.market,
      trade.buyerUserId,
      trade.sellerUserId,
      trade.price,
      trade.quantity,
      trade.quoteQuantity,
      trade.isBuyerMaker,
      new Date(trade.timestamp),
    ],
  );

  console.log("Trade inserted successfully");
} else if (message.type === "ORDER_UPDATED") {
        const order = message.data;

        await client.query(
          `
          UPDATE trade_orders
          SET filled_quantity  = filled_quantity + $1,
              remaining_quantity = remaining_quantity - $1,
              status = CASE
                WHEN remaining_quantity - $1 = 0 THEN 'FILLED'
                ELSE 'PARTIALLY_FILLED'
              END,
              updated_at = NOW()
          WHERE id = $2
          `,
          [order.executedQty, order.orderId],
        );

        console.log("Order updated successfully");
      } else if (message.type === "ORDER_CREATED") {
        const order = message.data;

        await client.query(
          `
          INSERT INTO trade_orders (
            id,
            user_id,
            market,
            side,
            type,
            price,
            quantity,
            filled_quantity,
            remaining_quantity,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `,
          [
            order.orderId,
            order.userId,
            order.market,
            order.side,
            order.kind,
            order.price,
            order.quantity,
            0,
            order.remainingQuantity,
            "OPEN",
          ],
        );

        console.log("Order created successfully");
      } else if (message.type === "ORDER_CANCELLED") {
        const order = message.data;

        await client.query(
          `
          UPDATE trade_orders
          SET remaining_quantity = 0,
              status = 'CANCELLED',
              updated_at = NOW()
          WHERE id = $1
          `,
          [order.orderId],
        );

        console.log("Order cancelled successfully");
      } else if (message.type === "MARKET_TICK_ADDED") {
        const tick = message.data;

        await client.query(
          `
          INSERT INTO market_ticks (
              market,
              price,
              volume,
              created_at
          )
          VALUES ($1, $2, $3, $4)
          `,
          [
              tick.market,
              tick.price,
              tick.volume,
              new Date(tick.createdAt)
          ]
        );

        console.log("Market tick inserted successfully");
      } else if (message.type === "BALANCE_UPDATED") {
  const balance = message.data;

  await client.query(
    `
    UPDATE balances
    SET
      available = $1,
      locked = $2
    WHERE
      user_id = $3
      AND asset = $4
    `,
    [
      balance.available,
      balance.locked,
      balance.userId,
      balance.asset
    ]
  );
}
      else {
        console.warn("Unknown message type:", message.type);
      }
    } catch (err) {
      console.error("DB Worker Error:", err);
    }
  }
}

main();