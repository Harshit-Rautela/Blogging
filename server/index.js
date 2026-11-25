
import "dotenv/config";

import mongoose from "mongoose";
import { MongoDBURL } from "./config.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(MongoDBURL);

    app.listen(PORT);
  } catch (error) {
    process.exit(1);
  }
};

startServer();
