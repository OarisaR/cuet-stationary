"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./VendorProducts.css";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
  custom?: boolean;
};

const STORAGE_KEY = "vendorProductsCustom";

const defaultProducts: Product[] = [
  { id: 1, name: "Premium Notebook", price: 5.99, stock: 45, category: "Notebooks", emoji: "📓", custom: false },
  { id: 2, name: "Pen Set (10pcs)", price: 3.5, stock: 5, category: "Pens", emoji: "✏️", custom: false },
  { id: 3, name: "Geometry Set", price: 8.0, stock: 2, category: "Tools", emoji: "📐", custom: false },
  { id: 4, name: "Color Markers", price: 6.25, stock: 30, category: "Art", emoji: "🖍️", custom: false },
  { id: 5, name: "Sticky Notes", price: 2.99, stock: 3, category: "Accessories", emoji: "📝", custom: false },
  { id: 6, name: "Calculator", price: 12.0, stock: 20, category: "Tools", emoji: "🔢", custom: false },
];

const VendorProducts = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedRaw = localStorage.getItem(STORAGE_KEY);
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw) as Product[];
        const storedArray = Array.isArray(parsed) ? parsed : [];
        setProducts([...defaultProducts, ...storedArray]);
      }
    } catch (err) {
      console.error("Could not read stored products", err);
    }
  }, []);

  const handleDelete = (product: Product) => {
    if (!product.custom) {
      setMessage("Default products cannot be deleted.");
      return;
    }
    if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      try {
        // Get only custom products from storage
        const storedRaw = localStorage.getItem(STORAGE_KEY);
        const stored = storedRaw ? JSON.parse(storedRaw) : [];
        const storedArray = Array.isArray(stored) ? stored : [];
        
        // Filter out the deleted product
        const updatedCustom = storedArray.filter((p: Product) => p.id !== product.id);
        
        // Update storage and state
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustom));
        setProducts([...defaultProducts, ...updatedCustom]);
        setMessage(`${product.name} has been deleted.`);
      } catch (err) {
        console.error("Delete failed", err);
        setMessage("Failed to delete product. Please try again.");
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSaveEdit = () => {
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
      if (editingProduct.custom) {
        // Update in localStorage
        const storedRaw = localStorage.getItem(STORAGE_KEY);
        const stored = storedRaw ? JSON.parse(storedRaw) : [];
        const storedArray = Array.isArray(stored) ? stored : [];
        
        const updatedCustom = storedArray.map((p: Product) => 
          p.id === editingProduct.id ? editingProduct : p
        );
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustom));
        setProducts([...defaultProducts, ...updatedCustom]);
      } else {
        // For default products, only update in state (non-persistent)
        const allProducts = products.map(p => 
          p.id === editingProduct.id ? editingProduct : p
        );
        setProducts(allProducts);
      }

      setMessage(`${editingProduct.name} has been updated.`);
      setEditingProduct(null);
    } catch (err) {
      console.error("Save failed", err);
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
            ➕ Add New Product
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
          <button className="vendor-products-search-btn">🔍</button>
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
                ➕ Add New Product
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="vendor-product-card">
                <div className="vendor-product-image">{product.emoji}</div>
                <div className="vendor-product-details">
                  <h3 className="vendor-product-name">
                    {product.name}
                    {!product.custom && <span className="default-badge">Default</span>}
                  </h3>
                  <p className="vendor-product-category">{product.category}</p>
                  <div className="vendor-product-info-row">
                    <span className="vendor-product-price">${product.price.toFixed(2)}</span>
                    {getStockStatus(product.stock)}
                  </div>
                  <p className="vendor-product-stock-count">Stock: {product.stock} units</p>
                </div>
                <div className="vendor-product-actions">
                  <button 
                    className="vendor-product-edit-btn" 
                    onClick={() => handleEditClick(product)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="vendor-product-delete-btn" 
                    onClick={() => handleDelete(product)}
                    disabled={!product.custom}
                  >
                    🗑️ Delete
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
                    <span>Price (USD) *</span>
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