
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFeatherAlt,
  FaUser,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaAt,
} from "react-icons/fa";

import { signupUser } from "../services/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signupUser({
        name,
        username,
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(
        err.response?.data?.msg || "Unable to create your account. Please try again."
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
              A NEW CHAPTER BEGINS
            </span>

            <h1>
              Your story starts with a <span>single word.</span>
            </h1>

            <p>
              Create your space, share your perspective,
              and connect with ideas worth exploring.
              Every great writer starts somewhere.
            </p>

            <div className="auth-brand-quote">
              <span className="auth-quote-mark">“</span>
              <p>
                A little space for a lot of creativity.
              </p>
            </div>
          </div>

          <div className="auth-brand-footer">
            Read. Write. Share. Inspire.
          </div>

        </div>
      </section>


      {/* RIGHT SIGNUP PANEL */}
      <section className="auth-form-panel">
        <div className="auth-form-container">

          <div className="auth-mobile-logo">
            <FaFeatherAlt />
            <span>My Blog</span>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">
              JOIN OUR COMMUNITY
            </span>

            <h2>Let's create your account.</h2>

            <p>
              Join a community of curious minds and storytellers.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* NAME */}
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>

              <div className="auth-input-wrapper">
                <FaUser />

                <input
                  type="text"
                  id="name"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
            {/* USERNAME */}
            <div className="auth-field">
              <label htmlFor="username">Username</label>

              <div className="auth-input-wrapper">
                <FaAt />

                <input
                  type="text"
                  id="username"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_]{3,20}"
                  title="Use 3–20 letters, numbers, or underscores."
                  required
                />
              </div>

              <small>3–20 characters. Letters, numbers and underscores only.</small>
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create My Account"}

              {!loading && <FaArrowRight />}
            </button>

          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login">Log in</Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Signup;
