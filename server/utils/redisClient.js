import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on("error", (err) => {
    console.error(" Redis error is:", err)
})

await redisClient.connect();
export default redisClient;