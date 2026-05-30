import express from "express"
import { ordersRouter } from "./routes/orders.route"
import { authroutes } from "./routes/auth";
import { depthrouter } from "./routes/depth";
import { tradesRouter } from "./routes/trades";
import { connectDB } from "./db";
import { klinesRouter } from "./routes/klines";
import { balancesrouter } from "./routes/balance";
import tickerrouter from "./routes/ticker";
import cors from "cors";
const app=express();
app.use(cors())
app.use(express.json());
const PORT=process.env.PORT || 3000;
app.use("/api/v1/orders",ordersRouter);
app.use("/api/v1/auth",authroutes);
app.use("/api/v1/depth",depthrouter)
app.use("/api/v1/trades",tradesRouter);
app.use("/api/v1/klines",klinesRouter);
app.use("/api/v1/balances",balancesrouter);
app.use("/api/v1/ticker",tickerrouter);
async function startServer(){
    await connectDB();

    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    }
);
}

startServer();
