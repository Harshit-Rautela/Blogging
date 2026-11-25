import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaHeart,
  FaRegComment,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import {
  getBlogById,
  getBlogLikes,
  likeBlog,
  unlikeBlog,
  addComment,
  getBlogComments,
  updateComment,
  deleteComment,
} from "../services/BlogsApi";

import BackButton from "./Buttons/BackButton";
import "./component.css";

const COMMENTS_PER_PAGE = 10;

const getCurrentUserId = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      window.atob(normalizedPayload)
    );

    return decoded.userId || null;
  } catch {
    return null;
  }
};

const getCommentUser = (comment) => {
  return comment.userId || {};
};

const getCommentId = (comment) => {
  return comment._id || comment.id;
};

const DetailedBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Likes
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState("");

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [commentPage, setCommentPage] = useState(1);
  const [commentPagination, setCommentPagination] = useState({
    currentPage: 1,
    pageLimit: COMMENTS_PER_PAGE,
    totalComments: 0,
    totalPages: 1,
  });

  // Edit comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentUpdating, setCommentUpdating] = useState(false);
  const [commentDeletingId, setCommentDeletingId] = useState(null);

  const token = localStorage.getItem("token");
  const currentUserId = token ? getCurrentUserId(token) : null;

  // Fetch blog
  useEffect(() => {
    let isActive = true;

    const fetchBlog = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getBlogById(id, token);

        if (isActive) {
          setBlog(result);
        }
      } catch (err) {
        if (!isActive) return;

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.msg ||
            "We couldn't load this story. Please try again."
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      isActive = false;
    };
  }, [id, navigate, token]);

  // Fetch likes
  useEffect(() => {
    let isActive = true;

    const fetchLikes = async () => {
      if (!token) return;

      try {
        const result = await getBlogLikes(id, token);

        if (isActive) {
          setLikesCount(result.likesCount || 0);
          setIsLiked(Boolean(result.isLiked));
        }
      } catch {
        // The article remains usable if likes cannot be loaded.
      }
    };

    fetchLikes();

    return () => {
      isActive = false;
    };
  }, [id, token]);

  // Fetch comments and pagination
  const fetchComments = useCallback(
    async (page = 1) => {
      if (!token) return;

      setCommentsLoading(true);
      setCommentsError("");

      try {
        const result = await getBlogComments(
          id,
          token,
          page,
          COMMENTS_PER_PAGE
        );

        setComments(result.comments || []);
        setCommentPagination(
          result.pagination || {
            currentPage: page,
            pageLimit: COMMENTS_PER_PAGE,
            totalComments: 0,
            totalPages: 1,
          }
        );
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setCommentsError(
          err.response?.data?.msg ||
            "We couldn't load the comments. Please try again."
        );
      } finally {
        setCommentsLoading(false);
      }
    },
    [id, navigate, token]
  );

  useEffect(() => {
    fetchComments(commentPage);
  }, [fetchComments, commentPage]);

  // Like / unlike
  const handleLike = async () => {
    if (likeLoading) return;

    setLikeLoading(true);
    setLikeError("");

    try {
      const result = isLiked
        ? await unlikeBlog(id, token)
        : await likeBlog(id, token);

      setLikesCount(result.likesCount);
      setIsLiked(result.isLiked);
    } catch (err) {
      setLikeError(
        err.response?.data?.msg ||
          "Unable to update your like. Please try again."
      );
    } finally {
      setLikeLoading(false);
    }
  };

  // Add comment
  const handleAddComment = async (event) => {
    event.preventDefault();

    const content = commentContent.trim();

    if (!content) {
      setCommentError("Please write something before posting.");
      return;
    }

    if (content.length > 1000) {
      setCommentError("Comments cannot exceed 1000 characters.");
      return;
    }

    setCommentSubmitting(true);
    setCommentError("");

    try {
      await addComment(id, content, token);

      setCommentContent("");
      setCommentPage(1);

      // Refresh page one so the newest comment appears at the top.
      if (commentPage === 1) {
        await fetchComments(1);
      }
    } catch (err) {
      setCommentError(
        err.response?.data?.msg ||
          "Unable to post your comment. Please try again."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Begin editing
  const handleStartEdit = (comment) => {
    setEditingCommentId(getCommentId(comment));
    setEditingContent(comment.content || "");
    setCommentError("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // Save edited comment
  const handleUpdateComment = async (commentId) => {
    const content = editingContent.trim();

    if (!content) {
      setCommentError("A comment cannot be empty.");
      return;
    }

    if (content.length > 1000) {
      setCommentError("Comments cannot exceed 1000 characters.");
      return;
    }

    setCommentUpdating(true);
    setCommentError("");

    try {
      const result = await updateComment(commentId, content, token);

      setComments((currentComments) =>
        currentComments.map((comment) =>
          getCommentId(comment) === commentId
            ? result.comment
            : comment
        )
      );

      handleCancelEdit();
    } catch (err) {
      setCommentError(
        err.response?.data?.msg ||
          "Unable to update your comment. Please try again."
      );
    } finally {
      setCommentUpdating(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    setCommentDeletingId(commentId);
    setCommentError("");

    try {
      await deleteComment(commentId, token);

      setComments((currentComments) =>
        currentComments.filter(
          (comment) => getCommentId(comment) !== commentId
        )
      );

      setCommentPagination((current) => {
        const nextTotal = Math.max(0, current.totalComments - 1);

        return {
          ...current,
          totalComments: nextTotal,
          totalPages: Math.max(
            1,
            Math.ceil(nextTotal / COMMENTS_PER_PAGE)
          ),
        };
      });

      // If the deleted comment was the only one on this page,
      // move back one page when possible.
      if (comments.length === 1 && commentPage > 1) {
        setCommentPage((current) => current - 1);
      }
    } catch (err) {
      setCommentError(
        err.response?.data?.msg ||
          "Unable to delete this comment. Please try again."
      );
    } finally {
      setCommentDeletingId(null);
    }
  };

  const goToCommentPage = (nextPage) => {
    if (
      nextPage >= 1 &&
      nextPage <= commentPagination.totalPages &&
      nextPage !== commentPage
    ) {
      setCommentPage(nextPage);
    }
  };

  if (loading) {
    return (
      <div className="detailed-loading">
        <div className="detailed-spinner" />
        <p>Preparing your story...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="detailed-loading">
        <p>{error || "This story could not be found."}</p>
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  const publishedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const updatedDate = blog.updatedAt
    ? new Date(blog.updatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="detailed-blog-page">
      <div className="detailed-topbar">
        <div className="detailed-brand">
          Blog<span>Space.</span>
        </div>

        <BackButton />
      </div>

      <main className="detailed-blog-container">
        <header className="detailed-blog-header">
          <div className="detailed-eyebrow">
            <span className="detailed-eyebrow-dot" />
            A STORY WORTH SHARING
          </div>

          <h1>{blog.title}</h1>

          <div className="detailed-blog-meta">
            <div className="detailed-meta-item">
              <div className="meta-icon">◷</div>
              <div>
                <span className="meta-label">PUBLISHED</span>
                <span className="meta-value">{publishedDate}</span>
              </div>
            </div>

            {updatedDate && updatedDate !== publishedDate && (
              <div className="detailed-meta-item">
                <div className="meta-icon">↻</div>
                <div>
                  <span className="meta-label">LAST UPDATED</span>
                  <span className="meta-value">{updatedDate}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {blog.imageUrl && (
          <div className="detailed-featured-image">
            <img src={blog.imageUrl} alt={blog.title} />
          </div>
        )}

        <article className="detailed-article-card">
          <div className="detailed-article-label">
            THE ARTICLE
          </div>

          <div className="detailed-article-content">
            {blog.content}
          </div>

          <div className="detailed-article-footer">
            <span>✦</span>
            END OF STORY
            <span>✦</span>
          </div>
        </article>

        {/* Likes */}
        <section className="detailed-engagement">
          <div className="detailed-like-section">
            <button
              type="button"
              className={`detailed-like-button ${
                isLiked ? "detailed-like-active" : ""
              }`}
              onClick={handleLike}
              disabled={likeLoading}
              aria-pressed={isLiked}
            >
              <FaHeart />
              {likeLoading
                ? "Updating..."
                : isLiked
                ? "Liked"
                : "Like this story"}
            </button>

            <span className="detailed-likes-count">
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          </div>

          {likeError && (
            <p className="detailed-like-error">{likeError}</p>
          )}
        </section>

        {/* Comments */}
        <section className="detailed-comments">
          <div className="detailed-comments-heading">
            <div>
              <span className="detailed-comments-eyebrow">
                JOIN THE CONVERSATION
              </span>
              <h2>
                Comments
                <span>{commentPagination.totalComments}</span>
              </h2>
            </div>

            <FaRegComment className="detailed-comments-heading-icon" />
          </div>

          {/* Add comment form */}
          <form
            className="detailed-comment-form"
            onSubmit={handleAddComment}
          >
            <textarea
              value={commentContent}
              onChange={(event) => {
                setCommentContent(event.target.value);
                setCommentError("");
              }}
              placeholder="Share your thoughts on this story..."
              maxLength={1000}
              rows={4}
              aria-label="Write a comment"
            />

            <div className="detailed-comment-form-footer">
              <span>{commentContent.length}/1000</span>

              <button
                type="submit"
                disabled={
                  commentSubmitting || !commentContent.trim()
                }
              >
                {commentSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {commentError && (
            <p className="detailed-comment-error">{commentError}</p>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="detailed-comments-state">
              <div className="detailed-spinner" />
              <p>Loading comments...</p>
            </div>
          ) : commentsError ? (
            <div className="detailed-comments-state">
              <p>{commentsError}</p>
              <button
                type="button"
                onClick={() => fetchComments(commentPage)}
              >
                Try Again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="detailed-comments-empty">
              <FaRegComment />
              <h3>Start the conversation</h3>
              <p>
                There are no comments yet. Be the first to share
                your thoughts.
              </p>
            </div>
          ) : (
            <div className="detailed-comment-list">
              {comments.map((comment) => {
                const commentId = getCommentId(comment);
                const commentUser = getCommentUser(comment);

                const commentUserId =
                  commentUser._id || commentUser.id;

                const isOwnComment =
                  currentUserId &&
                  commentUserId &&
                  String(currentUserId) === String(commentUserId);

                const isEditing = editingCommentId === commentId;
                const isDeleting = commentDeletingId === commentId;

                return (
                  <article
                    className="detailed-comment-card"
                    key={commentId}
                  >
                    <div className="detailed-comment-top">
                      <div className="detailed-comment-avatar">
                        {(commentUser.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="detailed-comment-author">
                        <strong>
                          {commentUser.name || "User"}
                        </strong>

                        {commentUser.username && (
                          <span>@{commentUser.username}</span>
                        )}
                      </div>

                      <time className="detailed-comment-date">
                        {comment.createdAt
                          ? new Date(
                              comment.createdAt
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </time>
                    </div>

                    {isEditing ? (
                      <div className="detailed-comment-edit">
                        <textarea
                          value={editingContent}
                          onChange={(event) =>
                            setEditingContent(event.target.value)
                          }
                          maxLength={1000}
                          rows={3}
                        />

                        <div className="detailed-comment-edit-actions">
                          <button
                            type="button"
                            className="detailed-comment-save"
                            onClick={() =>
                              handleUpdateComment(commentId)
                            }
                            disabled={
                              commentUpdating ||
                              !editingContent.trim()
                            }
                          >
                            <FaCheck />
                            {commentUpdating ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            className="detailed-comment-cancel"
                            onClick={handleCancelEdit}
                            disabled={commentUpdating}
                          >
                            <FaTimes />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="detailed-comment-content">
                        {comment.content}
                      </p>
                    )}

                    {isOwnComment && !isEditing && (
                      <div className="detailed-comment-actions">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment)}
                          disabled={Boolean(commentDeletingId)}
                        >
                          <FaEdit />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="detailed-comment-delete"
                          onClick={() =>
                            handleDeleteComment(commentId)
                          }
                          disabled={isDeleting}
                        >
                          <FaTrash />
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!commentsLoading &&
            !commentsError &&
            commentPagination.totalPages > 1 && (
              <div className="detailed-comments-pagination">
                <button
                  type="button"
                  onClick={() =>
                    goToCommentPage(commentPage - 1)
                  }
                  disabled={commentPage === 1}
                >
                  Previous
                </button>

                <span>
                  Page {commentPage} of{" "}
                  {commentPagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    goToCommentPage(commentPage + 1)
                  }
                  disabled={
                    commentPage === commentPagination.totalPages
                  }
                >
                  Next
                </button>
              </div>
            )}
        </section>

        <div className="detailed-bottom">
          <p>Thank you for taking the time to read this story.</p>

          <button
            type="button"
            className="detailed-back-home"
            onClick={() => navigate("/")}
          >
            Back to Home <span>→</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default DetailedBlog;