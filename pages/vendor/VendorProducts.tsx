"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./VendorProducts.css";

const VendorProducts = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    { id: 1, name: "Premium Notebook", price: 5.99, stock: 45, category: "Notebooks", emoji: "📓" },
    { id: 2, name: "Pen Set (10pcs)", price: 3.50, stock: 5, category: "Pens", emoji: "✏️" },
    { id: 3, name: "Geometry Set", price: 8.00, stock: 2, category: "Tools", emoji: "📐" },
    { id: 4, name: "Color Markers", price: 6.25, stock: 30, category: "Art", emoji: "🖍️" },
    { id: 5, name: "Sticky Notes", price: 2.99, stock: 3, category: "Accessories", emoji: "📝" },
    { id: 6, name: "Calculator", price: 12.00, stock: 20, category: "Tools", emoji: "🔢" },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return <span className="stock-status stock-low">Low Stock</span>;
    if (stock <= 15) return <span className="stock-status stock-medium">Medium</span>;
    return <span className="stock-status stock-high">In Stock</span>;
  };

  return (
    <div className="vendor-products-page">
      <div className="vendor-products-container">
        
        {/* Page Header */}
        <div className="vendor-products-header">
          <div>
            <h1 className="vendor-products-title">Products Management</h1>
            <p className="vendor-products-subtitle">Manage your product inventory</p>
          </div>
          <button 
            className="vendor-add-product-btn"
            onClick={() => router.push("/vendor/products/add")}
          >
            ➕ Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="vendor-products-search">
          <input 
            type="search" 
            placeholder="Search products..." 
            className="vendor-products-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="vendor-products-search-btn">🔍</button>
        </div>

        {/* Products Grid */}
        <div className="vendor-products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="vendor-product-card">
              <div className="vendor-product-image">{product.emoji}</div>
              <div className="vendor-product-details">
                <h3 className="vendor-product-name">{product.name}</h3>
                <p className="vendor-product-category">{product.category}</p>
                <div className="vendor-product-info-row">
                  <span className="vendor-product-price">${product.price.toFixed(2)}</span>
                  {getStockStatus(product.stock)}
                </div>
                <p className="vendor-product-stock-count">Stock: {product.stock} units</p>
              </div>
              <div className="vendor-product-actions">
                <button className="vendor-product-edit-btn">✏️ Edit</button>
                <button className="vendor-product-delete-btn">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VendorProducts;