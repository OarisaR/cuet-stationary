"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWishlist, removeFromWishlist, addToCart, getProductById } from "@/lib/student-service";
import type { WishlistItem } from "@/lib/student-service";
import "./Wishlist.css";

const Wishlist = () => {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initWishlist = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        setStudentId(user.uid);
        const items = await getWishlist(user.uid);
        setWishlistItems(items);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setMessage("Error loading wishlist. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initWishlist();
  }, [router]);

  const removeItem = async (wishlistItemId: string, itemName: string) => {
    try {
      await removeFromWishlist(wishlistItemId);
      setWishlistItems(items => items.filter(item => item.id !== wishlistItemId));
      setMessage(`${itemName} removed from wishlist`);
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error removing item:", error);
      setMessage("Failed to remove item. Please try again.");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!studentId) return;
    try {
      const product = await getProductById(item.productId);
      if (product) {
        await addToCart(studentId, product, 1);
        setMessage(`${item.productName} added to cart!`);
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Failed to add to cart. Please try again.");
    }
  };

  const handleAddAllToCart = async () => {
    if (!studentId) return;
    let successCount = 0;
    for (const item of wishlistItems) {
      try {
        const product = await getProductById(item.productId);
        if (product) {
          await addToCart(studentId, product, 1);
          successCount++;
        }
      } catch (error) {
        console.error("Error adding item to cart:", error);
      }
    }
    setMessage(`${successCount} items added to cart!`);
    setTimeout(() => setMessage(null), 2000);
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <p>Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        
        {/* Page Header */}
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist ♥</h1>
          <p className="wishlist-subtitle">{wishlistItems.length} items saved</p>
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

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">💔</div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding items you love!</p>
            <button 
              className="shop-now-btn"
              onClick={() => router.push("/student/shop")}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item-card">
                  <button 
                    className="wishlist-remove-btn"
                    onClick={() => removeItem(item.id, item.productName)}
                  >
                    ✕
                  </button>
                  <div className="wishlist-item-image">{item.productEmoji}</div>
                  <h3 className="wishlist-item-name">{item.productName}</h3>
                  <p className="wishlist-item-price">${item.productPrice.toFixed(2)}</p>
                  <div className="wishlist-actions">
                    <button 
                      className="wishlist-add-cart"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="wishlist-footer">
              <button 
                className="add-all-cart-btn"
                onClick={handleAddAllToCart}
              >
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