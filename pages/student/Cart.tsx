"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, studentAPI } from "@/lib/api-client";
import type { CartItem } from "@/lib/models";
import "./Cart.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoClose } from "react-icons/io5";

const Cart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string; email: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash'>('cash');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const initCart = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (!response || !response.user) {
          router.push("/signin");
          return;
        }

        const user = response.user;
        setStudentId(user.id);
        setStudentInfo({
          name: user.displayName || "Student",
          email: user.email || "",
        });
        
        const cart = await studentAPI.getCart();
        console.log("Cart items loaded:", cart);
        setCartItems(cart || []);
      } catch (error) {
        console.error("Error loading cart:", error);
        setMessage("Error loading cart. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, [router]);

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await studentAPI.removeFromCart(cartItemId);
        setCartItems(items => items.filter(item => item._id?.toString() !== cartItemId));
      } else {
        await studentAPI.updateCartItem(cartItemId, newQuantity);
        setCartItems(items =>
          items.map(item =>
            item._id?.toString() === cartItemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setMessage("Failed to update quantity. Please try again.");
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      console.log("Removing cart item with ID:", cartItemId);
      await studentAPI.removeFromCart(cartItemId);
      setCartItems(items => items.filter(item => item._id?.toString() !== cartItemId));
      setMessage("Item removed from cart");
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error removing item:", error);
      setMessage("Failed to remove item. Please try again.");
    }
  };

  const handleCheckoutClick = async () => {
    if (!studentId || !studentInfo) return;
    
    try {
      // Check if student has a delivery address
      const profile = await studentAPI.getProfile();
      if (!profile || !profile.deliveryAddress) {
        setMessage("⚠️ Please add a delivery address in your profile before placing an order.");
        setTimeout(() => {
          router.push("/student/profile");
        }, 2500);
        return;
      }

      // Show payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error checking profile:", error);
      setMessage("Failed to proceed. Please try again.");
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'bkash' && !transactionId.trim()) {
      setMessage("Please enter bKash transaction ID");
      return;
    }

    setCheckingOut(true);
    try {
      await studentAPI.checkout({ 
        customerName: studentInfo!.name, 
        customerEmail: studentInfo!.email,
        paymentMethod,
        transactionId: paymentMethod === 'bkash' ? transactionId : undefined
      });
      setMessage("Order placed successfully!");
      setShowPaymentModal(false);
      setTimeout(() => {
        router.push("/student/orders");
      }, 1500);
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Failed to place order. Please try again.");
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 2.0 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="cart-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        
        {/* Page Header */}
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{cartItems.length} items in your cart</p>
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

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p className="empty-text">Your cart is empty</p>
            <button className="continue-shopping-btn" onClick={() => router.push("/student/shop")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-content">
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item._id?.toString() || item.productId.toString()} className="cart-item">
                    <div className="cart-item-image">{item.productEmoji}</div>
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.productName}</h3>
                      <p className="cart-item-price">৳{item.productPrice.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button onClick={() => updateQuantity(item._id!.toString(), item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id!.toString(), item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">
                      ৳{(item.productPrice * item.quantity).toFixed(2)}
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item._id!.toString())}>
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
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>৳{shipping.toFixed(2)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row summary-total">
                  <span>Total:</span>
                  <span>৳{total.toFixed(2)}</span>
                </div>

                <button 
                  className="checkout-btn" 
                  onClick={handleCheckoutClick}
                  disabled={checkingOut || cartItems.length === 0}
                >
                  {checkingOut ? "Processing..." : "Proceed to Checkout"}
                </button>
                
                <button className="continue-shopping-btn" onClick={() => router.push("/student/shop")}>
                  Continue Shopping
                </button>
              </div>

            </div>

            {/* Frequently Bought Together */}
            <div className="frequently-bought-section">
              <h2 className="frequently-bought-title">Frequently Bought Together</h2>
              <div className="frequently-bought-grid">
                <div className="frequently-bought-card">
                  <div className="frequently-bought-emoji">✏️</div>
                  <h3 className="frequently-bought-name">Premium Pen Set</h3>
                  <p className="frequently-bought-price">৳4.99</p>
                  <button className="frequently-bought-btn" onClick={() => router.push("/student/shop")}>
                    Add to Cart
                  </button>
                </div>
                
                <div className="frequently-bought-card">
                  <div className="frequently-bought-emoji">📓</div>
                  <h3 className="frequently-bought-name">Spiral Notebook</h3>
                  <p className="frequently-bought-price">৳3.49</p>
                  <button className="frequently-bought-btn" onClick={() => router.push("/student/shop")}>
                    Add to Cart
                  </button>
                </div>
                
                <div className="frequently-bought-card">
                  <div className="frequently-bought-emoji">📏</div>
                  <h3 className="frequently-bought-name">Ruler Set</h3>
                  <p className="frequently-bought-price">৳2.99</p>
                  <button className="frequently-bought-btn" onClick={() => router.push("/student/shop")}>
                    Add to Cart
                  </button>
                </div>
                
                <div className="frequently-bought-card">
                  <div className="frequently-bought-emoji">🖍️</div>
                  <h3 className="frequently-bought-name">Highlighter Pack</h3>
                  <p className="frequently-bought-price">৳5.49</p>
                  <button className="frequently-bought-btn" onClick={() => router.push("/student/shop")}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <button 
              className="payment-modal-close" 
              onClick={() => !checkingOut && setShowPaymentModal(false)}
              disabled={checkingOut}
            >
              <IoClose size={24} />
            </button>

            <div className="payment-modal-header">
              <h2 className="payment-modal-title">Payment Details</h2>
              <p className="payment-modal-subtitle">Choose your payment method</p>
            </div>

            <div className="payment-total-display">
              <span>Total Amount:</span>
              <span className="payment-total-amount">৳{total.toFixed(2)}</span>
            </div>

            <div className="payment-method-section">
              <label className="payment-label">Payment Method</label>
              <select 
                className="payment-method-select"
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value as 'cash' | 'bkash');
                  setTransactionId('');
                }}
                disabled={checkingOut}
              >
                <option value="cash">Cash on Delivery (COD)</option>
                <option value="bkash">bKash</option>
              </select>
            </div>

            {paymentMethod === 'bkash' && (
              <div className="payment-transaction-section">
                <label className="payment-label">
                  bKash Transaction ID
                  <span className="payment-required">*</span>
                </label>
                <input
                  type="text"
                  className="payment-transaction-input"
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  disabled={checkingOut}
                />
                <p className="payment-transaction-hint">
                  Send payment to: 01XXXXXXXXX and enter the transaction ID
                </p>
              </div>
            )}

            <div className="payment-modal-actions">
              <button 
                className="payment-btn-cancel"
                onClick={() => setShowPaymentModal(false)}
                disabled={checkingOut}
              >
                Cancel
              </button>
              <button 
                className="payment-btn-confirm"
                onClick={handleConfirmPayment}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <>
                    <AiOutlineLoading3Quarters className="payment-spinner" />
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;