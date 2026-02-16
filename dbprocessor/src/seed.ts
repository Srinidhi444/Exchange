import { Client } from "pg";
import "dotenv/config";

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function initializeDB() {
  await client.connect();
  console.log("Connected to Postgres DB");

  await client.query(`
    CREATE TABLE IF NOT EXISTS trades (
      id BIGSERIAL PRIMARY KEY,
      market VARCHAR(20) NOT NULL,
      price NUMERIC(30,10) NOT NULL,
      quantity NUMERIC(30,10) NOT NULL,
      quote_quantity NUMERIC(30,10) NOT NULL,
      is_buyer_maker BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trade_orders (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,

      market VARCHAR(20) NOT NULL,
      side VARCHAR(4) NOT NULL,
      type VARCHAR(10) NOT NULL,

      price NUMERIC(30,10),
      quantity NUMERIC(30,10) NOT NULL,

      filled_quantity NUMERIC(30,10) DEFAULT 0,
      remaining_quantity NUMERIC(30,10) NOT NULL,

      status VARCHAR(20) NOT NULL,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
   await client.end(); 
  console.log("Tables ensured. Exiting.");
}

initializeDB();
