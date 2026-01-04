import React from "react";
import "./About.css";

// React Icons
import { FaBookOpen, FaStar, FaTruck, FaMoneyBillWave } from "react-icons/fa";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="section-badge">About Us</span>
          <h2 className="section-title"  style={{color: "white"}}>Why Choose CUET Online Stationary?</h2>
          <p className="section-subtitle"  style={{color: "white"}}>
            We're committed to providing students and professionals with the best 
            stationary products at affordable prices.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">

          <div className="feature-card">
            <FaBookOpen style={{ fontSize: "40px", color: "#4A90E2" , marginLeft:"80px",marginBottom:"10px" }} />
            <h3 className="feature-title">Wide Selection</h3>
            <p className="feature-description">
              From notebooks to art supplies, we offer a comprehensive range of 
              stationary items to meet all your needs.
            </p>
          </div>

          <div className="feature-card">
            <FaStar style={{ fontSize: "40px", color: "#F5A623" ,marginLeft:"80px",marginBottom:"10px" }} />
            <h3 className="feature-title">Premium Quality</h3>
            <p className="feature-description">
              We source only the highest quality products from trusted brands 
              to ensure your satisfaction.
            </p>
          </div>

          <div className="feature-card">
            <FaTruck style={{ fontSize: "40px", color: "#7ED321",marginLeft:"80px",marginBottom:"10px"  }} />
            <h3 className="feature-title">Fast Delivery</h3>
            <p className="feature-description">
              Quick and reliable delivery service to get your stationary 
              supplies to you when you need them.
            </p>
          </div>

          <div className="feature-card">
            <FaMoneyBillWave style={{ fontSize: "40px", color: "#D0021B",marginLeft:"80px",marginBottom:"10px"  }} />
            <h3 className="feature-title">Great Prices</h3>
            <p className="feature-description">
              Competitive pricing and regular discounts make quality stationary 
              accessible to everyone.
            </p>
          </div>

        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Products</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">2000+</h3>
            <p className="stat-label">Happy Customers</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">5 Years</h3>
            <p className="stat-label">Experience</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">24/7</h3>
            <p className="stat-label">Support</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
