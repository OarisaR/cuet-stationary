"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, studentAPI } from "@/lib/api-client";
import type { Order, OrderStatus, Feedback } from "@/lib/models";
import "./Orders.css";
import { AiOutlineLoading3Quarters, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

// Extended OrderItem type with feedback info
interface OrderItemWithFeedback {
  productId: any;
  productName: string;
  productEmoji: string;
  quantity: number;
  price: number;
  subtotal: number;
  feedback?: Feedback | null;
  feedbackGiven?: boolean;
}

interface OrderWithFeedback extends Omit<Order, 'items'> {
  items: OrderItemWithFeedback[];
}

const Orders = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'active' | 'past'>('active');
  const [orders, setOrders] = useState<OrderWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    orderId: string;
    productId: string;
    productName: string;
    productEmoji: string;
  } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const initOrders = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (!response?.user) {
          router.push("/signin");
          return;
        }

        const ordersData = await studentAPI.getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error loading orders:", error);
        setMessage("Error loading orders. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initOrders();
  }, [router]);

  // Filter orders by active (pending, processing, shipped) or past (delivered, cancelled)
  const activeOrders = orders.filter(o => 
    ['pending', 'processing', 'shipped'].includes(o.status)
  );
  const pastOrders = orders.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  );
  const filteredOrders = filter === 'active' ? activeOrders : pastOrders;

  const openFeedbackModal = (orderId: string, productId: string, productName: string, productEmoji: string) => {
    setFeedbackModal({ orderId, productId, productName, productEmoji });
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  const closeFeedbackModal = () => {
    setFeedbackModal(null);
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  const submitFeedback = async () => {
    if (!feedbackModal) return;

    setSubmittingFeedback(true);
    try {
      const data = await studentAPI.submitFeedback(
        feedbackModal.orderId,
        feedbackModal.productId,
        feedbackRating,
        feedbackComment.trim() || undefined
      );

      setMessage('Feedback submitted successfully! ✓');
      // Refresh orders to get updated feedback status
      const ordersData = await studentAPI.getOrders();
      setOrders(ordersData);
      closeFeedbackModal();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setMessage(error.message || 'Failed to submit feedback. Please try again.');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "delivered": return <span className="order-badge badge-delivered">Delivered ✓</span>;
      case "shipped": return <span className="order-badge badge-shipping">Shipping 🚚</span>;
      case "processing": return <span className="order-badge badge-processing">Processing ⏳</span>;
      case "pending": return <span className="order-badge badge-pending">Pending 📋</span>;
      case "cancelled": return <span className="order-badge badge-cancelled">Cancelled ✕</span>;
      default: return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="orders-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        
        {/* Page Header */}
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your orders</p>
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

        {/* Filter Tabs - Active vs Past */}
        <div className="orders-filters">
          <button 
            className={`orders-filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button 
            className={`orders-filter-btn ${filter === "past" ? "active" : ""}`}
            onClick={() => setFilter("past")}
          >
            Past Orders ({pastOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <p className="no-orders-text">
                {filter === 'active' ? 'No active orders' : 'No past orders'}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id!.toString()} className="order-card">
                <div className="order-card-header">
                  <div className="order-id-section">
                    <span className="order-label">Order ID:</span>
                    <span className="order-id">#{order._id!.toString().substring(0, 8)}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="order-card-body">
                  <div className="order-detail">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items.length} items</span>
                  </div>
                  <div className="order-detail">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value detail-price">৳{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Show product items for delivered orders with feedback options */}
                {order.status === 'delivered' && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6b7280' }}>Products:</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{item.productEmoji}</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                              Qty: {item.quantity} × ৳{item.price} = ৳{item.subtotal}
                            </div>
                          </div>
                        </div>
                        
                        {/* Feedback section */}
                        {item.feedbackGiven ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '500' }}>
                              ✓ Feedback Given
                            </div>
                            <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                              {'⭐'.repeat(item.feedback?.rating || 0)}
                            </div>
                            {item.feedback?.comment && (
                              <div style={{ 
                                fontSize: '0.8rem', 
                                color: '#6b7280',
                                marginTop: '0.25rem',
                                fontStyle: 'italic',
                                maxWidth: '200px'
                              }}>
                                "{item.feedback.comment}"
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => openFeedbackModal(
                              order._id!.toString(),
                              item.productId.toString(),
                              item.productName,
                              item.productEmoji
                            )}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#4f46e5',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}
                          >
                            Give Feedback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular items preview for non-delivered orders */}
                {order.status !== 'delivered' && (
                  <div className="order-card-actions">
                    <div className="order-items-preview">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} style={{ marginRight: "0.5rem" }}>{item.productEmoji}</span>
                      ))}
                      {order.items.length > 3 && <span>+{order.items.length - 3} more</span>}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Feedback Modal */}
        {feedbackModal && (
          <div className="feedback-modal-overlay" onClick={closeFeedbackModal}>
            <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button 
                onClick={closeFeedbackModal}
                className="feedback-modal-close"
                disabled={submittingFeedback}
              >
                <IoClose size={24} />
              </button>

              {/* Header */}
              <div className="feedback-modal-header">
                <h2 className="feedback-modal-title">Rate Your Experience</h2>
                <p className="feedback-modal-subtitle">Help us improve our service</p>
              </div>
              
              {/* Product Info */}
              <div className="feedback-product-info">
                <span className="feedback-product-emoji">{feedbackModal.productEmoji}</span>
                <span className="feedback-product-name">{feedbackModal.productName}</span>
              </div>

              {/* Rating */}
              <div className="feedback-rating-section">
                <label className="feedback-label">
                  How would you rate this product? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="feedback-stars-container">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="feedback-star-button"
                      disabled={submittingFeedback}
                    >
                      {star <= feedbackRating ? (
                        <AiFillStar className="feedback-star-filled" />
                      ) : (
                        <AiOutlineStar className="feedback-star-empty" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="feedback-rating-text">
                  {feedbackRating === 1 && "Poor"}
                  {feedbackRating === 2 && "Fair"}
                  {feedbackRating === 3 && "Good"}
                  {feedbackRating === 4 && "Very Good"}
                  {feedbackRating === 5 && "Excellent"}
                </p>
              </div>

              {/* Comment */}
              <div className="feedback-comment-section">
                <label className="feedback-label">
                  Share your thoughts (Optional)
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what you liked or disliked about this product..."
                  className="feedback-textarea"
                  disabled={submittingFeedback}
                  maxLength={500}
                />
                <div className="feedback-char-count">
                  {feedbackComment.length}/500 characters
                </div>
              </div>

              {/* Buttons */}
              <div className="feedback-modal-actions">
                <button
                  onClick={closeFeedbackModal}
                  disabled={submittingFeedback}
                  className="feedback-btn feedback-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={submittingFeedback}
                  className="feedback-btn feedback-btn-submit"
                >
                  {submittingFeedback ? (
                    <>
                      <AiOutlineLoading3Quarters className="feedback-spinner" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;