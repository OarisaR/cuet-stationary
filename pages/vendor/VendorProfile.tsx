"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI, vendorAPI } from "@/lib/api-client";
import type { VendorProfile } from "@/lib/models";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import "./VendorProfile.css";

const VendorProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phoneNum: "",
    address: "",
    licenseNum: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUserResponse = await authAPI.getCurrentUser();
      if (!currentUserResponse || !currentUserResponse.user) {
        router.push("/signin");
        return;
      }

      const currentUser = currentUserResponse.user;
      setUser(currentUser);
      const [profileData, statsData] = await Promise.all([
        vendorAPI.getProfile(),
        vendorAPI.getStats(),
      ]);

      if (profileData) {
        setProfile(profileData);
        setFormData({
          displayName: profileData.displayName || "",
          email: profileData.email || currentUser.email || "",
          phoneNum: profileData.phoneNum || "",
          address: profileData.address || "",
          licenseNum: profileData.licenseNum || "",
        });
      } else {
        // Initialize with current user data
        setFormData({
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
          phoneNum: "",
          address: "",
          licenseNum: "",
        });
      }
      setStats(statsData);
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      await vendorAPI.updateProfile({
        displayName: formData.displayName,
        phoneNum: formData.phoneNum,
        address: formData.address,
        licenseNum: formData.licenseNum,
      });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(null), 3000);
      await loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="vendor-profile-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-profile-page">
      <div className="vendor-profile-container">
        
        {/* Page Header */}
        <div className="vendor-profile-header">
          <h1 className="vendor-profile-title">Vendor Profile</h1>
          <p className="vendor-profile-subtitle" >Manage your shop information</p>
        </div>

        {message && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1rem", 
            background: message.includes("Error") ? "rgba(217, 125, 85, 0.1)" : "rgba(184, 196, 169, 0.2)", 
            border: "2px solid #5a6c7d",
            color: "#5a6c7d",
            fontFamily: "'Poppins', sans-serif"
          }}>
            {message}
          </div>
        )}

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
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vendor-profile-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    style={{ background: "rgba(0,0,0,0.05)", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div className="vendor-profile-form-row">
                <div className="vendor-profile-form-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNum"
                    value={formData.phoneNum}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="vendor-profile-form-field">
                  <label>Business License Number</label>
                  <input
                    type="text"
                    name="licenseNum"
                    value={formData.licenseNum}
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

              <button type="submit" className="vendor-profile-save-btn" style = {{background: "rgb(217, 125, 85)"}} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
          {/* Business Stats */}
          <section className="vendor-profile-section">
            <h2 className="vendor-section-heading">Business Statistics</h2>
            <div className="vendor-stats-grid">
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Total Sales</span>
                <span className="vendor-stat-value">৳{stats?.totalSales.toFixed(2) || "0.00"}</span>
              </div>
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Total Orders</span>
                <span className="vendor-stat-value">{stats?.totalOrders || 0}</span>
              </div>
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Active Products</span>
                <span className="vendor-stat-value">{stats?.totalProducts || 0}</span>
              </div>
              <div className="vendor-stat-item">
                <span className="vendor-stat-label">Pending Orders</span>
                <span className="vendor-stat-value">{stats?.pendingOrders || 0}</span>
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section className="vendor-profile-section">
            <h2 className="vendor-section-heading">Payment Information</h2>
            <div className="vendor-payment-info">
              <p className="vendor-payment-text">
                <strong>bKash Number:</strong> {formData.phoneNum || "Not set"}
              </p>
              <p style={{ 
                fontFamily: "'Poppins', sans-serif", 
                fontSize: "0.85rem", 
                color: "#6b7c8f",
                marginTop: "0.5rem" 
              }}>
                Your phone number will be used for bKash payments
              </p>
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

export default VendorProfilePage;