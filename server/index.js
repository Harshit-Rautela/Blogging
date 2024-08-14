import express from "express";
import path from "path"; // Import the path module
import { MongoDBURL } from "./config.js";
import Blogrouter from "./routes/Routes.js";
import Userrouter from "./routes/auth.js";
import mongoose from "mongoose";
import { User } from "./models/Model.js";
import cors from "cors";
import env from "dotenv/config.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get("/", (request, response) => {
  console.log('the request is : ', request);
  return response.status(234).send("Welcome To Blogging");
});
app.use("/auth", Userrouter);
app.use("/", Blogrouter);

// Connect to MongoDB
mongoose
  .connect(MongoDBURL)
  .then(() => {
    console.log("App connected to MongoDB database");
  })
  .catch((error) => {
    console.log(error);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});
