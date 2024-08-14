import express from "express";

import { MongoDBURL } from "./config.js";
import Blogrouter from "./routes/Routes.js";
import Userrouter from "./routes/auth.js";
import mongoose from "mongoose";
import { User } from "./models/Model.js";
import cors from "cors";
import env from "dotenv/config.js";
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: 'https://blogging-aahn.vercel.app' 
}));

app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("Welcome To Blogging");
});

app.use("/auth", [Userrouter]);
app.use("/", [Blogrouter]);

mongoose
  .connect(MongoDBURL)
  .then(() => {
    console.log("App connected to MongoDB database");
  })
  .catch((error) => {
    console.log(error);
  });

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});
