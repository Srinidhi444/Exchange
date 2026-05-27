import {Router} from "express";
import jwt from "jsonwebtoken"
import bcrypt, { hash } from "bcrypt";
import { client } from "../db";
export const authroutes=Router();
authroutes.post("/signup",async(req,res)=>{
    try{
        const {email,password}=req.body;
    const exsistingUser=await client.query(`
        SELECT * FROM USERS
        WHERE email=$1
    `[email]);
    if(exsistingUser.rows.length>0){
        return res.status(400).json({
            message:"User Already Exsits"
        })
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const result=await client.query(    
        `
        INSERT INTO users(email,password)
        VALUES($1,$2)
        RETURNING Id
        `,
        [email,hashedPassword]
    );
    const userId=result.rows[0].id;
    await client.query(`
        INSERT INTO balances(user_id,asset,available,locked)
        VALUES($1,'BTC',10,0),
        ($1,'USDT',100000,0)
        `,
    [userId]);
    

    const token=jwt.sign({
        userId,
    },
     process.env.JWT_SECRET as string
    )
    return res.json({
        token
    })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
    
})

authroutes.post('/signin',async(req,res)=>{
    try{
         const {email,password}=req.body;
         const result=await client.query(`
            SELECT * FROM users
            WHERE email=$1
            `,
            [email]
        )

        if(result.rows.length==0){
            return res.status(400).json({
                message:"Invalid Credentials"
            })
        }

        const user=result.rows[0];
        const matched=bcrypt.compare(
            password,
            user.password
        );
        if (!matched) {
        return res.status(400).json({
            message: "Invalid credentials",
        });
        }
        const userId=user.id;
        const token=jwt.sign({
            userId
        },
        process.env.JWT_SECRET as string
        );
        return res.json({
            token
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message:"Internal server error"
        })
    }

})