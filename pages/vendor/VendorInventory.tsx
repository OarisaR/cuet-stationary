"use client";
import React, { useState } from "react";
import "./VendorInventory.css";

const VendorInventory = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Premium Notebook", stock: 45, emoji: "📓" },
    { id: 2, name: "Pen Set (10pcs)", stock: 5, emoji: "✏️" },
    { id: 3, name: "Geometry Set", stock: 2, emoji: "📐" },
    { id: 4, name: "Color Markers", stock: 30, emoji: "🖍️" },
    { id: 5, name: "Sticky Notes", stock: 3, emoji: "📝" },
    { id: 6, name: "Calculator", stock: 20, emoji: "🔢" },
    { id: 7, name: "Highlighters", stock: 15, emoji: "🖊️" },
    { id: 8, name: "Sketchbook", stock: 8, emoji: "📔" },
  ]);

  const [adjustments, setAdjustments] = useState<Record<number, number>>({});

  const updateStock = (id: number, newStock: number) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, stock: Math.max(0, newStock) } : p
    ));
    // Clear adjustment after update
    setAdjustments(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleAdjustmentChange = (id: number, value: number) => {
    setAdjustments(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdate = (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const adjustment = adjustments[id];
    if (adjustment === undefined || adjustment === 0) return;
    
    const newStock = product.stock + adjustment;
    updateStock(id, newStock);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { class: "stock-critical", label: "Critical" };
    if (stock <= 15) return { class: "stock-low", label: "Low" };
    return { class: "stock-good", label: "Good" };
  };

  const criticalStockCount = products.filter(p => p.stock <= 5).length;
  const lowStockCount = products.filter(p => p.stock > 5 && p.stock <= 15).length;

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

        {/* Alert Summary */}
        <div className="inventory-alerts">
          <div className="inventory-alert alert-critical">
            <div className="alert-icon">⚠️</div>
            <div className="alert-info">
              <h3 className="alert-number">{criticalStockCount}</h3>
              <p className="alert-label">Critical Stock Items</p>
            </div>
          </div>
          <div className="inventory-alert alert-warning">
            <div className="alert-icon">📊</div>
            <div className="alert-info">
              <h3 className="alert-number">{lowStockCount}</h3>
              <p className="alert-label">Low Stock Items</p>
            </div>
          </div>
          <div className="inventory-alert alert-info">
            <div className="alert-icon">📦</div>
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