"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "./Dashboard.css";

const VendorDashboard = () => {
  const router = useRouter();

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">
        
        {/* Welcome Section */}
        <div className="vendor-welcome-section">
          <h1 className="vendor-welcome-title">Welcome Back, Vendor! 👋</h1>
          <p className="vendor-welcome-text">Here's your business overview</p>
        </div>

        {/* Stats Cards */}
        <div className="vendor-stats-grid">
          <div className="vendor-stat-card">
            <div className="vendor-stat-icon">💰</div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">$2,450</h3>
              <p className="vendor-stat-label">Total Sales</p>
            </div>
          </div>

          <div className="vendor-stat-card" onClick={() => router.push("/vendor/orders")}>
            <div className="vendor-stat-icon">📦</div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">8</h3>
              <p className="vendor-stat-label">Pending Orders</p>
            </div>
          </div>

          <div className="vendor-stat-card" onClick={() => router.push("/vendor/products")}>
            <div className="vendor-stat-icon">📦</div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">45</h3>
              <p className="vendor-stat-label">Total Products</p>
            </div>
          </div>

          <div className="vendor-stat-card" onClick={() => router.push("/vendor/inventory")}>
            <div className="vendor-stat-icon">⚠️</div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">5</h3>
              <p className="vendor-stat-label">Low Stock Items</p>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <section className="vendor-dashboard-section">
          <div className="vendor-section-head">
            <h2 className="vendor-section-title">Pending Orders</h2>
            <button 
              className="vendor-view-all-btn"
              onClick={() => router.push("/vendor/orders")}
            >
              View All →
            </button>
          </div>

          <div className="vendor-orders-list">
            <div className="vendor-order-item">
              <div className="vendor-order-info">
                <span className="vendor-order-id">Order #1234</span>
                <span className="vendor-order-customer">Customer: John Doe</span>
              </div>
              <span className="vendor-order-amount">$32.00</span>
              <button className="vendor-order-action-btn">Process Order</button>
            </div>

            <div className="vendor-order-item">
              <div className="vendor-order-info">
                <span className="vendor-order-id">Order #1233</span>
                <span className="vendor-order-customer">Customer: Jane Smith</span>
              </div>
              <span className="vendor-order-amount">$15.00</span>
              <button className="vendor-order-action-btn">Process Order</button>
            </div>

            <div className="vendor-order-item">
              <div className="vendor-order-info">
                <span className="vendor-order-id">Order #1232</span>
                <span className="vendor-order-customer">Customer: Bob Johnson</span>
              </div>
              <span className="vendor-order-amount">$48.50</span>
              <button className="vendor-order-action-btn">Process Order</button>
            </div>
          </div>
        </section>

        {/* Low Stock Alert */}
        <section className="vendor-dashboard-section">
          <div className="vendor-section-head">
            <h2 className="vendor-section-title">Low Stock Alert ⚠️</h2>
            <button 
              className="vendor-view-all-btn"
              onClick={() => router.push("/vendor/inventory")}
            >
              View Inventory →
            </button>
          </div>

          <div className="vendor-low-stock-grid">
            <div className="vendor-product-alert-card">
              <div className="vendor-product-emoji">📓</div>
              <h3 className="vendor-product-alert-name">Premium Notebook</h3>
              <p className="vendor-product-stock">Stock: <span className="stock-low">3 left</span></p>
              <button className="vendor-restock-btn">Restock</button>
            </div>

            <div className="vendor-product-alert-card">
              <div className="vendor-product-emoji">✏️</div>
              <h3 className="vendor-product-alert-name">Pen Set</h3>
              <p className="vendor-product-stock">Stock: <span className="stock-low">5 left</span></p>
              <button className="vendor-restock-btn">Restock</button>
            </div>

            <div className="vendor-product-alert-card">
              <div className="vendor-product-emoji">📐</div>
              <h3 className="vendor-product-alert-name">Geometry Set</h3>
              <p className="vendor-product-stock">Stock: <span className="stock-low">2 left</span></p>
              <button className="vendor-restock-btn">Restock</button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="vendor-quick-actions">
          <button 
            className="vendor-quick-action-btn"
            onClick={() => router.push("/vendor/products/add")}
          >
            ➕ Add New Product
          </button>
          <button 
            className="vendor-quick-action-btn"
            onClick={() => router.push("/vendor/orders")}
          >
            📋 View All Orders
          </button>
        </section>

      </div>
    </div>
  );
};

export default VendorDashboard;