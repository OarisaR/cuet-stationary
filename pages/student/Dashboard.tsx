"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "./Dashboard.css";

const Dashboard = () => {
  const router = useRouter();

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome Back, Student! 👋</h1>
          <p className="welcome-text">Here's what's happening with your orders today</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => router.push("/student/orders")}>
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3 className="stat-number">3</h3>
              <p className="stat-label">Active Orders</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => router.push("/student/wishlist")}>
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3 className="stat-number">12</h3>
              <p className="stat-label">Wishlist Items</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3 className="stat-number">250</h3>
              <p className="stat-label">Reward Points</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <section className="dashboard-section">
          <div className="section-head">
            <h2 className="section-title">Recent Orders</h2>
            <button className="view-all-btn" onClick={() => router.push("/student/orders")}>
              View All →
            </button>
          </div>

          <div className="orders-list">
            <div className="order-item">
              <div className="order-info">
                <span className="order-id">Order #1234</span>
                <span className="order-date">Nov 20, 2025</span>
              </div>
              <span className="order-status status-delivered">Delivered</span>
              <button className="order-action-btn" onClick={() => router.push("/student/orders/1234")}>
                View Details
              </button>
            </div>

            <div className="order-item">
              <div className="order-info">
                <span className="order-id">Order #1233</span>
                <span className="order-date">Nov 18, 2025</span>
              </div>
              <span className="order-status status-shipping">Shipping</span>
              <button className="order-action-btn" onClick={() => router.push("/student/orders/1233")}>
                Track Order
              </button>
            </div>

            <div className="order-item">
              <div className="order-info">
                <span className="order-id">Order #1232</span>
                <span className="order-date">Nov 15, 2025</span>
              </div>
              <span className="order-status status-processing">Processing</span>
              <button className="order-action-btn" onClick={() => router.push("/student/orders/1232")}>
                View Details
              </button>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="dashboard-section">
          <div className="section-head">
            <h2 className="section-title">Featured Products</h2>
            <button className="view-all-btn" onClick={() => router.push("/student/shop")}>
              Shop All →
            </button>
          </div>

          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">📓</div>
              <h3 className="product-name">Premium Notebook</h3>
              <p className="product-price">$5.99</p>
              <button className="add-cart-btn">Add to Cart</button>
            </div>

            <div className="product-card">
              <div className="product-image">✏️</div>
              <h3 className="product-name">Pen Set (10pcs)</h3>
              <p className="product-price">$3.50</p>
              <button className="add-cart-btn">Add to Cart</button>
            </div>

            <div className="product-card">
              <div className="product-image">📐</div>
              <h3 className="product-name">Geometry Set</h3>
              <p className="product-price">$8.00</p>
              <button className="add-cart-btn">Add to Cart</button>
            </div>

            <div className="product-card">
              <div className="product-image">🖍️</div>
              <h3 className="product-name">Color Markers</h3>
              <p className="product-price">$6.25</p>
              <button className="add-cart-btn">Add to Cart</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;