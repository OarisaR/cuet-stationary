"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, studentAPI } from "@/lib/api-client";
import type { Order, Product } from "@/lib/models";
import "./Dashboard.css";
import { FiPackage } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Dashboard = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [studentName, setStudentName] = useState<string>("Student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (!response?.user) {
          router.push("/signin");
          return;
        }

        const [ordersData, productsData, profileData] = await Promise.all([
          studentAPI.getOrders(),
          studentAPI.getProducts(),
          studentAPI.getProfile(),
        ]);

        setOrders(ordersData);
        setFeaturedProducts(productsData.slice(0, 4));
        setStudentName(profileData?.displayName || response.user.displayName || "Student");
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const activeOrders = orders.filter(o => o.status === "pending" || o.status === "processing" || o.status === "shipped");

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  //all the delivery status

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered": return "status-delivered";
      case "shipped": return "status-shipping";
      case "processing": return "status-processing";
      case "pending": return "status-pending";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome Back, {studentName}!</h1>
          <p className="welcome-text">Here's what's happening with your orders today</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => router.push("/student/orders")}>
          <div className="stat-icon" style={{color:" rgb(217, 125, 85)"}}><FiPackage /></div>
            <div className="stat-info">
              <h3 className="stat-number">{activeOrders.length}</h3>
              <p className="stat-label">Active Orders</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => router.push("/student/orders")}>
            <div className="stat-icon"  style={{color:" rgb(111, 164, 175)"}}><FiPackage/></div>
            <div className="stat-info">
              <h3 className="stat-number">{orders.length}</h3>
              <p className="stat-label">Total Orders</p>
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
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📦</div>
                <p>No orders yet</p>
              </div>
            ) : (
              orders.slice(0, 3).map((order) => (
                <div key={order._id!.toString()} className="order-item">
                  <div className="order-info">
                    <span className="order-id">Order #{order._id!.toString().substring(0, 8)}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <button className="order-action-btn" onClick={() => router.push("/student/orders")}>
                    View Details
                  </button>
                </div>
              ))
            )}
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
            {featuredProducts.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#999" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏪</div>
                <p>No products available</p>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <div key={product._id!.toString()} className="product-card">
                  <div className="product-image">{product.emoji}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">৳{product.price.toFixed(2)}</p>
                  <button 
                    className="add-cart-btn"
                    onClick={() => router.push("/student/shop")}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;

