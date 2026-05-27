import { Client } from "pg";
import "dotenv/config";

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function initializeDB() {
  await client.connect();

  console.log("Connected to Postgres DB");

  // Enable UUID generation
  await client.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);

  // Trades table
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

  // Orders table
  await client.query(`
    CREATE TABLE IF NOT EXISTS trade_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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

  // Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,

      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Balances table
  await client.query(`
    CREATE TABLE IF NOT EXISTS balances (
      id BIGSERIAL PRIMARY KEY,

      user_id UUID NOT NULL,
      asset VARCHAR(20) NOT NULL,

      available NUMERIC(30,10) DEFAULT 0,
      locked NUMERIC(30,10) DEFAULT 0,

      UNIQUE(user_id, asset),

      CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );
  `);

  // Indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_trade_orders_user_id
    ON trade_orders(user_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_balances_user_asset
    ON balances(user_id, asset);
  `);

  console.log("Tables ensured.");

  await client.end();

  console.log("Disconnected from Postgres.");
}

initializeDB();