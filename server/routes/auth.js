
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/Model.js";
import auth from "../middleware/Auth.js";

const router = express.Router();

// Structured logger
const logAuth = (event, details = {}) => {
  const timestamp = new Date().toLocaleString();

  console.log("\n==================================================");
  console.log(`[AUTH] ${event}`);
  console.log(`Time: ${timestamp}`);

  Object.entries(details).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  console.log("==================================================\n");
};

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      logAuth("REGISTRATION FAILED", {
        Reason: "Missing or invalid input types",
      });

      return res.status(400).json({
        msg: "Name, email, and password are required",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password) {
      logAuth("REGISTRATION FAILED", {
        Email: normalizedEmail || "Not provided",
        Reason: "Empty required fields",
      });

      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    if (trimmedName.length > 50) {
      logAuth("REGISTRATION FAILED", {
        Email: normalizedEmail,
        Reason: "Name exceeds 50 characters",
      });

      return res.status(400).json({
        msg: "Name cannot exceed 50 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      logAuth("REGISTRATION FAILED", {
        Email: normalizedEmail,
        Reason: "Invalid email format",
      });

      return res.status(400).json({
        msg: "Please provide a valid email address",
      });
    }

    if (password.length < 8 || password.length > 72) {
      logAuth("REGISTRATION FAILED", {
        Email: normalizedEmail,
        Reason: "Password length validation failed",
      });

      return res.status(400).json({
        msg: "Password must be between 8 and 72 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      logAuth("REGISTRATION FAILED", {
        Email: normalizedEmail,
        Reason: "Email already registered",
      });

      return res.status(409).json({
        msg: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    logAuth("REGISTRATION SUCCESSFUL", {
      Name: user.name,
      Email: user.email,
      UserID: user._id,
      Status: "New account created",
    });

    return res.status(201).json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      logAuth("REGISTRATION FAILED", {
        Reason: "Duplicate email detected by database",
      });

      return res.status(409).json({
        msg: "User already exists",
      });
    }

    logAuth("REGISTRATION ERROR", {
      Error: error.message,
    });

    return res.status(500).json({
      msg: "Server error",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      logAuth("LOGIN FAILED", {
        Email: typeof email === "string" ? email.trim() : "Not provided",
        Reason: "Missing or invalid credentials",
      });

      return res.status(400).json({
        msg: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      logAuth("LOGIN FAILED", {
        Email: normalizedEmail,
        Reason: "Account not found",
      });

      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      logAuth("LOGIN FAILED", {
        Email: normalizedEmail,
        Reason: "Incorrect password",
      });

      return res.status(401).json({
        msg: "Invalid credentials",
      });
    }

    const token = generateToken(user._id.toString());

    logAuth("LOGIN SUCCESSFUL", {
      Name: user.name,
      Email: user.email,
      UserID: user._id,
      Status: "User authenticated",
    });

    return res.json({ token });
  } catch (error) {
    logAuth("LOGIN ERROR", {
      Error: error.message,
    });

    return res.status(500).json({
      msg: "Server error",
    });
  }
});

// Get logged-in user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select("-passwordHash");

    if (!user) {
      logAuth("PROFILE FETCH FAILED", {
        UserID: req.user,
        Reason: "User not found",
      });

      return res.status(404).json({
        msg: "User not found",
      });
    }

    logAuth("PROFILE FETCH SUCCESSFUL", {
      Name: user.name,
      Email: user.email,
      UserID: user._id,
    });

    return res.json(user);
  } catch (error) {
    logAuth("PROFILE FETCH ERROR", {
      UserID: req.user,
      Error: error.message,
    });

    return res.status(500).json({
      msg: "Server error",
    });
  }
});

export default router;
