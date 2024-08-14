import express from 'express';
import path from 'path';
import { MongoDBURL } from './config.js';
import Blogrouter from './routes/Routes.js';
import Userrouter from './routes/auth.js';
import mongoose from 'mongoose';
import { User } from './models/Model.js';
import cors from 'cors';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';


// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://blogging-aahn.vercel.app' 
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get("/", (req, res) => {
  console.log('The request is:', req);
  return res.status(200).send("Welcome To Blogging");
});

app.use("/auth", Userrouter);
app.use("/", Blogrouter);

// Connect to MongoDB
mongoose.connect(MongoDBURL)
  .then(() => {
    console.log("App connected to MongoDB database");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
