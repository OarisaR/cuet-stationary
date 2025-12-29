"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getVendorStats,
  getLowStockProducts,
  getOrdersByStatus,
  updateOrderStatus,
  updateProductStock,
  seedVendorDemoData,
} from "@/lib/vendor-service";
import type { Order, Product, VendorStats } from "@/lib/firestore-types";
import { FaHandSparkles, FaDollarSign, FaBox, FaExclamationTriangle, FaSeedling, FaInbox, FaCheckCircle, FaPlus, FaClipboardList } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import "./Dashboard.css";

const VendorDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        setVendorId(user.uid);

        // Fetch dashboard data
        const [statsData, lowStock, pending] = await Promise.all([
          getVendorStats(user.uid),
          getLowStockProducts(user.uid, 10),
          getOrdersByStatus(user.uid, "pending"),
        ]);

        setStats(statsData);
        setLowStockItems(lowStock);
        setPendingOrders(pending);

        // Initialize restock amounts
        const initialAmounts: Record<string, number> = {};
        lowStock.forEach((item: Product) => {
          initialAmounts[item.id] = 10;
        });
        setRestockAmounts(initialAmounts);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setMessage("Error loading dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const handleProcessOrder = async (orderId: string) => {
    if (!vendorId) return;
    try {
      await updateOrderStatus(orderId, "processing");
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setMessage(`Order #${orderId} marked as processing`);
      
      // Refresh stats
      const newStats = await getVendorStats(vendorId);
      setStats(newStats);
    } catch (error) {
      console.error("Error processing order:", error);
      setMessage("Failed to process order. Please try again.");
    }
  };

  const handleRestock = async (productId: string) => {
    if (!vendorId) return;
    const amount = restockAmounts[productId] ?? 10;
    if (amount <= 0) {
      setMessage("Restock amount must be at least 1.");
      return;
    }

    try {
      await updateProductStock(productId, amount, vendorId, "Manual restock from dashboard");
      
      // Update UI
      setLowStockItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, stock: item.stock + amount } : item
        )
      );
      
      const item = lowStockItems.find((i) => i.id === productId);
      if (item) {
        setMessage(`${item.name} restocked to ${item.stock + amount} units`);
      }
      
      // Refresh stats
      const newStats = await getVendorStats(vendorId);
      setStats(newStats);
    } catch (error) {
      console.error("Error restocking:", error);
      setMessage("Failed to restock. Please try again.");
    }
  };

  const handleRestockAmountChange = (productId: string, value: number) => {
    setRestockAmounts((prev) => ({ ...prev, [productId]: value }));
  };

  // Seed demo data (call once)
  const handleSeedDemoData = async () => {
    if (!vendorId) return;
    if (!confirm("This will add demo products and orders. Continue?")) return;
    
    try {
      setMessage("Seeding demo data...");
      await seedVendorDemoData(vendorId);
      setMessage("Demo data added! Refreshing...");
      window.location.reload();
    } catch (error) {
      console.error("Error seeding demo data:", error);
      setMessage("Failed to seed demo data. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="vendor-dashboard-page">
        <div className="vendor-dashboard-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}><BiLoaderAlt style={{ animation: "spin 1s linear infinite" }} /></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">
        
        {/* Welcome Section */}
        <div className="vendor-welcome-section">
          <h1 className="vendor-welcome-title">Welcome Back, Vendor! <FaHandSparkles style={{ display: "inline", color: "#fbbf24" }} /></h1>
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
            <div className="vendor-stat-icon"><FaDollarSign style={{ color: "#10b981" }} /></div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">${stats?.totalSales.toFixed(2) || "0.00"}</h3>
              <p className="vendor-stat-label">Total Sales</p>
            </div>
          </div>

          <div className="vendor-stat-card" onClick={() => router.push("/vendor/orders")}>
            <div className="vendor-stat-icon"><FaBox style={{ color: "#3b82f6" }} /></div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">{stats?.pendingOrders || 0}</h3>
              <p className="vendor-stat-label">Pending Orders</p>
            </div>
          </div>

          <div className="vendor-stat-card" onClick={() => router.push("/vendor/products")}>
            <div className="vendor-stat-icon"><FaBox style={{ color: "#8b5cf6" }} /></div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">{stats?.totalProducts || 0}</h3>
              <p className="vendor-stat-label">Total Products</p>
            </div>
          </div>

          <div className="vendor-stat-card" onClick={() => router.push("/vendor/inventory")}>
            <div className="vendor-stat-icon"><FaExclamationTriangle style={{ color: "#f59e0b" }} /></div>
            <div className="vendor-stat-info">
              <h3 className="vendor-stat-number">{stats?.lowStockItems || 0}</h3>
              <p className="vendor-stat-label">Low Stock Items</p>
            </div>
          </div>
        </div>

        {/* Seed Demo Data Button (for first-time setup) */}
        {stats && stats.totalProducts === 0 && (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <button
              onClick={handleSeedDemoData}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0 auto",
              }}
            >
              <FaSeedling /> Seed Demo Data (Products & Orders)
            </button>
          </div>
        )}


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
            {pendingOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#9ca3af" }}><FaInbox /></div>
                <p>No pending orders</p>
              </div>
            ) : (
              pendingOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="vendor-order-item">
                  <div className="vendor-order-info">
                    <span className="vendor-order-id">Order #{order.id.substring(0, 8)}</span>
                    <span className="vendor-order-customer">Customer: {order.customerName}</span>
                  </div>
                  <span className="vendor-order-amount">${order.totalAmount.toFixed(2)}</span>
                  <button
                    className="vendor-order-action-btn"
                    onClick={() => handleProcessOrder(order.id)}
                  >
                    Process
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
        {/* Low Stock Alert */}
        <section className="vendor-dashboard-section">
          <div className="vendor-section-head">
            <h2 className="vendor-section-title">Low Stock Alert</h2>
            <button 
              className="vendor-view-all-btn"
              onClick={() => router.push("/vendor/inventory")}
            >
              View Inventory →
            </button>
          </div>

          <div className="vendor-low-stock-grid">
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#999", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#10b981" }}><FaCheckCircle /></div>
                <p>All items have sufficient stock</p>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="vendor-product-alert-card">
                  <div className="vendor-product-emoji">{item.emoji}</div>
                  <h3 className="vendor-product-alert-name">{item.name}</h3>
                  <p className="vendor-product-stock">
                    Stock: <span className={item.stock <= 5 ? "stock-low" : ""}>{item.stock} left</span>
                  </p>
                  <div className="vendor-restock-controls">
                    <input
                      type="number"
                      min="1"
                      value={restockAmounts[item.id] ?? 10}
                      onChange={(e) => handleRestockAmountChange(item.id, parseInt(e.target.value, 10) || 0)}
                      className="vendor-restock-input"
                      aria-label={`Restock amount for ${item.name}`}
                    />
                    <button
                      className="vendor-restock-btn"
                      onClick={() => handleRestock(item.id)}
                      aria-label={`Restock ${item.name}`}
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="vendor-quick-actions">
          <button 
            className="vendor-quick-action-btn"
            onClick={() => router.push("/vendor/products/add")}
          >
            <FaPlus style={{ marginRight: "0.5rem" }} /> Add New Product
          </button>
          <button 
            className="vendor-quick-action-btn"
            onClick={() => router.push("/vendor/orders")}
          >
            <FaClipboardList style={{ marginRight: "0.5rem" }} /> View All Orders
          </button>
        </section>

      </div>
    </div>
  );
};

export default VendorDashboard;