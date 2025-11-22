"use client";
import React, { useState } from "react";
import "./LandingNavbar.css";

const NavBar = () => {
  const [active, setActive] = useState("home");

  const handleScroll = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="yl-header">
      <nav className="yl-nav" aria-label="Main navigation">
        
        {/* Brand Logo */}
        <div
          className="yl-brand"
          onClick={() => handleScroll("home")}
          tabIndex={0}
          role="button"
          aria-label="Go to home"
        >
          CUET Online Stationary
        </div>

        {/* Navigation Links */}
        <ul className="yl-links">
          <li>
            <button
              className={active === "home" ? "active" : ""}
              onClick={() => handleScroll("home")}
            >
              Home
            </button>
          </li>

          <li>
            <button
              className={active === "about" ? "active" : ""}
              onClick={() => handleScroll("about")}
            >
              About
            </button>
          </li>

          <li>
            <button
              className={active === "contact" ? "active" : ""}
              onClick={() => handleScroll("contact")}
            >
              Contact
            </button>
          </li>
        </ul>

        {/* CTA Button */}
        <div className="yl-actions">
          <a className="yl-cta" href="/signin">Sign In</a>
        </div>

      </nav>
    </header>
  );
};

export default NavBar;
