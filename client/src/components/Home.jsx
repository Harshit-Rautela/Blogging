
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserBlogs } from "../services/BlogsApi";
import Navbar from "./Navbar";
import { FaPenNib, FaBookOpen, FaArrowRight } from "react-icons/fa";

const Home = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://blogging-iota-three.vercel.app/auth/me",
          {
            headers: { "x-auth-token": token },
          }
        );

        setUser(response.data);

        const userBlogs = await getUserBlogs(token);
        setBlogs(userBlogs);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Preparing your creative space...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-container">

        {/* Welcome Hero */}
        <section className="home-hero">
          <div className="hero-content">
            <span className="section-eyebrow">
              YOUR PERSONAL WRITING SPACE
            </span>

            <h1>
              Welcome back,
              <span> {user.name}.</span>
            </h1>

            <p>
              Every great story starts with an idea.
              What will you write today?
            </p>

            <Link to="/create" className="hero-create-btn">
              <FaPenNib />
              Start writing
              <FaArrowRight />
            </Link>
          </div>

          <div className="hero-decoration">
            <div className="hero-icon-circle">
              <FaPenNib />
            </div>
            <span>READ. WRITE. INSPIRE.</span>
            <div className="hero-decoration-line"></div>
          </div>
        </section>

        {/* Blog Statistics */}
        <section className="home-stats">
          <div className="stats-icon">
            <FaBookOpen />
          </div>

          <div className="stats-content">
            <span className="section-eyebrow">YOUR COLLECTION</span>
            <h2>{blogs.length}</h2>
            <p>{blogs.length === 1 ? "Published story" : "Published stories"}</p>
          </div>

          <Link to="/all-blogs" className="stats-link">
            Explore all blogs <FaArrowRight />
          </Link>
        </section>

        {/* Blog Collection */}
        <section className="home-blogs-section">
          <div className="blogs-heading">
            <div>
              <span className="section-eyebrow">
                YOUR CREATIVE JOURNEY
              </span>
              <h2>Your stories</h2>
              <p>A collection of thoughts, ideas and experiences.</p>
            </div>

            <Link to="/all-blogs" className="view-all-link">
              View all <FaArrowRight />
            </Link>
          </div>

          {blogs.length > 0 ? (
            <div className="home-blogs-grid">
              {blogs.map((blog) => (
                <Link
                  to={`/user/${blog._id}`}
                  key={blog._id}
                  className="home-blog-card"
                >
                  <div className="blog-card-icon">
                    <FaBookOpen />
                  </div>

                  <h3>{blog.title}</h3>

                  <p>
                    {blog.content?.length > 130
                      ? `${blog.content.substring(0, 130)}...`
                      : blog.content}
                  </p>

                  <span className="blog-card-read">
                    Read story <FaArrowRight />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-blogs">
              <div className="empty-icon">
                <FaPenNib />
              </div>
              <h3>Your first story starts here.</h3>
              <p>
                You haven't published anything yet.
                Turn that idea in your head into a story.
              </p>
              <Link to="/create" className="empty-create-btn">
                Create your first blog <FaArrowRight />
              </Link>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Home;
