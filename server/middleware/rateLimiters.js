
import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

if (!process.env.UPSTASH_REDIS_URL) {
    throw new Error("UPSTASH_REDIS_URL is not configured.");
}
const redisClient = new Redis(
    process.env.UPSTASH_REDIS_URL,
    {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true,
        tls: {},
    }
);
redisClient.on("error", () => {
    // Prevent unhandled Redis error-event warnings.
});

const createStore = (prefix) => {
    return new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix,
    });
};

// General API rate limiter: 200 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createStore("rl:api:"),
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

// Login rate limiter: 10 failed attempts per 15 minutes
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createStore("rl:login:"),
    skipSuccessfulRequests: true,
    message: {
        success: false,
        msg: "Too many login attempts. Please try again after 15 minutes.",
    },
});

// Registration rate limiter: 5 attempts per hour
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createStore("rl:register:"),
    message: {
        success: false,
        msg: "Too many registration attempts. Please try again after an hour.",
    },
});
