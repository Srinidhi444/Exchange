import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("Unexpected PG Pool Error", err);
});

export async function connectDB() {
  try {
    await pool.query("SELECT 1");
    console.log("Engine Worker connected to Postgres DB");
  } catch (err) {
    console.error("DB CONNECTION ERROR", err);
  }
}