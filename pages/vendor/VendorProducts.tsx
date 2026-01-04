"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, vendorAPI } from "@/lib/api-client";
import type { Product, ProductInput } from "@/lib/models";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./VendorProducts.css";

const VendorProducts = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initProducts = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (!response || !response.user) {
          router.push("/signin");
          return;
        }

        setVendorId(response.user.id);
        const productsData = await vendorAPI.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        setMessage("Error loading products. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initProducts();
  }, [router]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      await vendorAPI.deleteProduct(product._id!.toString());
      setProducts((prev) => prev.filter((p) => p._id!.toString() !== product._id!.toString()));
      setMessage(`${product.name} has been deleted.`);
    } catch (error) {
      console.error("Delete failed", error);
      setMessage("Failed to delete product. Please try again.");
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      setMessage("Product name cannot be empty.");
      return;
    }
    if (editingProduct.price <= 0) {
      setMessage("Price must be greater than 0.");
      return;
    }
    if (editingProduct.stock < 0) {
      setMessage("Stock cannot be negative.");
      return;
    }

    try {
      const updates: Partial<ProductInput> = {
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        category: editingProduct.category,
        emoji: editingProduct.emoji,
        description: editingProduct.description,
      };
      
      await vendorAPI.updateProduct(editingProduct._id!.toString(), updates);
      
      setProducts((prev) =>
        prev.map((p) => (p._id!.toString() === editingProduct._id!.toString() ? editingProduct : p))
      );
      
      setMessage(`${editingProduct.name} has been updated.`);
      setEditingProduct(null);
    } catch (error) {
      console.error("Save failed", error);
      setMessage("Failed to save changes. Please try again.");
    }
  };

  const handleEditChange = (field: keyof Product, value: string | number) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return <span className="stock-status stock-low">Low Stock</span>;
    if (stock <= 15) return <span className="stock-status stock-medium">Medium</span>;
    return <span className="stock-status stock-high">In Stock</span>;
  };

  if (loading) {
    return (
      <div className="vendor-products-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <AiOutlineLoading3Quarters style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }} />
          <p style={{ margin: 0 }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-products-page">
      <div className="vendor-products-container">
        
        {/* Page Header */}
        <div className="vendor-products-header">
          <div>
            <h1 className="vendor-products-title">Products Management</h1>
            <p className="vendor-products-subtitle">Manage your product inventory</p>
          </div>
          <button 
            className="vendor-add-product-btn"
            
            onClick={() => router.push("/vendor/products/add")}
          >
            <FaPlus style={{ marginRight: "0.5rem" }} /> Add New Product
          </button>
        </div>

        {message && (
          <div className="vendor-toast" role="status">
            <span>{message}</span>
            <button aria-label="Dismiss" onClick={() => setMessage(null)}>
              ×
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="vendor-products-search">
          <input 
            type="search" 
            placeholder="Search products..." 
            className="vendor-products-search-input"
            
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="vendor-products-search-btn"><FaSearch /></button>
        </div>

        {/* Products Grid */}
        <div className="vendor-products-grid">
          {filteredProducts.length === 0 ? (
            <div className="vendor-products-empty">
              <p>No products match that search. Try a different keyword or add a new product.</p>
              <button 
                className="vendor-add-product-btn"
                onClick={() => router.push("/vendor/products/add")}
              >
                <FaPlus style={{ marginRight: "0.5rem" }} /> Add New Product
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id!.toString()} className="vendor-product-card">
                <div className="vendor-product-image">{product.emoji}</div>
                <div className="vendor-product-details">
                  <h3 className="vendor-product-name">
                    {product.name}
                  </h3>
                  <p className="vendor-product-category">{product.category}</p>
                  <div className="vendor-product-info-row">
                    <span className="vendor-product-price">৳{product.price.toFixed(2)}</span>
                    {getStockStatus(product.stock)}
                  </div>
                  <p className="vendor-product-stock-count">Stock: {product.stock} units</p>
                </div>
                <div className="vendor-product-actions">
                  <button 
                    className="vendor-product-edit-btn" 
                    
                    onClick={() => handleEditClick(product)}
                  >
                    <FaEdit style={{ marginRight: "0.5rem" }} /> Edit
                  </button>
                  <button 
                    className="vendor-product-delete-btn" 
                    onClick={() => handleDelete(product)}
                  >
                    <FaTrash style={{ marginRight: "0.5rem" }} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingProduct && (
          <div className="vendor-modal-overlay" onClick={handleCancelEdit}>
            <div className="vendor-modal" onClick={(e) => e.stopPropagation()}>
              <div className="vendor-modal-header">
                <h2>Edit Product</h2>
                <button className="vendor-modal-close" onClick={handleCancelEdit}>
                  ×
                </button>
              </div>
              <div className="vendor-modal-body">
                <div className="modal-emoji-preview">{editingProduct.emoji || "📦"}</div>
                
                <label className="modal-field">
                  <span>Emoji Icon</span>
                  <input
                    type="text"
                    value={editingProduct.emoji}
                    onChange={(e) => handleEditChange("emoji", e.target.value)}
                    maxLength={4}
                    placeholder="📦"
                  />
                </label>

                <label className="modal-field">
                  <span>Product Name *</span>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    placeholder="Product name"
                  />
                </label>

                <label className="modal-field">
                  <span>Category</span>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => handleEditChange("category", e.target.value)}
                    placeholder="Category"
                  />
                </label>

                <div className="modal-row">
                  <label className="modal-field">
                    <span>Price (BDT) *</span>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => handleEditChange("price", parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </label>

                  <label className="modal-field">
                    <span>Stock *</span>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => handleEditChange("stock", parseInt(e.target.value, 10) || 0)}
                      min="0"
                      placeholder="0"
                    />
                  </label>
                </div>
              </div>
              <div className="vendor-modal-footer">
                <button className="modal-btn modal-cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="modal-btn modal-save-btn" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorProducts;