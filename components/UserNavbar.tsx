"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authAPI, studentAPI } from "@/lib/api-client";
import "./UserNavbar.css";

const UserNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Check if token exists before making API calls
        const token = localStorage.getItem('authToken');
        if (!token) {
          return;
        }

        const userResponse = await authAPI.getCurrentUser();
        if (userResponse && userResponse.user) {
          const cartItems = await studentAPI.getCart();
          setCartCount(cartItems.length);
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
    
    // Refresh cart count every 2 seconds when on cart or shop page
    const interval = setInterval(() => {
      if (pathname === "/student/cart" || pathname === "/student/shop") {
        fetchCartCount();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      authAPI.logout();
      localStorage.removeItem('user');
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