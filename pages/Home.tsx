import React from "react";
import "./Home.css";
//VENDOR HOME
const Home = () => {
  return (
    <section id="home" className="home-section">
      <div className="home-container">
        
        {/* Hero Content */}
        <div className="hero-content">
          {/* <div className="hero-badge">
            <span className="badge-icon">✦</span>
            <span>Welcome to CUET Online Stationary</span>
          </div> */}
          
          <h1 className="hero-title">
            Your One-Stop Shop for
            <span className="highlight"> Quality Stationary</span>
          </h1>
          
          <p className="hero-description">
            Discover a wide range of premium stationary products designed to inspire 
            creativity and boost productivity. From notebooks to pens, we have everything 
            you need for your academic and professional journey.
          </p>
          
          {/* <div className="hero-actions">
            <a href="#about" className="btn-primary">
              Explore Products
            </a>
            <a href="#contact" className="btn-secondary">
              Get in Touch
            </a>
          </div> */}
        </div>

        {/* Decorative Elements */}
        <div className="decorative-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

      </div>
    </section>
  );
};

export default Home;