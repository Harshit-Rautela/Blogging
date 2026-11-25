
import express from "express";
import mongoose from "mongoose";

import { User, Blog } from "../models/Model.js";
import auth from "../middleware/Auth.js";

const router = express.Router();

// Escape special regex characters in user search input
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Search users by name or username
router.get("/search", auth, async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    if (!search) {
      return res.status(200).json({
        users: [],
        pagination: {
          currentPage: page,
          limit,
          totalUsers: 0,
          totalPages: 0,
        },
      });
    }

    if (search.length > 50) {
      return res.status(400).json({
        msg: "Search query cannot exceed 50 characters.",
      });
    }

    const searchRegex = new RegExp(escapeRegex(search), "i");

    const filter = {
      _id: { $ne: req.user },
      $or: [
        { name: searchRegex },
        { username: searchRegex },
      ],
    };

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("_id name username createdAt")
      .sort({ username: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to search users.",
    });
  }
});

// Get a user's public profile
router.get("/:userId/profile", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        msg: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId)
      .select("_id name username createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({
        msg: "User not found.",
      });
    }

    const publishedBlogsCount = await Blog.countDocuments({
      authorId: userId,
      status: "published",
    });

    return res.status(200).json({
      user: {
        ...user,
        publishedBlogsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to retrieve user profile.",
    });
  }
});

// Get a user's published blogs
router.get("/:userId/blogs", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        msg: "Invalid user ID.",
      });
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        msg: "User not found.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit, 10) || 9)
    );

    const filter = {
      authorId: userId,
      status: "published",
    };

    const totalBlogs = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .select("-imagePublicId")
      .populate("authorId", "name username")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      blogs,
      pagination: {
        currentPage: page,
        limit,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to retrieve user's blogs.",
    });
  }
});

export default router;
