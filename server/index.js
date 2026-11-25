
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

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error("Not allowed by CORS");
    error.status = 403;
    return callback(error);
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
};

app.use(cors(corsOptions));

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
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

// Centralized error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  // CORS errors
  if (err.message === "Not allowed by CORS") {
    statusCode = 403;
    message = "Origin not allowed";
  }

  // Mongoose validation errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  // Invalid MongoDB ObjectId
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // Duplicate MongoDB values
  else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  // Invalid JSON request body
  else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  // Prevent invalid status codes
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // Hide internal error details in production
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await mongoose.connect(MongoDBURL);

    app.listen(PORT);
  } catch (error) {
    process.exit(1);
  }
};

startServer();
