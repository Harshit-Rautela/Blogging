import express from "express";
import { Blog } from "../models/Model.js";
import auth from "../middleware/Auth.js";
import { upload } from "../middleware/FileAuth.js";
// import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";

const router = express.Router();

// Create a new blog

router.post("/", auth, upload.single("file"), async (req, res) => {
  let uploadedPublicId = "";

  try {
    const { title, content } = req.body;

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.buffer);

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
      uploadedPublicId = imagePublicId;
    }

    const newBlog = new Blog({
      title,
      content,
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
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update a blog by ID

router.put("/:id", auth, upload.single("file"), async (req, res) => {
  let newImagePublicId = "";

  try {
    const { id } = req.params;
    const { title, content } = req.body;

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
      blog.title = title;
    }

    if (content !== undefined) {
      blog.content = content;
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

    // Delete the blog's image from Cloudinary, if one exists.
    if (blog.imagePublicId) {
      try {
        await deleteFromCloudinary(blog.imagePublicId);
      } catch {
        return res.status(500).json({
          msg: "Could not delete the blog image. Blog was not deleted.",
        });
      }
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      msg: "Blog and associated image deleted successfully",
    });
  } catch {
    return res.status(500).json({
      msg: "Cannot delete blog.",
    });
  }
});


export default router;
