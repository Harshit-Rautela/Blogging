import express from "express";
import { Blog } from "../models/Model.js";
import { Comment } from "../models/Comment.js";
import auth from "../middleware/Auth.js";
import { upload } from "../middleware/FileAuth.js";
import mongoose from "mongoose";
// import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";

const router = express.Router();
// Validate MongoDB ObjectIds
const isValidId = (id) => mongoose.isValidObjectId(id);

// Blog field validation
const validateBlogInput = (body, partial = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid request body.";
  }

  const { title, content } = body;

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return "Title is required and must be valid text.";
    }

    if (title.trim().length > 150) {
      return "Title cannot exceed 150 characters.";
    }
  }

  if (!partial || content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      return "Content is required and must be valid text.";
    }

    if (content.trim().length > 50000) {
      return "Content cannot exceed 50000 characters.";
    }
  }

  if (partial && title === undefined && content === undefined) {
    return "At least one field must be provided for an update.";
  }

  return null;
};

// Comment field validation
const validateCommentInput = (body) => {
  if (!body || typeof body.content !== "string") {
    return "Comment must be valid text.";
  }

  const content = body.content.trim();

  if (!content) {
    return "Comment cannot be empty.";
  }

  if (content.length > 1000) {
    return "Comment cannot exceed 1000 characters.";
  }

  return null;
};

// Create a new blog

router.post("/", auth, upload.single("file"), async (req, res) => {
  let uploadedPublicId = "";

  try {

    const { title, content } = req.body;
    const validationError = validateBlogInput(req.body);

    if (validationError) {
      return res.status(400).json({
        msg: validationError,
      });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.buffer);

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
      uploadedPublicId = imagePublicId;
    }

    const newBlog = new Blog({
      title: title.trim(),
      content: content.trim(),
      imageUrl,
      imagePublicId,
      authorId: req.user,
    });

    const savedBlog = await newBlog.save();

    // Upload is now associated with the saved blog.
    uploadedPublicId = "";

    return res.status(201).json(savedBlog);
  } catch (error) {
    // Clean up an uploaded image if saving the blog failed.
    if (uploadedPublicId) {
      await deleteFromCloudinary(uploadedPublicId).catch(() => null);
    }

    return res.status(500).json({
      msg: "Server error while creating blog.",
    });
  }
});

// Get all blogs for the logged-in user

// Get logged-in user's blogs with pagination

router.get("/user", auth, async (req, res) => {
  try {
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        msg: "Invalid pagination parameters.",
      });
    }


    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const tag = String(req.query.tag || "").trim();

    // Sorting
    const sortBy = String(req.query.sortBy || "newest");

    const sortOptionsMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title_asc: { title: 1 },
      title_desc: { title: -1 },
    };

    if (!Object.prototype.hasOwnProperty.call(sortOptionsMap, sortBy)) {
      return res.status(400).json({
        msg: "Invalid sorting option.",
      });
    }

    const sortOptions = sortOptionsMap[sortBy];


    // Escape special regex characters
    const escapeRegex = (value) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Start with the logged-in user's blogs
    const query = {
      authorId: req.user,
    };

    // Search in title and content
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
      ];
    }

    // Category filter (exact match, case-insensitive)
    if (category) {
      query.category = new RegExp(
        `^${escapeRegex(category)}$`,
        "i"
      );
    }

    // Tag filter (exact match, case-insensitive)
    if (tag) {
      query.tags = new RegExp(
        `^${escapeRegex(tag)}$`,
        "i"
      );
    }

    const skip = (page - 1) * limit;

    // Fetch filtered blogs and filtered count
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),

      Blog.countDocuments(query),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalBlogs / limit));

    // Pagination headers
    res.set({
      "X-Current-Page": String(page),
      "X-Page-Limit": String(limit),
      "X-Total-Blogs": String(totalBlogs),
      "X-Total-Pages": String(totalPages),
    });

    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(500).json({
      msg: "Server error",
    });
  }
});

