
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
  return mongoose.isValidObjectId(id);
};

// Validate pagination parameters
const validatePagination = (query, defaultLimit = 10) => {
  const pageValue = query.page;
  const limitValue = query.limit;

  const page =
    pageValue === undefined ? 1 :
    typeof pageValue === "string" && /^\d+$/.test(pageValue)
      ? Number(pageValue)
      : NaN;

  const limit =
    limitValue === undefined ? defaultLimit :
    typeof limitValue === "string" && /^\d+$/.test(limitValue)
      ? Number(limitValue)
      : NaN;

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 20
  ) {
    return null;
  }

  return { page, limit };
};

// Search users by name or username
router.get("/search", auth, async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (req.query.search !== undefined && typeof req.query.search !== "string") {
      return res.status(400).json({
        msg: "Invalid search query.",
      });
    }

    if (search.length > 50) {
      return res.status(400).json({
        msg: "Search query cannot exceed 50 characters.",
      });
    }

    const pagination = validatePagination(req.query, 10);

    if (!pagination) {
      return res.status(400).json({
        msg: "Invalid pagination parameters.",
      });
    }

    const { page, limit } = pagination;

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

    const pagination = validatePagination(req.query, 9);

    if (!pagination) {
      return res.status(400).json({
        msg: "Invalid pagination parameters.",
      });
    }

    const { page, limit } = pagination;

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        msg: "User not found.",
      });
    }

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
