
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaFeatherAlt,
} from "react-icons/fa";

import {
  getUserProfile,
  getUserPublishedBlogs,
} from "../services/UserApi";

import "./component.css";

const PublicProfile = () => {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          throw new Error("Please log in to view writer profiles.");
        }

        const [profileData, blogsData] = await Promise.all([
          getUserProfile(token, userId),
          getUserPublishedBlogs(token, userId, page, 9),
        ]);

        if (!isActive) return;

        setProfile(profileData);
        setBlogs(blogsData.blogs || []);
        setPagination(blogsData.pagination || null);
      } catch (err) {
        if (!isActive) return;

        setError(
          err.response?.data?.msg ||
          err.message ||
          "Unable to load this profile."
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [userId, page, token]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="public-profile-page">
        <div className="profile-status">Loading profile...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="public-profile-page">
        <div className="profile-status profile-error">
          {error}
          <Link to="/discover">Back to Discover</Link>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="public-profile-page">
      <Link to="/discover" className="profile-back-link">
        <FaArrowLeft />
        Back to Discover
      </Link>

      <section className="public-profile-header">
        <div className="public-profile-avatar">
          {profile.name?.charAt(0).toUpperCase()}
        </div>

        <div className="public-profile-identity">
          <span className="profile-eyebrow">WRITER PROFILE</span>
          <h1>{profile.name}</h1>
          <p>@{profile.username}</p>

          <div className="profile-meta">
            <span>
              <FaBookOpen />
              {profile.publishedBlogsCount} published blogs
            </span>

            <span>
              <FaCalendarAlt />
              Joined {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>
      </section>

      <section className="public-profile-blogs">
        <div className="profile-section-heading">
          <div>
            <span className="profile-eyebrow">EXPLORE THEIR WRITING</span>
            <h2>Published Stories</h2>
          </div>

          <span className="profile-blog-count">
            {profile.publishedBlogsCount} stories
          </span>
        </div>

        {blogs.length === 0 ? (
          <div className="profile-empty">
            <FaFeatherAlt />
            <h3>No published stories yet</h3>
            <p>This writer hasn't published any blogs yet.</p>
          </div>
        ) : (
          <>
            <div className="profile-blog-grid">
              {blogs.map((blog) => (
                <article className="profile-blog-card" key={blog._id}>
                  <Link
                    to={`/user/${blog._id}`}
                    className="profile-blog-image"
                  >
                    {blog.imageUrl ? (
                      <img src={blog.imageUrl} alt={blog.title} />
                    ) : (
                      <div className="profile-blog-image-placeholder">
                        <FaFeatherAlt />
                      </div>
                    )}
                  </Link>

                  <div className="profile-blog-content">
                    <span className="profile-blog-category">
                      {blog.category || "General"}
                    </span>

                    <h3>
                      <Link to={`/user/${blog._id}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    <p>
                      {blog.content?.slice(0, 150)}
                      {blog.content?.length > 150 ? "..." : ""}
                    </p>

                    <div className="profile-blog-footer">
                      <span>
                        {blog.readingTime || 1} min read
                      </span>

                      <Link to={`/user/${blog._id}`}>
                        Read story <FaArrowLeft />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {pagination?.totalPages > 1 && (
              <div className="discover-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default PublicProfile;
