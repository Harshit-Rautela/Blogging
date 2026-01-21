import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { MongoDBURL } from "./config.js";
import Blogrouter from "./routes/Routes.js";
import Userrouter from "./routes/auth.js";

// Load env
dotenv.config();

const app = express();

// --------------------
// CORS (FIXED)
// --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://blogging-aahn.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") // ✅ allow ALL Vercel preview URLs
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

// Handle preflight
app.options("*", cors());

// --------------------
// Middleware
// --------------------
app.use(express.json());

// --------------------
// Static files
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Routes
// --------------------
app.get("/", (req, res) => {
  res.status(200).send("Welcome To Blogging");
});

app.use("/auth", Userrouter);
app.use("/", Blogrouter);

// --------------------
// MongoDB (SERVERLESS SAFE)
// --------------------
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MongoDBURL);
  isConnected = true;
  console.log("MongoDB connected");
}

connectDB();

// ❌ NO app.listen()
// ✅ EXPORT APP FOR VERCEL
export default app;
