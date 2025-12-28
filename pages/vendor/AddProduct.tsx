"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./AddProduct.css";

interface ProductInput {
  name: string;
  price: string;
  stock: string;
  category: string;
  emoji: string;
  description: string;
}

const CUSTOM_PRODUCT_KEY = "vendorProductsCustom";

const AddProduct = () => {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({
    name: "",
    price: "",
    stock: "",
    category: "",
    emoji: "📦",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(CUSTOM_PRODUCT_KEY)) {
      localStorage.setItem(CUSTOM_PRODUCT_KEY, "[]");
    }
  }, []);

  const previewPrice = useMemo(() => {
    const price = parseFloat(form.price);
    return Number.isFinite(price) && price > 0 ? price.toFixed(2) : "0.00";
  }, [form.price]);

  const previewStock = useMemo(() => {
    const stock = parseInt(form.stock, 10);
    return Number.isInteger(stock) && stock >= 0 ? stock : 0;
  }, [form.stock]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    const category = form.category.trim() || "General";
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    const emoji = (form.emoji || "📦").trim() || "📦";
    const description = form.description.trim();

    if (!name) {
      setError("Please enter a product name.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be 0 or more.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name,
      category,
      price: parseFloat(price.toFixed(2)),
      stock,
      emoji,
      description,
      custom: true,
    };

    setStatus("saving");
    try {
      const existingRaw = typeof window !== "undefined" ? localStorage.getItem(CUSTOM_PRODUCT_KEY) : null;
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const existingArray = Array.isArray(existing) ? existing : [];
      const updated = [...existingArray, newProduct];
      localStorage.setItem(CUSTOM_PRODUCT_KEY, JSON.stringify(updated));
      router.push("/vendor/products?added=1");
    } catch (err) {
      console.error("Failed to save product", err);
      setError("Could not save product right now. Please try again.");
    } finally {
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setForm({ name: "", price: "", stock: "", category: "", emoji: "📦", description: "" });
    setError(null);
  };

  const fillSample = () => {
    setForm({
      name: "Premium Sketchbook",
      price: "14.50",
      stock: "25",
      category: "Art & Craft",
      emoji: "📔",
      description: "Hardcover sketchbook with 120gsm paper, perfect for markers and pencils.",
    });
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <div className="add-product-head">
          <div>
            <p className="add-product-kicker">Inventory · Quick Add</p>
            <h1 className="add-product-title">Add a New Product</h1>
            <p className="add-product-subtitle">Fill in the details below and publish instantly to your catalog.</p>
          </div>
          <div className="add-product-head-actions">
            <button className="ghost-btn" type="button" onClick={() => router.back()}>
              ← Back
            </button>
            <button className="ghost-btn" type="button" onClick={() => router.push("/vendor/products")}>View Products</button>
          </div>
        </div>

        <div className="add-product-grid">
          <form className="add-product-form" onSubmit={handleSubmit}>
            <div className="form-row two-col">
              <label className="form-field">
                <span>Product name *</span>
                <input
                  name="name"
                  placeholder="e.g. Matte Gel Pen Set"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Category</span>
                <input
                  name="category"
                  placeholder="e.g. Pens & Writing"
                  value={form.category}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="form-row two-col">
              <label className="form-field">
                <span>Price (USD) *</span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="form-field">
                <span>Stock *</span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-row two-col">
              <label className="form-field">
                <span>Emoji icon</span>
                <input
                  name="emoji"
                  placeholder="Pick an emoji (e.g. 🖊️)"
                  value={form.emoji}
                  onChange={handleChange}
                  maxLength={4}
                />
              </label>
              <div className="form-field helper-text">
                <span>Quick tips</span>
                <ul>
                  <li>Use emojis to visually group products.</li>
                  <li>Set realistic stock to avoid overselling.</li>
                  <li>Categories help search filters.</li>
                </ul>
              </div>
            </div>

            <label className="form-field">
              <span>Description</span>
              <textarea
                name="description"
                placeholder="Add a short note about the product (materials, size, colors, etc.)"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={handleReset}>
                Reset
              </button>
              <button type="button" className="ghost-btn" onClick={fillSample}>
                Fill sample
              </button>
              <button className="primary-btn" type="submit" disabled={status === "saving"}>
                {status === "saving" ? "Saving..." : "Save product"}
              </button>
            </div>
          </form>

          <aside className="add-product-preview">
            <div className="preview-card">
              <div className="preview-emoji">{form.emoji || "📦"}</div>
              <div className="preview-body">
                <div className="preview-header">
                  <h3>{form.name || "Product name"}</h3>
                  <span className="preview-price">${previewPrice}</span>
                </div>
                <p className="preview-category">{form.category || "General"}</p>
                <p className="preview-stock">Stock: {previewStock} units</p>
                {form.description ? (
                  <p className="preview-description">{form.description}</p>
                ) : (
                  <p className="preview-placeholder">Add a description to help buyers.</p>
                )}
              </div>
            </div>
            <div className="preview-hint">
              <p>Products you add here will appear instantly in <strong>Products</strong> and are stored locally for now. You can edit or delete them later.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
