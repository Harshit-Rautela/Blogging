
// src/pages/DeleteBlog.js

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteBlog } from "../services/BlogsApi";
import BackButton from "./Buttons/BackButton";
import "./component.css";

const DeleteBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteBlog(id, token);

      navigate("/all-blogs");
    } catch (err) {
      console.error("Failed to delete blog:", err);

      setError(
        err.response?.data?.message ||
        "Something went wrong while deleting your blog. Please try again."
      );

      setDeleting(false);
    }
  };

  return (
    <div className="delete-page">

      {/* Background decoration */}
      <div className="delete-glow delete-glow-one"></div>
      <div className="delete-glow delete-glow-two"></div>

      {/* Top navigation */}
      <div className="delete-topbar">
        <div className="delete-brand">
          <span>✒</span> My Blog<span className="delete-brand-dot">.</span>
        </div>

        <BackButton />
      </div>

      {/* Main content */}
      <main className="delete-main">

        <div className="delete-card">

          {/* Warning icon */}
          <div className="delete-icon-wrapper">
            <div className="delete-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="delete-heading">
            <span className="delete-eyebrow">
              ACCOUNT CONTENT MANAGEMENT
            </span>

            <h1>
              Delete this <span>story?</span>
            </h1>

            <p>
              Are you absolutely sure you want to delete this blog?
              This action cannot be undone.
            </p>
          </div>

          {/* Warning box */}
          <div className="delete-warning-box">
            <div className="delete-warning-symbol">!</div>

            <div>
              <h3>Permanent deletion</h3>
              <p>
                Once deleted, your blog will be permanently removed.
                You won't be able to recover it later.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="delete-error">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="delete-actions">

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="delete-confirm-btn"
            >
              {deleting ? (
                <>
                  <span className="delete-button-spinner"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <span>Delete Blog</span>
                  <span className="delete-arrow">→</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/all-blogs")}
              disabled={deleting}
              className="delete-cancel-btn"
            >
              Keep My Blog
            </button>

          </div>

          {/* Footer */}
          <div className="delete-footer">
            <span>✦</span>
            THINK BEFORE YOU DELETE
            <span>✦</span>
          </div>

        </div>

      </main>

    </div>
  );
};

export default DeleteBlog;