// Get a blog by ID

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found",
      });
    }

    const isOwner = blog.authorId.toString() === req.user;

    // Published blogs can be viewed by other logged-in users.
    // Drafts remain private to their owners.
    if (blog.status !== "published" && !isOwner) {
      return res.status(403).json({
        msg: "You are not allowed to view this blog.",
      });
    }

    return res.status(200).json(blog);
  } catch (error) {
    return res.status(500).json({
      msg: "Could not retrieve blog.",
    });
  }
});


// Update a blog by ID

router.put("/:id", auth, upload.single("file"), async (req, res) => {
  let newImagePublicId = "";

  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }
    let validationError = null;

    if (title !== undefined || content !== undefined) {
      validationError = validateBlogInput(req.body, true);
    }

    if (validationError) {
      return res.status(400).json({
        msg: validationError,
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found",
      });
    }

    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({
        msg: "Unauthorized",
      });
    }

    // Preserve existing image information.
    const oldImagePublicId = blog.imagePublicId;

    // Update text fields only when provided.
    if (title !== undefined) {
      blog.title = title.trim();
    }

    if (content !== undefined) {
      blog.content = content, trim();
    }

    // Upload replacement image if one was provided.
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.buffer);

      newImagePublicId = uploadResult.public_id;

      blog.imageUrl = uploadResult.secure_url;
      blog.imagePublicId = uploadResult.public_id;
    }

    const updatedBlog = await blog.save();

    // The new image is now safely saved in MongoDB.
    newImagePublicId = "";

    // Delete the previous image only after successful saving.
    if (
      req.file &&
      oldImagePublicId &&
      oldImagePublicId !== updatedBlog.imagePublicId
    ) {
      await deleteFromCloudinary(oldImagePublicId).catch(() => null);
    }

    return res.status(200).json(updatedBlog);
  } catch (error) {
    // If the update fails, clean up the newly uploaded image.
    if (newImagePublicId) {
      await deleteFromCloudinary(newImagePublicId).catch(() => null);
    }

    return res.status(500).json({
      msg: "Cannot update blog.",
    });
  }
});


// Delete a blog by ID


router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found.",
      });
    }

    if (blog.authorId.toString() !== req.user) {
      return res.status(403).json({
        msg: "Unauthorized.",
      });
    }

    // Delete the Cloudinary image first, if one exists.
    if (blog.imagePublicId) {
      try {
        await deleteFromCloudinary(blog.imagePublicId);
      } catch {
        return res.status(500).json({
          msg: "Could not delete the blog image. Blog was not deleted.",
        });
      }
    }

    // Delete the blog.
    await Blog.findByIdAndDelete(id);

    // Delete all comments associated with this blog.
    let commentsCleanup = "completed";

    try {
      await Comment.deleteMany({ blogId: id });
    } catch {
      commentsCleanup = "pending";
    }

    return res.status(200).json({
      msg: "Blog deleted successfully.",
      commentsCleanup,
    });
  } catch {
    return res.status(500).json({
      msg: "Could not delete blog.",
    });
  }
});



// ==========================
// LIKE A BLOG
// ==========================

router.post("/:id/like", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found",
      });
    }

    const userId = req.user;

    // Prevent duplicate likes.
    if (blog.likedBy.some((likedUserId) => likedUserId.toString() === userId)) {
      return res.status(400).json({
        msg: "You have already liked this blog.",
      });
    }

    blog.likedBy.push(userId);

    await blog.save();

    return res.status(200).json({
      msg: "Blog liked successfully.",
      likesCount: blog.likedBy.length,
      isLiked: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Could not like blog.",
    });
  }
});


// ==========================
// UNLIKE A BLOG
// ==========================

router.delete("/:id/like", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found",
      });
    }

    const userId = req.user;

    const alreadyLiked = blog.likedBy.some(
      (likedUserId) => likedUserId.toString() === userId
    );

    if (!alreadyLiked) {
      return res.status(400).json({
        msg: "You have not liked this blog.",
      });
    }

    blog.likedBy = blog.likedBy.filter(
      (likedUserId) => likedUserId.toString() !== userId
    );

    await blog.save();

    return res.status(200).json({
      msg: "Blog unliked successfully.",
      likesCount: blog.likedBy.length,
      isLiked: false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Could not unlike blog.",
    });
  }
});


