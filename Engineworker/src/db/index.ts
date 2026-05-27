import {Client} from "pg";
import "dotenv/config";

export const pgClient=new Client({
    connectionString: process.env.POSTGRES_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  connectionTimeoutMillis: 300000,
})

export async function ConnectDB(){
    try{
        await pgClient.connect();
        console.log("Engine Worker Conencted to the postgres DB");
    }catch(err){
        console.error("DB CONNECTION ERROR",err);
    }
}