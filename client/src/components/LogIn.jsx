
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFeatherAlt,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

import { loginUser } from "../services/api";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      localStorage.setItem("token", data.token);

      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT BRANDING PANEL */}
      <section className="auth-brand-panel">
        <div className="auth-brand-content">

          <Link to="/" className="auth-brand-logo">
            <FaFeatherAlt />
            <span>My Blog</span>
          </Link>

          <div className="auth-brand-message">
            <span className="auth-brand-tagline">
              YOUR WORDS. YOUR SPACE.
            </span>

            <h1>
              Every great story deserves <span>another chapter.</span>
            </h1>

            <p>
              Your ideas, your experiences, your voice.
              Pick up where you left off and keep creating
              something meaningful.
            </p>

            <div className="auth-brand-quote">
              <span className="auth-quote-mark">“</span>
              <p>
                The world is waiting to hear your story.
              </p>
            </div>
          </div>

          <div className="auth-brand-footer">
            Read. Write. Share. Inspire.
          </div>

        </div>
      </section>


      {/* RIGHT LOGIN PANEL */}
      <section className="auth-form-panel">
        <div className="auth-form-container">

          <div className="auth-mobile-logo">
            <FaFeatherAlt />
            <span>My Blog</span>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>Good to see you again.</h2>

            <p>
              Sign in to continue your writing journey.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>

              <div className="auth-input-wrapper">
                <FaEnvelope />

                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <div className="auth-input-wrapper">
                <FaLock />

                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Continue to My Blog"}

              {!loading && <FaArrowRight />}
            </button>

          </form>

          <div className="auth-switch">
            New to My Blog?
            <Link to="/sign-up">Create an account</Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LogIn;
