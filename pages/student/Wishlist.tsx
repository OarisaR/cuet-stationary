"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./Wishlist.css";

const Wishlist = () => {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, name: "Premium Notebook", price: 5.99, emoji: "📓" },
    { id: 2, name: "Pen Set (10pcs)", price: 3.50, emoji: "✏️" },
    { id: 3, name: "Geometry Set", price: 8.00, emoji: "📐" },
    { id: 4, name: "Color Markers", price: 6.25, emoji: "🖍️" },
    { id: 5, name: "Sticky Notes Pack", price: 2.99, emoji: "📝" },
    { id: 6, name: "Calculator", price: 12.00, emoji: "🔢" },
  ]);

  const removeItem = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        
        {/* Page Header */}
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist ♥</h1>
          <p className="wishlist-subtitle">{wishlistItems.length} items saved</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">💔</div>
            <p className="empty-text">Your wishlist is empty</p>
            <button className="shop-now-btn" onClick={() => router.push("/student/shop")}>
              Explore Products
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {wishlistItems.map(item => (
                <div key={item.id} className="wishlist-card">
                  <button 
                    className="wishlist-remove" 
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </button>
                  <div className="wishlist-item-image">{item.emoji}</div>
                  <h3 className="wishlist-item-name">{item.name}</h3>
                  <p className="wishlist-item-price">${item.price.toFixed(2)}</p>
                  <div className="wishlist-actions">
                    <button className="wishlist-add-cart">Add to Cart</button>
                    <button className="wishlist-view-btn">View</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="wishlist-footer">
              <button className="add-all-cart-btn">
                Add All to Cart
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Wishlist;