"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStudentOrders, getWishlist, getAllProducts } from "@/lib/student-service";
import type { Order } from "@/lib/firestore-types";
import type { WishlistItem } from "@/lib/student-service";
import "./Dashboard.css";
import { FiPackage, FiHeart } from "react-icons/fi";

const Dashboard = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        const [ordersData, wishlistData, productsData] = await Promise.all([
          getStudentOrders(user.uid),
          getWishlist(user.uid),
          getAllProducts(),
        ]);

        setOrders(ordersData);
        setWishlistCount(wishlistData.length);
        setFeaturedProducts(productsData.slice(0, 4));
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
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="stat-icon" style={{color:" rgb(217, 125, 85)"}}><FiPackage /></div>
            <div className="stat-info">
              <h3 className="stat-number">{activeOrders.length}</h3>
              <p className="stat-label">Active Orders</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => router.push("/student/wishlist")}>
            <div className="stat-icon"  style={{color:" rgb(217, 125, 85)"}}><FiHeart/></div>
            <div className="stat-info">
              <h3 className="stat-number">{wishlistCount}</h3>
              <p className="stat-label">Wishlist Items</p>
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
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <span className="order-id">Order #{order.id.substring(0, 8)}</span>
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
                <div key={product.id} className="product-card">
                  <div className="product-image">{product.emoji}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price.toFixed(2)}</p>
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

