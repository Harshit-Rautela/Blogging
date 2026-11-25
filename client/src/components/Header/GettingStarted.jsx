
import React from "react";
import { Link } from "react-router-dom";
import { FaPenNib, FaArrowRight, FaBookOpen } from "react-icons/fa";

import "./Header.css";

const GettingStarted = () => {
  return (
    <div className="getting-started">

      {/* Decorative Background */}
      <div className="hero-decoration hero-decoration-one"></div>
      <div className="hero-decoration hero-decoration-two"></div>

      <div className="hero-container">

        {/* Left Content */}
        <div className="hero-content">

          <div className="hero-badge">
            <FaPenNib />
            <span>Your stories deserve a place</span>
          </div>

          <h1 className="hero-title">
            Ideas become
            <span> stories.</span>
            <br />
            Stories become
            <span> impact.</span>
          </h1>

          <p className="hero-description">
            Welcome to My Blog — a space to express your thoughts,
            share your experiences, and discover interesting
            perspectives from others.
          </p>

          <div className="hero-buttons">

            <Link to="/sign-up" className="hero-btn hero-btn-primary">
              Get Started
              <FaArrowRight />
            </Link>

            <Link to="/login" className="hero-btn hero-btn-secondary">
              Log In
            </Link>

          </div>

          <div className="hero-footer-note">
            <FaBookOpen />
            <span>Read. Write. Share. Inspire.</span>
          </div>

        </div>

        {/* Right Visual */}
        <div className="hero-visual">

          <div className="hero-image-card">

            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=85"
              alt="A notebook and writing desk"
            />

            <div className="hero-image-overlay">
              <span>YOUR CREATIVE SPACE</span>
              <h2>Every great story starts with an idea.</h2>
            </div>

          </div>

          <div className="hero-floating-card">
            <FaPenNib />
            <div>
              <strong>Start writing</strong>
              <span>Your next story awaits</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GettingStarted;
