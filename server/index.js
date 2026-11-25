
import "dotenv/config";

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { fileURLToPath } from "url";

import { MongoDBURL } from "./config.js";
import Blogrouter from "./routes/Routes.js";
import Userrouter from "./routes/auth.js";
import UserDiscoveryRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const allowedOrigins = [
  "https://blogging-aahn.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    exposedHeaders: [
      "X-Current-Page",
      "X-Page-Limit",
      "X-Total-Blogs",
      "X-Total-Comments",
      "X-Total-Pages",
    ],
  },
  )
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blogging API is running",
  });
});


// Routes
app.use("/auth", Userrouter);
app.use("/users", UserDiscoveryRouter);
app.use("/", Blogrouter);
// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await mongoose.connect(MongoDBURL);

    console.log("Connected to MongoDB successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
