
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaPenNib,
  FaHome,
  FaPlusCircle,
  FaBookOpen,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/get-started");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="main-navbar">
      <div className="navbar-inner">

        {/* Brand */}

        <Link to="/home" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-brand-icon">
            <FaPenNib />
          </span>
          <span>My Blog<span className="brand-dot">.</span></span>
        </Link>

        {/* Mobile Menu Toggle */}

        <button
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <FaBars />
        </button>

        {/* Navigation Links */}

        <div className={`navbar-links ${menuOpen ? "navbar-links-open" : ""}`}>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : ""}`
            }
            onClick={closeMenu}
          >
            <FaHome />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : ""}`
            }
            onClick={closeMenu}
          >
            <FaPlusCircle />
            <span>Create Blog</span>
          </NavLink>

          <NavLink
            to="/all-blogs"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : ""}`
            }
            onClick={closeMenu}
          >
            <FaBookOpen />
            <span>All Blogs</span>
          </NavLink>

          <button
            className="navbar-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
