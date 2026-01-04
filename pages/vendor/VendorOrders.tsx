"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, vendorAPI } from "@/lib/api-client";
import type { Order, OrderStatus } from "@/lib/models";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaClock, FaCog, FaTruck, FaCheckCircle, FaTimes, FaBox } from "react-icons/fa";
import "./VendorOrders.css";

const VendorOrders = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initOrders = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (!response || !response.user) {
          router.push("/signin");
          return;
        }

        setVendorId(response.user.id);
        const ordersData = await vendorAPI.getOrders();
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
      case "pending": return <span className="vendor-order-badge vendor-badge-pending"><FaClock style={{ fontSize: "0.8rem" }} /> Pending</span>;
      case "processing": return <span className="vendor-order-badge vendor-badge-processing"><FaCog style={{ fontSize: "0.8rem" }} /> Processing</span>;
      case "shipped": return <span className="vendor-order-badge vendor-badge-shipped"><FaTruck style={{ fontSize: "0.8rem" }} /> Shipped</span>;
      case "delivered": return <span className="vendor-order-badge vendor-badge-delivered"><FaCheckCircle style={{ fontSize: "0.8rem" }} /> Delivered</span>;
      case "cancelled": return <span className="vendor-order-badge vendor-badge-cancelled"><FaTimes style={{ fontSize: "0.8rem" }} /> Cancelled</span>;
      default: return null;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await vendorAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id!.toString() === orderId ? { ...o, status: newStatus } : o))
      );
      setMessage(`Order #${orderId.substring(0, 8)} status updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      setMessage("Failed to update order status. Please try again.");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="vendor-orders-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-orders-page">
      <div className="vendor-orders-container">
        
        {/* Page Header */}
        <div className="vendor-orders-header">
          <h1 className="vendor-orders-title">Orders Management</h1>
          <p className="vendor-orders-subtitle">Manage and track customer orders</p>
        </div>

        {message && (
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "#4f46e5",
            color: "white",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>{message}</span>
            <button onClick={() => setMessage(null)} style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "1.5rem",
            }}>×</button>
          </div>
        )}

        {/* Filters */}
        <div className="vendor-orders-filters">
          <button 
            className={`vendor-orders-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Orders
          </button>
          <button 
            className={`vendor-orders-filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button 
            className={`vendor-orders-filter-btn ${filter === "processing" ? "active" : ""}`}
            onClick={() => setFilter("processing")}
          >
            Processing
          </button>
          <button 
            className={`vendor-orders-filter-btn ${filter === "shipped" ? "active" : ""}`}
            onClick={() => setFilter("shipped")}
          >
            Shipped
          </button>
          <button 
            className={`vendor-orders-filter-btn ${filter === "delivered" ? "active" : ""}`}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        <div className="vendor-orders-list">
          {filteredOrders.length === 0 ? (
            <div className="vendor-no-orders">
              <div className="vendor-no-orders-icon" style={{ color: "#6b7c8f" }}><FaBox /></div>
              <p className="vendor-no-orders-text">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id!.toString()} className="vendor-order-card">
                <div className="vendor-order-card-header">
                  <div className="vendor-order-id-section">
                    <span className="vendor-order-label">Order ID:</span>
                    <span className="vendor-order-id-text">#{order._id!.toString().substring(0, 8)}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="vendor-order-card-body">
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Customer:</span>
                    <span className="vendor-detail-value">{order.customerName}</span>
                  </div>
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Date:</span>
                    <span className="vendor-detail-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Items:</span>
                    <span className="vendor-detail-value">{order.items.length} items</span>
                  </div>
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Total:</span>
                    <span className="vendor-detail-value vendor-detail-price">৳{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="vendor-order-card-actions">
                  {order.status === "pending" && (
                    <button 
                      className="vendor-order-btn vendor-order-btn-process"
                      onClick={() => handleStatusUpdate(order._id!.toString(), "processing")}
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button 
                      className="vendor-order-btn vendor-order-btn-ship"
                      onClick={() => handleStatusUpdate(order._id!.toString(), "shipped")}
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button 
                      className="vendor-order-btn vendor-order-btn-deliver"
                      onClick={() => handleStatusUpdate(order._id!.toString(), "delivered")}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default VendorOrders;