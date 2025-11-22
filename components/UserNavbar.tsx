"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./UserNavbar.css";

const UserNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount] = useState(3); // Example cart count

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    // Add logout logic here
    if (confirm("Are you sure you want to logout?")) {
      router.push("/");
    }
  };

  return (
    <header className="user-header">
      <nav className="user-nav" aria-label="Student navigation">
        
        {/* Brand Logo */}
        <div
          className="user-brand"
          onClick={() => router.push("/student/dashboard")}
          tabIndex={0}
          role="button"
          aria-label="Go to dashboard"
        >
          <span className="brand-star">✦</span>
          CUET STATIONARY
        </div>

        {/* Search Bar */}
       

        {/* Navigation Links */}
        <ul className="user-links" style={{marginLeft:"525px"}} >
          <li>
            <button
              className={isActive("/student/dashboard") ? "active" : ""}
              onClick={() => router.push("/student/dashboard")}
            >
              Dashboard
            </button>
          </li>

          <li>
            <button
              className={isActive("/student/shop") ? "active" : ""}
              onClick={() => router.push("/student/shop")}
            >
              Shop
            </button>
          </li>

          <li>
            <button
              className={isActive("/student/orders") ? "active" : ""}
              onClick={() => router.push("/student/orders")}
            >
              Orders
            </button>
          </li>

          <li>
            <button
              className={isActive("/student/profile") ? "active" : ""}
              onClick={() => router.push("/student/profile")}
            >
              Profile
            </button>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="user-actions">
          <button 
            className="cart-btn"
            onClick={() => router.push("/student/cart")}
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>
    </header>
  );
};

export default UserNavbar;