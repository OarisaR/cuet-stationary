"use client";
import React, { useState } from "react";
import "./VendorProfile.css";

const VendorProfile = () => {
  const [formData, setFormData] = useState({
    shopName: "ABC Stationary Shop",
    ownerName: "John Vendor",
    email: "vendor@abcshop.com",
    phone: "+880 1712-345678",
    address: "123 Market St, Chittagong",
    businessLicense: "BL-2024-001",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  return (
    <div className="vendor-profile-page">
      <div className="vendor-profile-container">
        
        {/* Page Header */}
        <div className="vendor-profile-header">
          <h1 className="vendor-profile-title">Vendor Profile</h1>
          <p className="vendor-profile-subtitle">Manage your shop information</p>
        </div>

        <div className="vendor-profile-content">
          
          {/* Shop Information */}
          <section className="vendor-profile-section">
            <h2 className="vendor-section-heading">Shop Information</h2>
            <form className="vendor-profile-form" onSubmit={handleSubmit}>
              
              <div className="vendor-profile-form-row">
                <div className="vendor-profile-form-field">
                  <label>Shop Name</label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vendor-profile-form-field">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="vendor-profile-form-row">
                <div className="vendor-profile-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vendor-profile-form-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="vendor-profile-form-field">
                <label>Shop Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="vendor-profile-form-field">
                <label>Business License Number</label>
                <input
                  type="text"
                  name="businessLicense"
                  value={formData.businessLicense}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="vendor-profile-save-btn">
                Save Changes
              </button>
            </form>
          </section>

          {/* Business Stats */}
          <section className="vendor-profile-section">
            <h2 className="vendor-section-heading">Business Statistics</h2>
            <div className="vendor-stats-grid">
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Total Sales</span>
                <span className="vendor-stat-value">$12,450</span>
              </div>
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Total Orders</span>
                <span className="vendor-stat-value">245</span>
              </div>
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Active Products</span>
                <span className="vendor-stat-value">45</span>
              </div>
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Member Since</span>
                <span className="vendor-stat-value">Jan 2024</span>
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section className="vendor-profile-section">
            <h2 className="vendor-section-heading">Payment Information</h2>
            <div className="vendor-payment-info">
              <p className="vendor-payment-text">
                <strong>Bank Account:</strong> **** **** **** 1234
              </p>
              <p className="vendor-payment-text">
                <strong>bKash Number:</strong> +880 1712-******
              </p>
              <button className="vendor-update-payment-btn">
                Update Payment Info
              </button>
            </div>
          </section>

          {/* Security */}
          <section className="vendor-profile-section">
            <h2 className="vendor-section-heading">Security</h2>
            <div className="vendor-password-section">
              <div className="vendor-password-info">
                <p className="vendor-password-label">Password</p>
                <p className="vendor-password-text">Last changed 3 months ago</p>
              </div>
              <button className="vendor-change-pwd-btn">Change Password</button>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default VendorProfile;