// ==========================
// GET BLOG LIKES
// ==========================

router.get("/:id/likes", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id)
      .select("likedBy")
      .lean();

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found",
      });
    }

    const userId = req.user;

    const isLiked = blog.likedBy.some(
      (likedUserId) => likedUserId.toString() === userId
    );

    return res.status(200).json({
      likesCount: blog.likedBy.length,
      isLiked,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Could not retrieve blog likes.",
    });
  }
});


router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const validationError = validateCommentInput(req.body);

    if (validationError) {
      return res.status(400).json({
        msg: validationError,
      });
    }

    const content = req.body.content.trim();
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found.",
      });
    }

    const isOwner = blog.authorId.toString() === req.user;

    if (blog.status !== "published" && !isOwner) {
      return res.status(403).json({
        msg: "You cannot comment on this blog.",
      });
    }

    if (!content) {
      return res.status(400).json({
        msg: "Comment cannot be empty.",
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        msg: "Comment cannot exceed 1000 characters.",
      });
    }

    const comment = await Comment.create({
      blogId: id,
      userId: req.user,
      content,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name username");

    return res.status(201).json({
      msg: "Comment added successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Could not add comment.",
    });
  }
});


// B. GET COMMENTS FOR A BLOG

router.get("/:id/comments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({
        msg: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id).select("authorId status");

    if (!blog) {
      return res.status(404).json({
        msg: "Blog not found.",
      });
    }

    const isOwner = blog.authorId.toString() === req.user;

    if (blog.status !== "published" && !isOwner) {
      return res.status(403).json({
        msg: "You cannot view comments on this blog.",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        msg: "Invalid pagination parameters.",
      });
    }

    const skip = (page - 1) * limit;

    const [comments, totalComments] = await Promise.all([
      Comment.find({ blogId: id })
        .populate("userId", "name username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Comment.countDocuments({ blogId: id }),
    ]);

    const totalPages = Math.max(
      1,
      Math.ceil(totalComments / limit)
    );

    res.set({
      "X-Current-Page": String(page),
      "X-Page-Limit": String(limit),
      "X-Total-Comments": String(totalComments),
      "X-Total-Pages": String(totalPages),
    });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      msg: "Could not retrieve comments.",
    });
  }
});


// C. EDIT A COMMENT

router.put("/comments/:commentId", auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const validationError = validateCommentInput(req.body);

    if (validationError) {
      return res.status(400).json({
        msg: validationError,
      });
    }

    const content = req.body.content.trim();
    if (!isValidId(commentId)) {
      return res.status(400).json({
        msg: "Invalid comment ID.",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        msg: "Comment not found.",
      });
    }


    // Only the comment's author can edit it.
    if (comment.userId.toString() !== req.user) {
      return res.status(403).json({
        msg: "You are not allowed to edit this comment.",
      });
    }

    if (!content) {
      return res.status(400).json({
        msg: "Comment cannot be empty.",
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        msg: "Comment cannot exceed 1000 characters.",
      });
    }

    comment.content = content;

    const updatedComment = await comment.save();

    const populatedComment = await Comment.findById(updatedComment._id)
      .populate("userId", "name username");

    return res.status(200).json({
      msg: "Comment updated successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Could not update comment.",
    });
  }
});


// D. DELETE A COMMENT

router.delete("/comments/:commentId", auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!isValidId(commentId)) {
      return res.status(400).json({
        msg: "Invalid comment ID.",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        msg: "Comment not found.",
      });
    }

    // Only the comment's author can delete it.
    if (comment.userId.toString() !== req.user) {
      return res.status(403).json({
        msg: "You are not allowed to delete this comment.",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      msg: "Comment deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Could not delete comment.",
    });
  }
});


export default router;
