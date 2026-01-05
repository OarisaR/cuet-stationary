"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, studentAPI } from "@/lib/api-client";
import type { Product } from "@/lib/models";
import "./Shop.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Shop = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initShop = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (!response || !response.user) {
          router.push("/signin");
          return;
        }

        setStudentId(response.user.id);
        const productsData = await studentAPI.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        setMessage("Error loading products. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initShop();
  }, [router]);

  const handleAddToCart = async (product: Product) => {
    if (!studentId) return;
    try {
      await studentAPI.addToCart(product._id!.toString(), 1);
      setMessage(`${product.name} added to cart!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Failed to add to cart. Please try again.");
    }
  };



  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="shop-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        
        {/* Page Header */}
        <div className="shop-header">
          <h1 className="shop-title">Browse Products</h1>
          <p className="shop-subtitle">Find everything you need for your studies</p>
        </div>

        {message && (
          <div className="shop-message">
            {message}
          </div>
        )}

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
            className={`filter-btn ${selectedCategory === "Notebooks" ? "active" : ""}`}
            onClick={() => setSelectedCategory("Notebooks")}
          >
            Notebooks
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "Pens" ? "active" : ""}`}
            onClick={() => setSelectedCategory("Pens")}
          >
            Pens
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "Tools" ? "active" : ""}`}
            onClick={() => setSelectedCategory("Tools")}
          >
            Tools
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "Art" ? "active" : ""}`}
            onClick={() => setSelectedCategory("Art")}
          >
            Art Supplies
          </button>
          <button 
            className={`filter-btn ${selectedCategory === "Accessories" ? "active" : ""}`}
            onClick={() => setSelectedCategory("Accessories")}
          >
            Accessories
          </button>
        </div>

        {/* Products Grid */}
        <div className="shop-products-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
              <p style={{ color: "#999" }}>No products found</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id!.toString()} className="shop-product-card">
                <div className="shop-product-image">{product.emoji}</div>
                <h3 className="shop-product-name">{product.name}</h3>
                {product.description && (
                  <p className="shop-product-description">{product.description}</p>
                )}
                <div className="shop-product-details">
                  <p className="shop-product-price">৳{product.price.toFixed(2)}</p>
                  <p className="shop-product-stock">Stock: {product.stock}</p>
                </div>
                <button 
                  className="shop-add-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;