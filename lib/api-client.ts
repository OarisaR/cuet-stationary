// API Client for Next.js Backend
// This replaces the Firebase client-side calls

const API_BASE_URL = '/api';

// Store token in memory and localStorage
let authToken: string | null = null;

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('authToken');
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Always get fresh token from localStorage or memory
  const token = authToken || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// ==================== AUTH ====================

export const authAPI = {
  async signup(email: string, password: string, displayName?: string) {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async logout() {
    setAuthToken(null);
  },

  async getCurrentUser() {
    try {
      return await apiFetch('/auth/me');
    } catch (error) {
      setAuthToken(null);
      throw error;
    }
  },
};

// ==================== STUDENT API ====================

export const studentAPI = {
  // Cart
  async getCart() {
    const response = await apiFetch('/student/cart');
    return response.items || [];
  },

  async addToCart(productId: string, quantity: number = 1) {
    return await apiFetch('/student/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartItem(itemId: string, quantity: number) {
    return await apiFetch(`/student/cart/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeFromCart(itemId: string) {
    return await apiFetch(`/student/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return await apiFetch('/student/cart', {
      method: 'DELETE',
    });
  },

  // Wishlist
  async getWishlist() {
    const response = await apiFetch('/student/wishlist');
    return response.items || [];
  },

  async addToWishlist(productId: string) {
    return await apiFetch('/student/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async removeFromWishlist(itemId: string) {
    return await apiFetch(`/student/wishlist/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders() {
    const response = await apiFetch('/student/orders');
    return response.orders || [];
  },

  async createOrder(shippingAddress?: string, notes?: string, paymentMethod?: string, transactionId?: string) {
    return await apiFetch('/student/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, notes, paymentMethod, transactionId }),
    });
  },

  // Alias for createOrder for backward compatibility
  async checkout(options: { 
    customerName?: string; 
    customerEmail?: string; 
    shippingAddress?: string; 
    notes?: string;
    paymentMethod?: string;
    transactionId?: string;
  } = {}) {
    return this.createOrder(options.shippingAddress, options.notes, options.paymentMethod, options.transactionId);
  },

  // Products
  async getProducts(search?: string, category?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const query = params.toString();
    const response = await apiFetch(`/student/products${query ? '?' + query : ''}`);
    return response.products || [];
  },

  // Profile
  async getProfile() {
    const response = await apiFetch('/student/profile');
    return response.profile;
  },

  async updateProfile(updates: {
    displayName?: string;
    phone?: string;
    studentId?: string;
    deliveryAddress?: string;
  }) {
    return await apiFetch('/student/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Feedback
  async submitFeedback(orderId: string, productId: string, rating: number, comment?: string) {
    return await apiFetch('/student/feedback', {
      method: 'POST',
      body: JSON.stringify({ orderId, productId, rating, comment }),
    });
  },
};

// ==================== VENDOR API ====================

export const vendorAPI = {
  // Products
  async getProducts() {
    const response = await apiFetch('/vendor/products');
    return response.products || [];
  },

  async getProduct(productId: string) {
    const response = await apiFetch(`/vendor/products/${productId}`);
    return response.product;
  },

  async addProduct(product: {
    name: string;
    price: number;
    stock: number;
    category: string;
    emoji: string;
    description?: string;
  }) {
    return await apiFetch('/vendor/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(productId: string, updates: {
    name?: string;
    price?: number;
    stock?: number;
    category?: string;
    emoji?: string;
    description?: string;
  }) {
    return await apiFetch(`/vendor/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(productId: string) {
    return await apiFetch(`/vendor/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders(status?: string) {
    const params = status ? `?status=${status}` : '';
    const response = await apiFetch(`/vendor/orders${params}`);
    return response.orders || [];
  },

  async updateOrderStatus(orderId: string, status: string) {
    return await apiFetch(`/vendor/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Inventory
  async getInventoryHistory(limit: number = 50) {
    return await apiFetch(`/vendor/inventory?limit=${limit}`);
  },

  async updateProductStock(productId: string, adjustment: number, reason?: string) {
    return await apiFetch(`/vendor/inventory/adjust`, {
      method: 'POST',
      body: JSON.stringify({ productId, adjustment, reason }),
    });
  },

  async getLowStockProducts(threshold: number = 10) {
    const response = await apiFetch(`/vendor/products?lowStock=${threshold}`);
    return response.products || [];
  },

  // Stats
  async getStats() {
    const response = await apiFetch('/vendor/stats');
    return response.stats;
  },

  // Profile
  async getProfile() {
    const response = await apiFetch('/vendor/profile');
    return response.profile;
  },

  async updateProfile(updates: {
    displayName?: string;
    phoneNum?: string;
    address?: string;
    licenseNum?: string;
  }) {
    return await apiFetch('/vendor/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};
