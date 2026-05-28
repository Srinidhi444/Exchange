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
                price,
                quantity,
                "isBuyerMaker",
                "timestamp"
            FROM trades
            WHERE market = $1
            ORDER BY "timestamp" DESC
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