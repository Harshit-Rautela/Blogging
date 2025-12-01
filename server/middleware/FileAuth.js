// multer.js
import multer from "multer";

// Vercel does NOT allow saving to disk. So memoryStorage MUST be used.
const storage = multer.memoryStorage();

export const upload = multer({ storage });
