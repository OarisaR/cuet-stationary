"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./Signup.css";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    console.log("Signup data:", formData);
    // Add your signup logic here
    alert("Account created successfully!");
    router.push('/signin');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        {/* Decorative Elements */}
        <div className="auth-shapes">
          <div className="auth-shape auth-shape-1"></div>
          <div className="auth-shape auth-shape-2"></div>
          <div className="auth-shape auth-shape-3"></div>
        </div>

        {/* Signup Card */}
        <div className="auth-card" style={{width: "800px" ,  marginLeft:"-150px"  }}>
          
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Join Us!</h1>
            <p className="auth-subtitle">Create your account</p>
          </div>

          {/* Signup Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                minLength={6}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
            </div>

            <div className="form-agreement">
              <label className="agreement-checkbox">
                <input type="checkbox" required />
                <span>I agree to the Terms & Conditions</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn">
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            <p>Already have an account? 
              <button 
                onClick={() => router.push('/signin')}
                className="auth-link"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="auth-back">
            <button onClick={() => router.push('/')} className="back-home-btn">
              ← Back to Home
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Signup;