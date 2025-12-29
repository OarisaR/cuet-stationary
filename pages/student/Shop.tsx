"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllProducts, addToCart, addToWishlist } from "@/lib/student-service";
import type { Product } from "@/lib/firestore-types";
import "./Shop.css";

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
        const user = getCurrentUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        setStudentId(user.uid);
        const productsData = await getAllProducts();
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
      await addToCart(studentId, product, 1);
      setMessage(`${product.name} added to cart!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Failed to add to cart. Please try again.");
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!studentId) return;
    try {
      await addToWishlist(studentId, product);
      setMessage(`${product.name} added to wishlist!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      setMessage("Failed to add to wishlist. Please try again.");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Loading products...</p>
          </div>
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
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            background: "#4f46e5",
            color: "white",
            borderRadius: "8px",
            textAlign: "center",
          }}>
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
              <div key={product.id} className="shop-product-card">
                <div className="shop-product-image">{product.emoji}</div>
                <h3 className="shop-product-name">{product.name}</h3>
                <p className="shop-product-price">${product.price.toFixed(2)}</p>
                <p className="shop-product-stock">Stock: {product.stock}</p>
                <div className="shop-product-actions">
                  <button 
                    className="shop-add-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="shop-wishlist-btn"
                    onClick={() => handleAddToWishlist(product)}
                  >
                    ♥
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;