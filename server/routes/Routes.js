import express from 'express';
import { Blog } from '../models/Model.js';
import auth from '../middleware/Auth.js';
import fs from 'fs'
import { upload } from '../middleware/FileAuth.js'; // Import the Multer middleware
import { uploadOnCloudinary } from '../utils/Cloudinary.js'; // Import the Cloudinary utility
import redisClient from '../utils/redisClient.js';
const router = express.Router();

// Create a new blog
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, content } = req.body;

    let fileUrl = '';

    // If file exists, upload using buffer
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
    await redisClient.del(`blogs:user:${req.user}`).catch(console.error)
    return res.status(201).json(savedBlog);

  } catch (error) {
    console.error('Error Saving Blog:', error);
    return res.status(500).send('Server error');
  }
});




// Get all blogs for the logged-in user
router.get('/user', auth, async (req, res) => {
  try {
    const cacheKey = `blogs:user:${req.user}`
    const cachedBlogs = await redisClient.get(cacheKey);
    if (cachedBlogs) {
      return res.json(JSON.parse(cachedBlogs));
    }
    const blogs = await Blog.find({ authorId: req.user });
    await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(blogs)
    )
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//Get a blog by ID
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const cacheId = `blog:${id}`
    const cachedBlog = await redisClient.get(cacheId);
    if (cachedBlog) {
      const blog = JSON.parse(cachedBlog);
      if (blog.authorId.toString() != req.user) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      return res.json(blog);
    }
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({ msg: ` Blog is not if User, req.user =${req.user}, authorId=${blog.authorId}` })
    }
    await redisClient.setEx(
      cacheId,
      60,
      JSON.stringify(blog)
    )
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');

  }

})

//Update a blog by ID;
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({ msg: ` Blog is not if User, req.user =${req.user}, authorId=${blog.authorId}` })
    }
    blog.title = title || 'Afdbg';
    blog.content = content || 'sdgfgfdbtgh';
    blog.updatedAt = Date.now();
    const updatedBlog = await blog.save();
    await redisClient.del(`blog:${id}`);
    await redisClient.del(`blogs:user:${req.user}`).catch(console.error);
    res.json(updatedBlog);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Cannot update blog.' })
  }
})


// Delete a blog by ID
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    if (blog.authorId.toString() !== req.user) {
      return res.status(401).json({ msg: 'User is not authorized to delete the blog.' })
    }
    await Blog.findByIdAndDelete(id); // Use findByIdAndDelete to remove the blog
    await redisClient.del(`blog:${id}`);
    await redisClient.del(`blogs:user:${req.user}`).catch(console.error);
    res.json({ msg: 'Blog deleted' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Cannot delete blog.' })

  }
})



export default router;