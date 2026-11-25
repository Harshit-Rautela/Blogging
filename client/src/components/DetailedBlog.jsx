
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBlogById,
  getBlogLikes,
  likeBlog,
  unlikeBlog,
} from "../services/BlogsApi";
import { FaHeart } from "react-icons/fa";
import BackButton from "./Buttons/BackButton";
import "./component.css";

const DetailedBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Like states
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const fetchedBlog = await getBlogById(id, token);

        if (!isMounted) return;

        setBlog(fetchedBlog);

        // Fetch likes separately so a likes error
        // does not prevent the article from loading.
        try {
          const likesData = await getBlogLikes(id, token);

          if (!isMounted) return;

          setLikesCount(likesData.likesCount);
          setIsLiked(likesData.isLiked);
        } catch {
          if (isMounted) {
            setLikeError("Unable to load likes.");
          }
        }
      } catch {
        if (isMounted) {
          setError("Unable to load this blog. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleLike = async () => {
    if (likeLoading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLikeLoading(true);
    setLikeError("");

    try {
      const response = isLiked
        ? await unlikeBlog(id, token)
        : await likeBlog(id, token);

      setLikesCount(response.likesCount);
      setIsLiked(response.isLiked);
    } catch (err) {
      setLikeError(
        err.response?.data?.msg || "Unable to update your like. Please try again."
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="detailed-loading">
        <div className="detailed-spinner"></div>
        <p>Opening your story...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="detailed-loading">
        <p>{error || "Blog not found."}</p>
        <button onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="detailed-blog-page">

      <div className="detailed-topbar">
        <BackButton />

        <span className="detailed-brand">
          MY BLOG<span>.</span>
        </span>
      </div>

      <main className="detailed-blog-container">

        {/* Article Header */}

        <header className="detailed-blog-header">

          <span className="detailed-eyebrow">
            <span className="detailed-eyebrow-dot"></span>
            YOUR STORY, YOUR PERSPECTIVE
          </span>

          <h1>{blog.title}</h1>

          <div className="detailed-blog-meta">

            <div className="detailed-meta-item">
              <span className="meta-icon">◷</span>
              <div>
                <span className="meta-label">PUBLISHED</span>
                <span className="meta-value">
                  {formatDate(blog.createdAt)}
                </span>
              </div>
            </div>

            {blog.updatedAt && (
              <div className="detailed-meta-item">
                <span className="meta-icon">↻</span>
                <div>
                  <span className="meta-label">LAST UPDATED</span>
                  <span className="meta-value">
                    {formatDate(blog.updatedAt)}
                  </span>
                </div>
              </div>
            )}

          </div>

        </header>

        {/* Featured Image */}

        {blog.imageUrl && (
          <div className="detailed-featured-image">
            <img
              src={blog.imageUrl}
              alt={blog.title}
            />
          </div>
        )}

        {/* Article Content */}

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

        {/* Like Section */}

        <section className="detailed-engagement">

          <div className="detailed-like-section">

            <button
              type="button"
              className={`detailed-like-button ${
                isLiked ? "detailed-like-active" : ""
              }`}
              onClick={handleLike}
              disabled={likeLoading}
              aria-label={isLiked ? "Unlike this blog" : "Like this blog"}
              aria-pressed={isLiked}
            >
              <FaHeart />
              <span>
                {likeLoading
                  ? "Updating..."
                  : isLiked
                  ? "Liked"
                  : "Like"}
              </span>
            </button>

            <span className="detailed-likes-count">
              {likesCount} {likesCount === 1 ? "Like" : "Likes"}
            </span>

          </div>

          {likeError && (
            <p className="detailed-like-error" role="alert">
              {likeError}
            </p>
          )}

        </section>

        {/* Bottom Section */}

        <div className="detailed-bottom">
          <p>
            Every perspective has a story. Keep writing.
          </p>

          <button
            className="detailed-back-home"
            onClick={() => navigate("/home")}
          >
            Back to Home <span>→</span>
          </button>
        </div>

      </main>

    </div>
  );
};

export default DetailedBlog;
