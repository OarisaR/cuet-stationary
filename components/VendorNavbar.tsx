"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaBell, FaStar } from "react-icons/fa";
import "./VendorNavbar.css";

const VendorNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order #1234 received", time: "2 mins ago", read: false },
    { id: 2, message: "Low stock alert: Premium Notebook", time: "1 hour ago", read: false },
    { id: 3, message: "Order #1230 has been delivered", time: "3 hours ago", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => pathname === path;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAll = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

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
          <span className="brand-star"><FaStar /></span>
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
          <button className="notification-btn" onClick={toggleNotifications}>
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button className="clear-all-btn" onClick={clearAll}>
                    Clear All
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <button className="vendor-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>
    </header>
  );
};

export default VendorNavbar;