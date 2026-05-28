import {Router} from "express";
import RedisClient from "../configs/RedisClient";

export const depthrouter=Router();
const redis = RedisClient.getInstance();
depthrouter.get("/",async(req,res)=>{
    const {symbol}=req.query;
    const response:any=await redis.sendAndawait({
        type:"GET_DEPTH",
        data:{
            market: symbol as string
        }
    })
    res.json(response.payload);
})