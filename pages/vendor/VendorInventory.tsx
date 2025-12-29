"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getVendorProducts, updateProductStock } from "@/lib/vendor-service";
import type { Product } from "@/lib/firestore-types";
import { BiLoaderAlt } from "react-icons/bi";
import { FaExclamationTriangle, FaChartBar, FaBox } from "react-icons/fa";
import "./VendorInventory.css";

const VendorInventory = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initInventory = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        setVendorId(user.uid);
        const productsData = await getVendorProducts(user.uid);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading inventory:", error);
        setMessage("Error loading inventory. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initInventory();
  }, [router]);

  const updateStock = async (productId: string, adjustment: number) => {
    if (!vendorId) return;
    
    try {
      await updateProductStock(productId, adjustment, vendorId, "Manual adjustment from inventory");
      
      // Update local state
      setProducts(products.map(p =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + adjustment) } : p
      ));
      
      // Clear adjustment after update
      setAdjustments(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      
      const product = products.find(p => p.id === productId);
      if (product) {
        setMessage(`${product.name} stock updated successfully`);
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      setMessage("Failed to update stock. Please try again.");
    }
  };

  const handleAdjustmentChange = (productId: string, value: number) => {
    setAdjustments(prev => ({ ...prev, [productId]: value }));
  };

  const handleUpdate = (productId: string) => {
    const adjustment = adjustments[productId];
    if (adjustment === undefined || adjustment === 0) {
      setMessage("Please enter an adjustment amount");
      return;
    }
    
    updateStock(productId, adjustment);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { class: "stock-critical", label: "Critical" };
    if (stock <= 15) return { class: "stock-low", label: "Low" };
    return { class: "stock-good", label: "Good" };
  };

  const criticalStockCount = products.filter(p => p.stock <= 5).length;
  const lowStockCount = products.filter(p => p.stock > 5 && p.stock <= 15).length;

  if (loading) {
    return (
      <div className="vendor-inventory-page">
        <div className="vendor-inventory-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}><BiLoaderAlt style={{ animation: "spin 1s linear infinite" }} /></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-inventory-page">
      <div className="vendor-inventory-container">
        
        {/* Page Header */}
        <div className="vendor-inventory-header">
          <div>
            <h1 className="vendor-inventory-title">Inventory Management</h1>
            <p className="vendor-inventory-subtitle">Monitor and update stock levels</p>
          </div>
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

        {/* Alert Summary */}
        <div className="inventory-alerts">
          <div className="inventory-alert alert-critical">
            <div className="alert-icon"><FaExclamationTriangle style={{ color: "#dc2626" }} /></div>
            <div className="alert-info">
              <h3 className="alert-number">{criticalStockCount}</h3>
              <p className="alert-label">Critical Stock Items</p>
            </div>
          </div>
          <div className="inventory-alert alert-warning">
            <div className="alert-icon"><FaChartBar style={{ color: "#f59e0b" }} /></div>
            <div className="alert-info">
              <h3 className="alert-number">{lowStockCount}</h3>
              <p className="alert-label">Low Stock Items</p>
            </div>
          </div>
          <div className="inventory-alert alert-info">
            <div className="alert-icon"><FaBox style={{ color: "#3b82f6" }} /></div>
            <div className="alert-info">
              <h3 className="alert-number">{products.length}</h3>
              <p className="alert-label">Total Products</p>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const status = getStockStatus(product.stock);
                return (
                  <tr key={product.id}>
                    <td className="inventory-product-emoji">{product.emoji}</td>
                    <td className="inventory-product-name">{product.name}</td>
                    <td className="inventory-stock-number">{product.stock} units</td>
                    <td>
                      <span className={`inventory-status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="inventory-actions">
                      <div className="inventory-control">
                        <input
                          type="number"
                          className="inventory-input"
                          value={adjustments[product.id] ?? 0}
                          onChange={(e) => handleAdjustmentChange(product.id, parseInt(e.target.value, 10) || 0)}
                          placeholder="±0"
                          aria-label={`Adjust stock for ${product.name}`}
                        />
                        <button 
                          className="inventory-btn inventory-btn-update"
                          onClick={() => handleUpdate(product.id)}
                          disabled={!adjustments[product.id] || adjustments[product.id] === 0}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        

      </div>
    </div>
  );
};

export default VendorInventory;