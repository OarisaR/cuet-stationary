"use client";
import React, { useState } from "react";
import "./VendorOrders.css";

const VendorOrders = () => {
  const [filter, setFilter] = useState("all");

  const orders = [
    { id: "1234", customer: "John Doe", items: 3, total: 32.00, status: "pending", date: "Nov 20, 2025" },
    { id: "1233", customer: "Jane Smith", items: 2, total: 15.00, status: "processing", date: "Nov 19, 2025" },
    { id: "1232", customer: "Bob Johnson", items: 4, total: 48.50, status: "shipped", date: "Nov 18, 2025" },
    { id: "1231", customer: "Alice Brown", items: 1, total: 8.00, status: "delivered", date: "Nov 15, 2025" },
    { id: "1230", customer: "Charlie Wilson", items: 2, total: 12.00, status: "pending", date: "Nov 20, 2025" },
  ];

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <span className="vendor-order-badge vendor-badge-pending">Pending ⏳</span>;
      case "processing": return <span className="vendor-order-badge vendor-badge-processing">Processing 🔄</span>;
      case "shipped": return <span className="vendor-order-badge vendor-badge-shipped">Shipped 🚚</span>;
      case "delivered": return <span className="vendor-order-badge vendor-badge-delivered">Delivered ✓</span>;
      default: return null;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    alert(`Order #${orderId} status updated to: ${newStatus}`);
  };

  return (
    <div className="vendor-orders-page">
      <div className="vendor-orders-container">
        
        {/* Page Header */}
        <div className="vendor-orders-header">
          <h1 className="vendor-orders-title">Orders Management</h1>
          <p className="vendor-orders-subtitle">Manage and track customer orders</p>
        </div>

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
              <div className="vendor-no-orders-icon">📦</div>
              <p className="vendor-no-orders-text">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="vendor-order-card">
                <div className="vendor-order-card-header">
                  <div className="vendor-order-id-section">
                    <span className="vendor-order-label">Order ID:</span>
                    <span className="vendor-order-id-text">#{order.id}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="vendor-order-card-body">
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Customer:</span>
                    <span className="vendor-detail-value">{order.customer}</span>
                  </div>
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Date:</span>
                    <span className="vendor-detail-value">{order.date}</span>
                  </div>
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Items:</span>
                    <span className="vendor-detail-value">{order.items} items</span>
                  </div>
                  <div className="vendor-order-detail">
                    <span className="vendor-detail-label">Total:</span>
                    <span className="vendor-detail-value vendor-detail-price">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="vendor-order-card-actions">
                  <button className="vendor-order-btn vendor-order-btn-view">View Details</button>
                  {order.status === "pending" && (
                    <button 
                      className="vendor-order-btn vendor-order-btn-process"
                      onClick={() => handleStatusUpdate(order.id, "processing")}
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button 
                      className="vendor-order-btn vendor-order-btn-ship"
                      onClick={() => handleStatusUpdate(order.id, "shipped")}
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button 
                      className="vendor-order-btn vendor-order-btn-deliver"
                      onClick={() => handleStatusUpdate(order.id, "delivered")}
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button className="vendor-order-btn vendor-order-btn-contact">Contact Customer</button>
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