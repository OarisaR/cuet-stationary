"use client";
import React, { useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john.doe@student.cuet.ac.bd",
    phone: "+880 1712-345678",
    studentId: "2021001",
  });

  const [addresses] = useState([
    { id: 1, label: "Home", address: "123 Main St, Chittagong" },
    { id: 2, label: "Dorm", address: "CUET Campus, Chittagong" },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Page Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>

        <div className="profile-content">
          
          {/* Personal Info */}
          <section className="profile-section">
            <h2 className="section-heading">Personal Information</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
              
              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-form-field">
                  <label>Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-form-field">
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

              <button type="submit" className="profile-save-btn">
                Save Changes
              </button>
            </form>
          </section>

          {/* Delivery Addresses */}
          <section className="profile-section">
            <div className="section-header-row">
              <h2 className="section-heading">Delivery Addresses</h2>
              <button className="profile-add-btn">+ Add New</button>
            </div>
            
            <div className="addresses-list">
              {addresses.map(addr => (
                <div key={addr.id} className="address-card">
                  <div className="address-info">
                    <span className="address-label">{addr.label}</span>
                    <p className="address-text">{addr.address}</p>
                  </div>
                  <div className="address-actions">
                    <button className="address-edit-btn">Edit</button>
                    <button className="address-delete-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Change Password */}
          <section className="profile-section">
            <h2 className="section-heading">Security</h2>
            <div className="password-section">
              <div className="password-info">
                <p className="password-label">Password</p>
                <p className="password-text">Last changed 2 months ago</p>
              </div>
              <button className="profile-change-pwd-btn">Change Password</button>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Profile;