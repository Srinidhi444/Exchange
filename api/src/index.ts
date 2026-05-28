import express from "express"
import { ordersRouter } from "./routes/orders.route"
import { authroutes } from "./routes/auth";
import { depthrouter } from "./routes/depth";
const app=express();
app.use(express.json());
const PORT=process.env.PORT || 3000;

app.use("/api/v1/orders",ordersRouter);
app.use("/api/v1/auth",authroutes);
app.use("/api/v1/depth",depthrouter)
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
}
);