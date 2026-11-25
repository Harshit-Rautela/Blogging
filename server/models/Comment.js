
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Retrieve comments belonging to a blog, newest first.
CommentSchema.index({ blogId: 1, createdAt: -1 });

// Retrieve comments written by a particular user.
CommentSchema.index({ userId: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", CommentSchema);
