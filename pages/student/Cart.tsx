"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./Cart.css";

const Cart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Premium Notebook", price: 5.99, quantity: 2, emoji: "📓" },
    { id: 2, name: "Pen Set (10pcs)", price: 3.50, quantity: 1, emoji: "✏️" },
    { id: 3, name: "Color Markers", price: 6.25, quantity: 3, emoji: "🖍️" },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 2.0;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="cart-container">
        
        {/* Page Header */}
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{cartItems.length} items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p className="empty-text">Your cart is empty</p>
            <button className="shop-now-btn" onClick={() => router.push("/student/shop")}>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="cart-content">
            
            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">{item.emoji}</div>
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row summary-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="checkout-btn" onClick={() => alert("Checkout coming soon!")}>
                Proceed to Checkout
              </button>
              
              <button className="continue-shopping-btn" onClick={() => router.push("/student/shop")}>
                Continue Shopping
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;