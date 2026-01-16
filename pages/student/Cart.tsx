"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, studentAPI } from "@/lib/api-client";
import type { CartItem } from "@/lib/models";
import "./Cart.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { generateAIRecommendations } from "@/lib/aiRecommendations";

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
  
  // AI Recommendations State
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

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

  // Generate AI recommendations when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchAIRecommendations();
    } else {
      setAiRecommendations([]);
    }
  }, [cartItems]);

  const fetchAIRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const lastItem = cartItems[cartItems.length - 1];
      const lastProductName =
        lastItem?.productName || lastItem?.product_name || '';

      // If we don’t have a product name, skip recommendations to avoid build-time error
      if (!lastProductName) return;
      const recommendations = await generateAIRecommendations(
        lastItem.productName || lastItem.product_name || "",
        "Stationery",
        
        lastItem.productPrice || lastItem.product_price || 0,
        []
      );
      
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Fallback is already handled in generateAIRecommendations
      setAiRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // NEW FUNCTION: Add recommended item to cart
  const addRecommendationToCart = async (productId: string, productName: string) => {
    try {
      await studentAPI.addToCart(productId, 1);
      setMessage(`✓ ${productName} added to cart!`);
      
      // Refresh cart
      const cart = await studentAPI.getCart();
      setCartItems(cart || []);
      
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Failed to add item. Please try again.");
    }
  };

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
      const profile = await studentAPI.getProfile();
      if (!profile || !profile.deliveryAddress) {
        setMessage("⚠️ Please add a delivery address in your profile before placing an order.");
        setTimeout(() => {
          router.push("/student/profile");
        }, 2500);
        return;
      }

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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.productPrice || item.product_price || 0) * item.quantity, 0);
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
        
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{cartItems.length} items in your cart</p>
        </div>

        {message && (
          <div className="message-notification">
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
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item._id?.toString() || (item.productId || item.inventory_id)?.toString()} className="cart-item">
                    <div className="cart-item-image">{item.productEmoji}</div>
                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.productName}</h3>
                      <p className="cart-item-price">৳{(item.productPrice || item.product_price || 0).toFixed(2)}</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button onClick={() => updateQuantity(item._id!.toString(), item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id!.toString(), item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">
                      ৳{((item.productPrice || item.product_price || 0) * item.quantity).toFixed(2)}
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item._id!.toString())}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

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

            {/* AI-Powered Recommendations - UPDATED SECTION */}
            {cartItems.length > 0 && (
              <div className="frequently-bought-section">
                <h2 className="frequently-bought-title">
                  🤖 Recommendations for You
                </h2>
                <p style={{ 
                  textAlign: 'center', 
                  color: '#6b7c8f', 
                  fontSize: '0.9rem', 
                  marginBottom: '1.5rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Based on your cart, students also need these items from our inventory
                </p>
                
                {loadingRecommendations ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <AiOutlineLoading3Quarters style={{ 
                      fontSize: '2rem', 
                      animation: 'spin 1s linear infinite',
                      color: 'rgb(217, 125, 85)'
                    }} />
                    <p style={{ color: '#6b7c8f', margin: 0 }}>
                      Finding perfect matches from our inventory...
                    </p>
                  </div>
                ) : aiRecommendations.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    color: '#6b7c8f'
                  }}>
                    <p>No recommendations available at the moment.</p>
                  </div>
                ) : (
                  <div className="frequently-bought-grid">
                    {aiRecommendations.map((rec) => (
                      <div key={rec._id} className="frequently-bought-card">
                        <div className="frequently-bought-emoji">
                          {rec.emoji}
                        </div>
                        <h3 className="frequently-bought-name">{rec.name}</h3>
                        <p className="frequently-bought-price">৳{rec.price.toFixed(2)}</p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7c8f',
                          margin: '0.5rem 0',
                          fontStyle: 'italic',
                          minHeight: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '0 0.5rem'
                        }}>
                          {rec.reason}
                        </p>
                        <p style={{
                          fontSize: '0.7rem',
                          color: rec.stock > 0 ? '#10b981' : '#ef4444',
                          margin: '0.25rem 0',
                          fontWeight: '500'
                        }}>
                          {rec.stock > 0 ? `In Stock (${rec.stock})` : 'Out of Stock'}
                        </p>
                        <button 
                          className="frequently-bought-btn" 
                          onClick={() => addRecommendationToCart(rec._id, rec.name)}
                          disabled={rec.stock === 0}
                          style={{
                            opacity: rec.stock === 0 ? 0.5 : 1,
                            cursor: rec.stock === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {rec.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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