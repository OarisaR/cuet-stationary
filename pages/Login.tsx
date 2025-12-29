"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail, getAuthErrorMessage } from "@/lib/auth";
import "./Login.css";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, role } = await signInWithEmail(formData.email, formData.password);
      
      // Redirect based on user role
      if (role === "vendor") {
        router.push('/vendor/dashboard');
      } else if (role === "student") {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      const errorCode = err.code || "";
      setError(getAuthErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
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

        {/* Login Card */}
        <div className="auth-card" style={{"height" : "650px", "fontSize" : "0.5rem"}}>
          
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back!</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                autoComplete="email"
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
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="form-extras">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <p>Don't have an account? 
              <button 
                onClick={() => router.push('/signup')}
                className="auth-link"
              >
                Sign Up
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

export default Login;