"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, vendorAPI } from "@/lib/api-client";
import type { Order, Product, VendorStats } from "@/lib/models";
import { FaHandSparkles, FaDollarSign, FaBox, FaExclamationTriangle, FaSeedling, FaInbox, FaCheckCircle, FaPlus, FaClipboardList } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
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
        const response = await authAPI.getCurrentUser();
        if (!response || !response.user) {
          router.push("/signin");
          return;
        }

        setVendorId(response.user.id);

        // Fetch dashboard data
        const [statsData, lowStock, orders] = await Promise.all([
          vendorAPI.getStats(),
          vendorAPI.getLowStockProducts(),
          vendorAPI.getOrders(),
        ]);

        setStats(statsData);
        setLowStockItems(lowStock);
        setPendingOrders(orders.filter((o: Order) => o.status === "pending"));

        // Initialize restock amounts
        const initialAmounts: Record<string, number> = {};
        lowStock.forEach((item: Product) => {
          initialAmounts[item._id!.toString()] = 10;
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

    // Refresh stats when page becomes visible (e.g., navigating back from other pages)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        vendorAPI.getStats().then(setStats).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  const handleProcessOrder = async (orderId: string) => {
    if (!vendorId) return;
    try {
      await vendorAPI.updateOrderStatus(orderId, "processing");
      setPendingOrders((prev) => prev.filter((o) => o._id!.toString() !== orderId));
      setMessage(`Order #${orderId} marked as processing`);
      
      // Refresh stats
      const newStats = await vendorAPI.getStats();
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
      await vendorAPI.updateProductStock(productId, amount, "Manual restock from dashboard");
      
      // Update UI
      setLowStockItems((prev) =>
        prev.map((item) =>
          item._id!.toString() === productId ? { ...item, stock: item.stock + amount } : item
        )
      );
      
      const item = lowStockItems.find((i) => i._id!.toString() === productId);
      if (item) {
        setMessage(`${item.name} restocked to ${item.stock + amount} units`);
      }
      
      // Refresh stats
      const newStats = await vendorAPI.getStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error restocking:", error);
      setMessage("Failed to restock. Please try again.");
    }
  };

  const handleRestockAmountChange = (productId: string, value: number) => {
    setRestockAmounts((prev) => ({ ...prev, [productId]: value }));
  };

  if (loading) {
    return (
      <div className="vendor-dashboard-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">
        
        {/* Welcome Section */}
        <div className="vendor-welcome-section">
          <h1 className="vendor-welcome-title">Welcome Back!</h1>
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
              <h3 className="vendor-stat-number">৳{((stats?.totalSales ?? stats?.totalRevenue ?? 0)).toFixed(2)}</h3>
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
              <h3 className="vendor-stat-number">{stats?.lowStockItems || stats?.lowStockCount || 0}</h3>
              <p className="vendor-stat-label">Low Stock Items</p>
            </div>
          </div>
        </div>

        {/* Quick Actions section removed */}

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
                
                <p>No pending orders</p>
              </div>
            ) : (
              pendingOrders.slice(0, 3).map((order) => (
                <div key={order._id!.toString()} className="vendor-order-item">
                  <div className="vendor-order-info">
                    <span className="vendor-order-id">Order #{order._id!.toString().substring(0, 8)}</span>
                    <span className="vendor-order-customer">Customer: {order.customerName}</span>
                  </div>
                  <span className="vendor-order-amount">৳{(order.totalAmount || order.total || 0).toFixed(2)}</span>
                  <button
                    className="vendor-order-action-btn"
                    onClick={() => handleProcessOrder(order._id!.toString())}
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
                
                <p>All items have sufficient stock</p>
              </div>
            ) : (
              lowStockItems.map((item) => {
                const itemId = item._id!.toString();
                return (
                <div key={itemId} className="vendor-product-alert-card">
                  <div className="vendor-product-emoji">{item.emoji}</div>
                  <h3 className="vendor-product-alert-name">{item.name}</h3>
                  <p className="vendor-product-stock">
                    Stock: <span className={item.stock <= 5 ? "stock-low" : ""}>{item.stock} left</span>
                  </p>
                  <div className="vendor-restock-controls">
                    <input
                      type="number"
                      min="1"
                      value={restockAmounts[itemId] ?? 10}
                      onChange={(e) => handleRestockAmountChange(itemId, parseInt(e.target.value, 10) || 0)}
                      className="vendor-restock-input"
                      aria-label={`Restock amount for ${item.name}`}
                    />
                    <button
                      className="vendor-restock-btn"
                      onClick={() => handleRestock(itemId)}
                      aria-label={`Restock ${item.name}`}
                    >
                      Restock
                    </button>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </section>

      

      </div>
    </div>
  );
};

export default VendorDashboard;