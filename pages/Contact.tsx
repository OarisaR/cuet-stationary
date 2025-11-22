import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
    alert("Thank you for reaching out! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        
        {/* Section Header */}
        <div className="section-header">
          <span className="section-badge">Get in Touch</span>
          <h2 className="section-title">We'd Love to Hear From You</h2>
          <p className="section-subtitle">
            Have questions? Need help with an order? Send us a message and 
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="contact-content">
          
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            
            <div className="info-card">
              <div className="info-icon">📧</div>
              <h3 className="info-title">Email Us</h3>
              <p className="info-text">support@cuetonline.com</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3 className="info-title">Call Us</h3>
              <p className="info-text">+880 1234-567890</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3 className="info-title">Visit Us</h3>
              <p className="info-text">Chittagong, Bangladesh</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;