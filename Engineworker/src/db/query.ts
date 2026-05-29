import {pool } from "./index";

export async function getOpenOrders(
  userId: string,
  market: string
) {

  const result = await pool.query(`
    SELECT *
    FROM trade_orders
    WHERE user_id = $1
    AND market = $2
    AND status IN (
      'OPEN',
      'PARTIALLY_FILLED'
    )
    ORDER BY created_at DESC
  `, [
    userId,
    market
  ]);

  return result.rows;
}