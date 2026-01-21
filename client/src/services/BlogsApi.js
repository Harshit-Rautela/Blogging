import express from "express";
import { Blog } from "../models/Model.js";
import auth from "../middleware/Auth.js";
import { upload } from "../middleware/FileAuth.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const router = express.Router();

// Create a new blog
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    const { title, content } = req.body;
    let fileUrl = "";

    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.buffer);
      fileUrl = uploadResult.secure_url;
    }

    const newBlog = new Blog({
      title,
      content,
      imageUrl: fileUrl,
      authorId: req.user,
    });

    const savedBlog = await newBlog.save();
    return res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error Saving Blog:", error);
    return res.status(500).send("Server error");
  }
});

// Get all blogs for the logged-in user
router.get("/user", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user });
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
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
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.updatedAt = Date.now();

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Cannot update blog." });
  }
});

// Delete a blog by ID
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    await Blog.findByIdAndDelete(id);
    res.json({ msg: "Blog deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Cannot delete blog." });
  }
});

export default router;
