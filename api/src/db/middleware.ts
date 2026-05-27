import {Request,Response,NextFunction} from "express";
import jwt from "jsonwebtoken"
export interface AuthRequest extends Request {
  userId?: string;
}
import "dotenv/config"

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req:AuthRequest,res:Response,next:NextFunction){
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({
                message:"Authorization headers missing"
            })
        }
        const token=authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({
                message:"Token is missing"
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET as string) as {userId:string};
        req.userId = decoded.userId;
        next();
    }catch(err){
        return res.status(401).json({
            message: "Invalid token",
            });
    }
}