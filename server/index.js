import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { MongoDBURL } from "./config.js";
import Blogrouter from "./routes/Routes.js";
import Userrouter from "./routes/auth.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://blogging-aahn.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

app.options("*", cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome To Blogging" });
});

app.use("/auth", Userrouter);
app.use("/", Blogrouter);

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MongoDBURL);
  isConnected = true;
}

connectDB();

export default app;
