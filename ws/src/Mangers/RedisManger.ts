import Redis from "ioredis";
import "dotenv/config";

export const publisher = new Redis(
  process.env.REDIS_URL as string
);

export const subscriber = new Redis(
  process.env.REDIS_URL as string
);

publisher.on("connect", () => {
  console.log("Redis Publisher Connected");
});

subscriber.on("connect", () => {
  console.log("Redis Subscriber Connected");
});

publisher.on("error", (err) => {
  console.log("Redis Publisher Error:", err);
});

subscriber.on("error", (err) => {
  console.log("Redis Subscriber Error:", err);
});