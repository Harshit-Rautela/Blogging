
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { User } from "../models/Model.js";
import auth from "../middleware/Auth.js";

const router = express.Router();
// Login rate limiter: 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many login attempts. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true,
});

// Registration rate limiter: 5 attempts per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many registration attempts. Please try again after an hour.",
  },
});

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Register a new user
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        msg: "Name, username, email, and password are required.",
      });
    }

    const trimmedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !trimmedName ||
      !normalizedUsername ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        msg: "All fields are required.",
      });
    }

    if (trimmedName.length > 50) {
      return res.status(400).json({
        msg: "Name cannot exceed 50 characters.",
      });
    }

    const usernameRegex = /^[a-z0-9_]{3,20}$/;

    if (!usernameRegex.test(normalizedUsername)) {
      return res.status(400).json({
        msg: "Username must be 3–20 characters and contain only letters, numbers, and underscores.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        msg: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        msg: "Password must be between 8 and 72 characters.",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          msg: "An account with this email already exists.",
        });
      }

      return res.status(409).json({
        msg: "This username is already taken.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      name: trimmedName,
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        msg:
          duplicateField === "username"
            ? "This username is already taken."
            : "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      msg: "Unable to create your account.",
    });
  }
});

// Login — email and password only
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        msg: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        msg: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        msg: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      token,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to log in.",
    });
  }
});

// Get logged-in user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select("-passwordHash -email");

    if (!user) {
      return res.status(404).json({
        msg: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to retrieve your profile.",
    });
  }
});

export default router;
