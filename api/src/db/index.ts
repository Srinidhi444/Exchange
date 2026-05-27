import { Client } from "pg";
import "dotenv/config";

export const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

export async function connectDB() {
  await client.connect();
  console.log("Connected to Postgres");
}