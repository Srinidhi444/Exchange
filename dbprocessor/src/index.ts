
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
      console.log(
  "ORDER UPDATED MESSAGE:",
  message.data
);
      if (message.type === "TRADE_CREATED") {
        const trade = message.data;

        await client.query(
          `
        INSERT INTO trades (
          market,
          price,
          quantity,
          quote_quantity,
          is_buyer_maker,
          created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6)
      `,
          [
            trade.market,
            trade.price,
            trade.quantity,
            trade.quoteQuantity,
            trade.isBuyerMaker,
            trade.timestamp,
          ],
        );
        console.log("inserted in db successfully");
      } else if (message.type === "ORDER_UPDATED") {
         const order = message.data;

    await client.query(`
        UPDATE trade_orders
        SET filled_quantity = filled_quantity + $1,
            remaining_quantity = remaining_quantity - $1,
            status = CASE
              WHEN remaining_quantity - $1 = 0 THEN 'FILLED'
              ELSE 'PARTIALLY_FILLED'
            END,
            updated_at = NOW()
        WHERE id = $2
    `, [
        order.executedQty,
        order.orderId
    ]);
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
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
      } else if (message.type === "ORDER_CANCELLED") {
        const order = message.data;

        await client.query(
          `
    UPDATE trade_orders
    SET
      remaining_quantity = 0,
      status = 'CANCELLED',
      updated_at = NOW()
    WHERE id = $1
  `,
          [order.orderId],
        );
      }
    } catch (err) {
      console.error("DB Worker Error:", err);
    }
  }
}
main();
