import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Footer Content */}
        <div className="footer-content">
          
          {/* Brand Section */}
          <div className="footer-section">
            <h3 className="footer-brand">
              <span className="brand-icon">✦</span>
              CUET Online Stationary
            </h3>
            <p className="footer-description">
              Your trusted source for quality stationary products. Making learning 
              and working more organized and enjoyable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#">Shop</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="footer-section">
            <h4 className="footer-heading">Connect With Us</h4>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="social-link" aria-label="Email">📧</a>
            </div>
            <p className="footer-contact">support@cuetonline.com</p>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} CUET Online Stationary. All rights reserved.
          </p>
          <p className="footer-credit">
            Made with <span className="heart">♥</span> in Chittagong
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;