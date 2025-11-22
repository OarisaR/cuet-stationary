"use client";
import React, { useState } from "react";
import "./Orders.css";

const Orders = () => {
  const [filter, setFilter] = useState("all");

  const orders = [
    { id: "1234", date: "Nov 20, 2025", items: 3, total: 32.00, status: "delivered" },
    { id: "1233", date: "Nov 18, 2025", items: 2, total: 15.00, status: "shipping" },
    { id: "1232", date: "Nov 15, 2025", items: 1, total: 8.00, status: "processing" },
    { id: "1231", date: "Nov 10, 2025", items: 4, total: 25.50, status: "delivered" },
    { id: "1230", date: "Nov 5, 2025", items: 2, total: 12.00, status: "cancelled" },
  ];

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered": return <span className="order-badge badge-delivered">Delivered ✓</span>;
      case "shipping": return <span className="order-badge badge-shipping">Shipping 🚚</span>;
      case "processing": return <span className="order-badge badge-processing">Processing ⏳</span>;
      case "cancelled": return <span className="order-badge badge-cancelled">Cancelled ✕</span>;
      default: return null;
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        
        {/* Page Header */}
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <button 
            className={`orders-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Orders
          </button>
          <button 
            className={`orders-filter-btn ${filter === "processing" ? "active" : ""}`}
            onClick={() => setFilter("processing")}
          >
            Processing
          </button>
          <button 
            className={`orders-filter-btn ${filter === "shipping" ? "active" : ""}`}
            onClick={() => setFilter("shipping")}
          >
            Shipping
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
                    <span className="order-id">#{order.id}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="order-card-body">
                  <div className="order-detail">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{order.date}</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items} items</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value detail-price">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-card-actions">
                  <button className="order-btn order-btn-primary">View Details</button>
                  {order.status === "shipping" && (
                    <button className="order-btn order-btn-secondary">Track Order</button>
                  )}
                  {order.status === "delivered" && (
                    <button className="order-btn order-btn-secondary">Leave Feedback</button>
                  )}
                  {order.status === "processing" && (
                    <button className="order-btn order-btn-cancel">Cancel Order</button>
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

export default Orders;