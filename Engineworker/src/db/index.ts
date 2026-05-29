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

export async function connectDB(engine: any) {
  try {
    await pool.query("SELECT 1");

    console.log("Engine Worker connected to Postgres DB");

    const result = await pool.query(`
      SELECT
        user_id,
        asset,
        available,
        locked
      FROM balances
    `);

    result.rows.forEach((row) => {
      const userId = row.user_id;

      if (!engine.userBalances.has(userId)) {
        engine.userBalances.set(userId, {});
      }

      const balances = engine.userBalances.get(userId);

      balances[row.asset] = {
        available: Number(row.available),
        locked: Number(row.locked),
      };
    });

    console.log("Balances loaded into memory");

  } catch (err) {
    console.error("DB CONNECTION ERROR", err);
  }
}