"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./Shop.css";

const Shop = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    { id: 1, name: "Premium Notebook", price: 5.99, category: "notebooks", emoji: "📓" },
    { id: 2, name: "Pen Set (10pcs)", price: 3.50, category: "pens", emoji: "✏️" },
    { id: 3, name: "Geometry Set", price: 8.00, category: "tools", emoji: "📐" },
    { id: 4, name: "Color Markers", price: 6.25, category: "art", emoji: "🖍️" },
    { id: 5, name: "Sticky Notes Pack", price: 2.99, category: "accessories", emoji: "📝" },
    { id: 6, name: "Calculator", price: 12.00, category: "tools", emoji: "🔢" },
    { id: 7, name: "Highlighters Set", price: 4.50, category: "pens", emoji: "🖊️" },
    { id: 8, name: "Sketchbook", price: 7.00, category: "notebooks", emoji: "📔" },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="shop-page">
      <div className="shop-container">
        
        {/* Page Header */}
        <div className="shop-header">
          <h1 className="shop-title">Browse Products</h1>
          <p className="shop-subtitle">Find everything you need for your studies</p>
        </div>

        {/* Search Bar */}
        <div className="shop-search-bar">
          <input 
            type="search" 
            placeholder="Search for products..." 
            className="shop-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="shop-search-btn">🔍</button>
        </div>

        {/* Filters */}
        <div className="shop-filters">
          <button 
            className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "notebooks" ? "active" : ""}`}
            onClick={() => setSelectedCategory("notebooks")}
          >
            Notebooks
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "pens" ? "active" : ""}`}
            onClick={() => setSelectedCategory("pens")}
          >
            Pens
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "tools" ? "active" : ""}`}
            onClick={() => setSelectedCategory("tools")}
          >
            Tools
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "art" ? "active" : ""}`}
            onClick={() => setSelectedCategory("art")}
          >
            Art Supplies
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "accessories" ? "active" : ""}`}
            onClick={() => setSelectedCategory("accessories")}
          >
            Accessories
          </button>
        </div>

        {/* Products Grid */}
        <div className="shop-products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="shop-product-card">
              <div className="shop-product-image">{product.emoji}</div>
              <h3 className="shop-product-name">{product.name}</h3>
              <p className="shop-product-price">${product.price.toFixed(2)}</p>
              <div className="shop-product-actions">
                <button className="shop-add-cart-btn">Add to Cart</button>
                <button className="shop-wishlist-btn">♥</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Shop;