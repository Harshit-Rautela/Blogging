
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlogById, updateBlog } from "../services/BlogsApi";
import BackButton from "./Buttons/BackButton";
import "./component.css";

const UpdateBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const blog = await getBlogById(id, token);

        setTitle(blog.title || "");
        setContent(blog.content || "");
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError("Unable to load your blog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updatedBlog = { title, content };

      await updateBlog(id, updatedBlog, token);

      navigate("/home");
    } catch (err) {
      console.error("Cannot update the blog:", err);
      setError("Something went wrong while updating your blog.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="update-loading">
        <div className="update-spinner"></div>
        <p>Preparing your editor...</p>
      </div>
    );
  }

  if (error && !title && !content) {
    return (
      <div className="update-loading">
        <p>{error}</p>
        <button onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="update-blog-page">

      <BackButton />

      <div className="update-blog-container">

        <div className="update-blog-heading">
          <span className="update-eyebrow">
            YOUR CREATIVE WORKSPACE
          </span>

          <h1>
            Refine Your <span>Story.</span>
          </h1>

          <p>
            Every great story deserves another look.
            Make your edits, polish your thoughts, and
            share your updated perspective.
          </p>
        </div>

        <div className="update-editor-card">

          <div className="update-editor-header">
            <div>
              <span className="editor-label">BLOG EDITOR</span>
              <h2>Edit Your Blog</h2>
            </div>

            <div className="editor-icon">
              ✎
            </div>
          </div>

          <form onSubmit={handleUpdate}>

            <div className="update-form-group">
              <label htmlFor="blog-title">
                Blog Title
              </label>

              <input
                id="blog-title"
                type="text"
                placeholder="Give your story a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="update-form-group">
              <label htmlFor="blog-content">
                Your Content
              </label>

              <textarea
                id="blog-content"
                placeholder="Start writing your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />

              <div className="content-meta">
                <span>
                  {content.trim()
                    ? content.trim().split(/\s+/).length
                    : 0} words
                </span>

                <span>
                  Keep expressing yourself.
                </span>
              </div>
            </div>

            {error && (
              <div className="update-error">
                {error}
              </div>
            )}

            <div className="update-form-actions">

              <button
                type="button"
                className="update-cancel-btn"
                onClick={() => navigate("/home")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="update-submit-btn"
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Changes"}

                {!saving && <span> →</span>}
              </button>

            </div>

          </form>
        </div>

        <div className="update-footer-note">
          <span>✦</span>
          Great writing is never finished, only refined.
        </div>

      </div>
    </div>
  );
};

export default UpdateBlog;
