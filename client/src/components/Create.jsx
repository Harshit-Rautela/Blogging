
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../services/BlogsApi";
import BackButton from "./Buttons/BackButton";
import { FaPenNib, FaImage, FaArrowRight, FaTimes } from "react-icons/fa";

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (file) {
        formData.append("file", file);
      }

      await createBlog(formData, token);
      navigate("/home");
    } catch (error) {
      console.error("Failed to create blog:", error);
      setError(
        error.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="create-page">
      <div className="create-page__back">
        <BackButton />
      </div>

      <main className="create-container">

        <div className="create-heading">
          <span className="create-heading__eyebrow">
            <FaPenNib /> YOUR CREATIVE SPACE
          </span>

          <h1>
            Turn your ideas into <span>stories.</span>
          </h1>

          <p>
            Every great blog begins with a thought.
            Take your time, express yourself, and let your
            words make an impact.
          </p>
        </div>

        <div className="create-layout">

          <section className="create-form-card">
            <div className="create-form-header">
              <div>
                <h2>Write your story</h2>
                <p>Fill in the details below to create your blog.</p>
              </div>

              <div className="create-form-icon">
                <FaPenNib />
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="create-field">
                <label htmlFor="blog-title">
                  Blog title
                </label>

                <input
                  id="blog-title"
                  type="text"
                  placeholder="Give your story a meaningful title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={150}
                />

                <span className="create-field__hint">
                  {title.length}/150 characters
                </span>
              </div>

              <div className="create-field">
                <label htmlFor="blog-content">
                  Your content
                </label>

                <textarea
                  id="blog-content"
                  placeholder="Start writing your thoughts here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                />

                <span className="create-field__hint">
                  {content.length} characters
                </span>
              </div>

              <div className="create-field">
                <label>Featured image</label>

                <label
                  htmlFor="blog-image"
                  className="create-upload-area"
                >
                  <div className="create-upload-icon">
                    <FaImage />
                  </div>

                  <div className="create-upload-text">
                    <strong>
                      {file ? file.name : "Choose an image"}
                    </strong>

                    <span>
                      {file
                        ? "Image selected successfully"
                        : "Click to browse your files"}
                    </span>
                  </div>

                  <span className="create-upload-action">
                    Browse
                  </span>
                </label>

                <input
                  id="blog-image"
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />

                {file && (
                  <button
                    type="button"
                    className="create-remove-file"
                    onClick={() => {
                      setFile(null);
                      document.getElementById("blog-image").value = "";
                    }}
                  >
                    <FaTimes /> Remove image
                  </button>
                )}
              </div>

              {error && (
                <div className="create-error">
                  {error}
                </div>
              )}

              <div className="create-form-footer">
                <p>
                  <FaPenNib />
                  Your next great story starts here.
                </p>

                <button
                  type="submit"
                  className="create-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : "Create Blog"}
                  {!isSubmitting && <FaArrowRight />}
                </button>
              </div>

            </form>
          </section>

          <aside className="create-sidebar">
            <div className="create-sidebar__card">
              <div className="create-sidebar__icon">
                <FaPenNib />
              </div>

              <span> A LITTLE INSPIRATION </span>

              <h3>
                Your words have the power to make a difference.
              </h3>

              <p>
                Don't worry about making everything perfect.
                Start with an idea, write from your heart,
                and let your creativity flow.
              </p>

              <div className="create-sidebar__line"></div>

              <span className="create-sidebar__footer">
                READ. WRITE. INSPIRE.
              </span>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default Create;
