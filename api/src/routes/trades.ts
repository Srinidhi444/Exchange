import { Router } from "express";
import { client } from "../db";

export const tradesRouter = Router();

tradesRouter.get("/", async (req, res) => {
    try {
        const { market } = req.query;

        if (!market) {
            return res.status(400).json({
                message: "Market is required"
            });
        }

        const result = await client.query(
            `
            SELECT 
                id,
                market,
                price,
                quantity,
                quote_quantity,
                is_buyer_maker,
                created_at
            FROM trades
            WHERE market = $1
            ORDER BY created_at DESC
            LIMIT 50
            `,
            [market]
        );

        res.json({
            trades: result.rows
        });

    } catch (e) {
        console.error(e);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});