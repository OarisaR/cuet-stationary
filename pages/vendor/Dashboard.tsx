"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./Dashboard.css";

type Order = {
  id: number;
  customer: string;
  amount: number;
  status: "pending" | "processed";
};

type LowStockItem = {
  id: number;
  name: string;
  stock: number;
  emoji: string;
};

const VendorDashboard = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([
    { id: 1234, customer: "John Doe", amount: 32.0, status: "pending" },
    { id: 1233, customer: "Jane Smith", amount: 15.0, status: "pending" },
    { id: 1232, customer: "Bob Johnson", amount: 48.5, status: "pending" },
  ]);

  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([
    { id: 1, name: "Premium Notebook", stock: 3, emoji: "📓" },
    { id: 2, name: "Pen Set", stock: 5, emoji: "✏️" },
    { id: 3, name: "Geometry Set", stock: 2, emoji: "📐" },
  ]);

  const [restockAmounts, setRestockAmounts] = useState<Record<number, number>>({
    1: 10,
    2: 10,
    3: 10,
  });

  const [message, setMessage] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders]
  );

  const handleProcessOrder = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "processed" } : o))
    );
    setMessage(`Order #${id} marked as processed`);
  };

  const handleRestock = (id: number) => {
    const amount = restockAmounts[id] ?? 10;
    if (amount <= 0) {
      setMessage("Restock amount must be at least 1.");
      return;
    }
    setLowStockItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: item.stock + amount } : item
      )
    );
    const item = lowStockItems.find((i) => i.id === id);
    if (item) {
      setMessage(`${item.name} restocked to ${item.stock + amount} units`);
    }
  };

  const handleRestockAmountChange = (id: number, value: number) => {
    setRestockAmounts((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">
        
        {/* Welcome Section */}
        <div className="vendor-welcome-section">
          <h1 className="vendor-welcome-title">Welcome Back, Vendor! 👋</h1>
          <p className="vendor-welcome-text">Here's your business overview</p>
        </div>

        {message && (
          <div className="vendor-toast" role="status">
            <span>{message}</span>
            <button aria-label="Dismiss" onClick={() => setMessage(null)}>
              ×
            </button>
          </div>
        )}

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
              <h3 className="vendor-stat-number">{pendingCount}</h3>
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
              <h3 className="vendor-stat-number">{lowStockItems.length}</h3>
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
            {orders.map((order) => (
              <div key={order.id} className={`vendor-order-item ${order.status === "processed" ? "order-processed" : ""}`}>
                <div className="vendor-order-info">
                  <span className="vendor-order-id">Order #{order.id}</span>
                  <span className="vendor-order-customer">Customer: {order.customer}</span>
                </div>
                <span className="vendor-order-amount">${order.amount.toFixed(2)}</span>
                <button
                  className="vendor-order-action-btn"
                  disabled={order.status === "processed"}
                  onClick={() => handleProcessOrder(order.id)}
                >
                  {order.status === "processed" ? "Processed" : "Process Order"}
                </button>
              </div>
            ))}
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
            {lowStockItems.map((item) => (
              <div key={item.id} className="vendor-product-alert-card">
                <div className="vendor-product-emoji">{item.emoji}</div>
                <h3 className="vendor-product-alert-name">{item.name}</h3>
                <p className="vendor-product-stock">Stock: <span className={item.stock <= 5 ? "stock-low" : ""}>{item.stock} left</span></p>
                <div className="restock-control">
                  <input
                    type="number"
                    min={1}
                    value={restockAmounts[item.id] ?? 10}
                    onChange={(e) => handleRestockAmountChange(item.id, parseInt(e.target.value, 10) || 0)}
                    aria-label={`Restock amount for ${item.name}`}
                  />
                  <button className="vendor-restock-btn" onClick={() => handleRestock(item.id)}>
                    Restock +{restockAmounts[item.id] ?? 10}
                  </button>
                </div>
              </div>
            ))}
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