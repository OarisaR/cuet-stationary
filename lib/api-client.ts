// API Client for Next.js Backend


import type { Product, Inventory } from './models';

const API_BASE_URL = '/api';


// Backend uses new schema (product_name, stock_quantity, etc.) but frontend still expects old Product interface
function transformInventoryToProduct(inventory: any): Product {
  return {
    _id: inventory._id,
    name: inventory.product_name || inventory.name,
    price: inventory.price,
    stock: inventory.stock_quantity !== undefined ? inventory.stock_quantity : inventory.stock,
    category: inventory.category,
    emoji: inventory.emoji,
    description: inventory.description,
    brand: inventory.brand,
    vendorId: inventory.vendorId, // Keep for backward compatibility
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt,
  };
}

function transformProductToInventoryInput(product: any): any {
  return {
    name: product.name,
    stock: product.stock,
    price: product.price,
    category: product.category || 'General',
    emoji: product.emoji || '📦',
    description: product.description || '',
    brand: product.brand,
  };
}

function transformCartItem(item: any): any {
  return {
    _id: item._id,
    studentId: item.student_id,
    productId: item.inventory_id,
    productName: item.product_name,
    productPrice: item.product_price,
    productEmoji: item.product_emoji,
    quantity: item.quantity,
    addedAt: item.addedAt,
  };
}

function transformWishlistItem(item: any): any {
  return {
    _id: item._id,
    studentId: item.student_id,
    productId: item.inventory_id,
    productName: item.product_name,
    productPrice: item.product_price,
    productEmoji: item.product_emoji,
    addedAt: item.addedAt,
  };
}

function transformOrder(order: any): any {
  return {
    _id: order._id,
    studentId: order.student_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    items: (order.items || []).map((item: any) => {
      const unitPrice = item.unit_price || item.product_price || 0;
      const quantity = item.quantity || 0;
      return {
        productId: item.inventory_id,
        productName: item.product_name,
        productEmoji: item.product_emoji || '📦',
        productPrice: unitPrice,
        price: unitPrice, // Alias for VendorOrders component
        quantity: quantity,
        subtotal: unitPrice * quantity,
        feedback: item.feedback || null, // Include feedback if present
      };
    }),
    total: order.total_amount,
    totalAmount: order.total_amount,
    status: order.order_status || 'pending',
    orderStatus: order.order_status || 'pending',
    deliveryAddress: order.delivery_address,
    notes: order.notes,
    orderedAt: order.ordered_at,
    deliveredAt: order.delivered_at,
    createdAt: order.ordered_at,
    updatedAt: order.updatedAt,
  };
}

function transformStudentProfile(profile: any): any {
  return {
    _id: profile._id,
    email: profile.email,
    displayName: profile.name || profile.displayName,
    phone: profile.phone,
    studentId: profile.student_id,
    hallName: profile.hall_name,
    deliveryAddress: profile.delivery_address,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function transformVendorProfile(profile: any): any {
  return {
    _id: profile._id,
    email: profile.email,
    displayName: profile.name || profile.displayName,
    phoneNum: profile.phoneNum || profile.phone,
    address: profile.address,
    licenseNum: profile.licenseNum,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

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
      body: JSON.stringify({ email, password, name: displayName }),
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
    const items = response.items || [];
    return items.map(transformCartItem);
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
    const items = response.items || [];
    return items.map(transformWishlistItem);
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
    const orders = response.orders || [];
    return orders.map(transformOrder);
  },

  async createOrder(shippingAddress?: string, notes?: string, paymentMethod?: string, transactionId?: string) {
    return await apiFetch('/student/orders', {
      method: 'POST',
      body: JSON.stringify({ deliveryAddress: shippingAddress, notes, paymentMethod, transactionId }),
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
    const products = response.products || [];
    return products.map(transformInventoryToProduct);
  },

  // Profile
  async getProfile() {
    const response = await apiFetch('/student/profile');
    return transformStudentProfile(response.profile);
  },

  async updateProfile(updates: {
    displayName?: string;
    phone?: string;
    studentId?: string;
    hallName?: string;
    deliveryAddress?: string;
  }) {
    // Transform to new schema field names
    const transformedUpdates: any = {};
    if (updates.displayName !== undefined) transformedUpdates.name = updates.displayName;
    if (updates.phone !== undefined) transformedUpdates.phone = updates.phone;
    if (updates.studentId !== undefined) transformedUpdates.student_id = updates.studentId;
    if (updates.hallName !== undefined) transformedUpdates.hall_name = updates.hallName;
    if (updates.deliveryAddress !== undefined) transformedUpdates.delivery_address = updates.deliveryAddress;
    
    console.log('Updating profile with:', transformedUpdates);
    
    return await apiFetch('/student/profile', {
      method: 'PATCH',
      body: JSON.stringify(transformedUpdates),
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
    const products = response.products || [];
    return products.map(transformInventoryToProduct);
  },

  async getProduct(productId: string) {
    const response = await apiFetch(`/vendor/products/${productId}`);
    return transformInventoryToProduct(response.product);
  },

  async addProduct(product: {
    name: string;
    price: number;
    stock: number;
    category: string;
    emoji?: string;
    description?: string;
    brand?: string;
  }) {
    const inventoryInput = transformProductToInventoryInput(product);
    return await apiFetch('/vendor/products', {
      method: 'POST',
      body: JSON.stringify(inventoryInput),
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
    const inventoryUpdates = transformProductToInventoryInput(updates);
    return await apiFetch(`/vendor/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(inventoryUpdates),
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
    const orders = response.orders || [];
    return orders.map(transformOrder);
  },

  async updateOrderStatus(orderId: string, status: string) {
    return await apiFetch(`/vendor/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Inventory
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
    return transformVendorProfile(response.profile);
  },

  async updateProfile(updates: {
    displayName?: string;
    phoneNum?: string;
    address?: string;
    licenseNum?: string;
  }) {
    // Transform to new schema field names
    const transformedUpdates: any = {};
    if (updates.displayName) transformedUpdates.name = updates.displayName;
    if (updates.phoneNum) transformedUpdates.phoneNum = updates.phoneNum;
    if (updates.address) transformedUpdates.address = updates.address;
    if (updates.licenseNum) transformedUpdates.licenseNum = updates.licenseNum;
    
    return await apiFetch('/vendor/profile', {
      method: 'PATCH',
      body: JSON.stringify(transformedUpdates),
    });
  },
};
