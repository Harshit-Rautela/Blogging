
import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

import {
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Footer Navigation */}
        <div className="footer-links">

          <Link to="/" className="footer-link">
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faInstagram} />
            <span>Instagram</span>
          </a>

          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            <span>WhatsApp</span>
          </a>

        </div>

        {/* Contact Information */}
        <div className="footer-contact">
          <FontAwesomeIcon icon={faPhone} />
          <span>9528620577</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
