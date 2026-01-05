"use client";
import React, { useState, useEffect } from "react";
import "./Profile.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { authAPI, studentAPI } from "@/lib/api-client";
import type { StudentProfile } from "@/lib/models";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    studentId: "",
    hallName: "",
    deliveryAddress: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      if (!response?.user) {
        window.location.href = "/signin";
        return;
      }

      setUser(response.user);
      const profileData = await studentAPI.getProfile();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          displayName: profileData.displayName || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          studentId: profileData.studentId || "",
          hallName: profileData.hallName || "",
          deliveryAddress: profileData.deliveryAddress || "",
        });

        // Show prompt if no delivery address
        if (!profileData.deliveryAddress) {
          setShowSetupPrompt(true);
        }
      } else {
        // New user - show setup prompt
        setShowSetupPrompt(true);
        setFormData({
          displayName: response.user.displayName || "",
          email: response.user.email || "",
          phone: "",
          studentId: "",
          hallName: "",
          deliveryAddress: "",
        });
      }
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
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      await studentAPI.updateProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        studentId: formData.studentId,
        hallName: formData.hallName,
        deliveryAddress: formData.deliveryAddress,
      });
      setMessage("Profile updated successfully!");
      if (formData.deliveryAddress) {
        setShowSetupPrompt(false);
      }
      setTimeout(() => setMessage(""), 3000);
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
      <div className="profile-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Page Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>

        {/* Setup Prompt for New Users */}
        {showSetupPrompt && (
          <div className="profile-setup-prompt">
            <span className="profile-setup-icon">✦</span>
            <span className="profile-setup-text">
              Please complete your profile and add a delivery address to start shopping!
            </span>
          </div>
        )}

        {/* Success/Error Message */}
        {message && (
          <div className="message-notification">
            {message}
          </div>
        )}

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
                    name="displayName"
                    value={formData.displayName}
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

                <div className="profile-form-field">
                  <label>Hall Name</label>
                  <input
                    type="text"
                    name="hallName"
                    value={formData.hallName}
                    onChange={handleChange}
                    placeholder="e.g., Shahjalal Hall, Amar Ekushey Hall"
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
                    disabled
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
                    placeholder="+880 1712-345678"
                  />
                </div>
              </div>

              <div className="profile-form-field">
                <label>Delivery Address</label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter your complete delivery address (e.g., Room 123, Hall 4, CUET Campus, Chittagong)"
                  rows={3}
                  className="profile-textarea"
                />
              </div>

              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          {/* Change Password */}
          <section className="profile-section">
            <h2 className="section-heading">Security</h2>
            <div className="password-section">
              <div className="password-info">
                <p className="password-label">Password</p>
                <p className="password-text">Manage your password through your email provider</p>
              </div>
              <button className="profile-change-pwd-btn" disabled>Change Password</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;