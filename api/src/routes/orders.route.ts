import { Router } from "express";
import RedisClient from "../configs/RedisClient";
import {
  CANCEL_ORDER,
  CREATE_ORDER,
  GET_OPEN_ORDERS,
} from "../types/types";
import { authMiddleware } from "../middleware/middleware";

export const ordersRouter = Router();

const redis = RedisClient.getInstance();

ordersRouter.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { market, side, kind, price, quantity } = req.body;

    if (!market || !side || !kind || !quantity) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const response: any = await redis.sendAndawait({
      type: CREATE_ORDER,
      data: {
        market,
        side,
        kind,
        price: price ?? null,
        quantity,
        userId: req.userId,
        timestamp: Date.now(),
      },
    });

    console.log("this is the response of execution", response);

    res.json(response.payload);
  } catch (err) {
    console.error("Create order error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

ordersRouter.get("/open", authMiddleware, async (req: any, res) => {
  try {
    const response: any = await redis.sendAndawait({
      type: GET_OPEN_ORDERS,
      data: {
        userId: req.userId,
        market: req.query.market,
      },
    });

    res.json(response.payload);
  } catch (err) {
    console.error("Get open orders error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

ordersRouter.delete("/:orderId", authMiddleware, async (req: any, res) => {
  try {
    const response: any = await redis.sendAndawait({
      type: CANCEL_ORDER,
      data: {
        orderId: req.params.orderId,
        market: req.body.market,
        userId: req.userId,
      },
    });

    res.json(response.payload);
  } catch (err) {
    console.error("Cancel order error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});