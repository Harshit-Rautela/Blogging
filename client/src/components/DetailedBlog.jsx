
// src/components/DetailedBlog.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../services/BlogsApi";
import BackButton from "./Buttons/BackButton";
import "./component.css";

const DetailedBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const fetchedBlog = await getBlogById(id, token);
        setBlog(fetchedBlog);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Unable to load this blog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

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
