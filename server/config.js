// config.js
import { config } from 'dotenv';

// config from dotenv will take up PORT and MongoDBURL from .env and put that into process.env here
config();


export const MongoDBURL = process.env.MongoDBURL || 'your_default_mongodb_url_here';
// xample: mongodb+srv://harshitsrautela:roots@cluster0.w658fhn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0