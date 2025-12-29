"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStudentOrders } from "@/lib/student-service";
import type { Order, OrderStatus } from "@/lib/firestore-types";
import "./Orders.css";

const Orders = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initOrders = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        const ordersData = await getStudentOrders(user.uid);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error loading orders:", error);
        setMessage("Error loading orders. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initOrders();
  }, [router]);

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "delivered": return <span className="order-badge badge-delivered">Delivered ✓</span>;
      case "shipped": return <span className="order-badge badge-shipping">Shipping 🚚</span>;
      case "processing": return <span className="order-badge badge-processing">Processing ⏳</span>;
      case "pending": return <span className="order-badge badge-pending">Pending 📋</span>;
      case "cancelled": return <span className="order-badge badge-cancelled">Cancelled ✕</span>;
      default: return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    return timestamp.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        
        {/* Page Header */}
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {message && (
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "#4f46e5",
            color: "white",
            borderRadius: "8px",
            textAlign: "center",
          }}>
            {message}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="orders-filters">
          <button 
            className={`orders-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button 
            className={`orders-filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button 
            className={`orders-filter-btn ${filter === "processing" ? "active" : ""}`}
            onClick={() => setFilter("processing")}
          >
            Processing
          </button>
          <button 
            className={`orders-filter-btn ${filter === "shipped" ? "active" : ""}`}
            onClick={() => setFilter("shipped")}
          >
            Shipped
          </button>
          <button 
            className={`orders-filter-btn ${filter === "delivered" ? "active" : ""}`}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
          <button 
            className={`orders-filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <p className="no-orders-text">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-id-section">
                    <span className="order-label">Order ID:</span>
                    <span className="order-id">#{order.id.substring(0, 8)}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="order-card-body">
                  <div className="order-detail">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items.length} items</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value detail-price">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-card-actions">
                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} style={{ marginRight: "0.5rem" }}>{item.productEmoji}</span>
                    ))}
                    {order.items.length > 3 && <span>+{order.items.length - 3} more</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Orders;