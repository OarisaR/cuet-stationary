"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./VendorNavbar.css";

const VendorNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [notificationCount] = useState(3); // Example notification count

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      router.push("/");
    }
  };

  return (
    <header className="vendor-header">
      <nav className="vendor-nav" aria-label="Vendor navigation">
        
        {/* Brand Logo */}
        <div
          className="vendor-brand"
          onClick={() => router.push("/vendor/dashboard")}
          tabIndex={0}
          role="button"
          aria-label="Go to dashboard"
        >
          <span className="brand-star">✦</span>
          VENDOR PANEL
        </div>

        {/* Navigation Links */}
        <ul className="vendor-links">
          <li>
            <button
              className={isActive("/vendor/dashboard") ? "active" : ""}
              onClick={() => router.push("/vendor/dashboard")}
            >
              Dashboard
            </button>
          </li>

          <li>
            <button
              className={isActive("/vendor/products") ? "active" : ""}
              onClick={() => router.push("/vendor/products")}
            >
              Products
            </button>
          </li>

          <li>
            <button
              className={isActive("/vendor/orders") ? "active" : ""}
              onClick={() => router.push("/vendor/orders")}
            >
              Orders
            </button>
          </li>

          <li>
            <button
              className={isActive("/vendor/inventory") ? "active" : ""}
              onClick={() => router.push("/vendor/inventory")}
            >
              Inventory
            </button>
          </li>

          <li>
            <button
              className={isActive("/vendor/profile") ? "active" : ""}
              onClick={() => router.push("/vendor/profile")}
            >
              Profile
            </button>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="vendor-actions">
          <button className="notification-btn">
            🔔
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          <button className="vendor-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>
    </header>
  );
};

export default VendorNavbar;