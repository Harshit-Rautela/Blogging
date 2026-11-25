
import mongoose from "mongoose";

// ==========================
// USER SCHEMA
// ==========================

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },

    passwordHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);


// ==========================
// BLOG SCHEMA
// ==========================

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"]
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"]
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Cloudinary image information
    imageUrl: {
      type: String,
      default: "",
      trim: true
    },

    imagePublicId: {
      type: String,
      default: "",
      trim: true
    },

    // Blog publishing status
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    },

    // Blog categorization
    category: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 50
    },

    tags: {
      type: [String],
      default: []
    },

    // Estimated reading time in minutes
    readingTime: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);


// ==========================
// INDEXES
// ==========================

// Efficiently retrieve a user's blogs, newest first
BlogSchema.index({
  authorId: 1,
  createdAt: -1
});

// Efficiently retrieve published blogs
BlogSchema.index({
  status: 1,
  createdAt: -1
});

// Efficient category filtering
BlogSchema.index({
  category: 1,
  status: 1
});

// Efficient tag filtering
BlogSchema.index({
  tags: 1
});


// ==========================
// MODELS
// ==========================

export const User = mongoose.model("User", UserSchema);

export const Blog = mongoose.model("Blog", BlogSchema);
