import { ObjectId } from 'mongodb';

// User types
export type UserRole = 'student' | 'vendor';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  displayName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  // Student-specific
  phone?: string;
  studentId?: string;
  deliveryAddress?: string;
  // Vendor-specific
  phoneNum?: string;
  address?: string;
  licenseNum?: string;
}

// Product types
export interface Product {
  _id?: ObjectId;
  vendorId: ObjectId;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cart types
export interface CartItem {
  _id?: ObjectId;
  studentId: ObjectId;
  productId: ObjectId;
  productName: string;
  productPrice: number;
  productEmoji: string;
  quantity: number;
  vendorId: ObjectId;
  addedAt: Date;
}

// Wishlist types
export interface WishlistItem {
  _id?: ObjectId;
  studentId: ObjectId;
  productId: ObjectId;
  productName: string;
  productPrice: number;
  productEmoji: string;
  vendorId: ObjectId;
  addedAt: Date;
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: ObjectId;
  productName: string;
  productEmoji: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id?: ObjectId;
  vendorId: ObjectId;
  customerId: ObjectId;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: string;
  notes?: string;
}

// Inventory Adjustment types
export interface InventoryAdjustment {
  _id?: ObjectId;
  productId: ObjectId;
  productName: string;
  vendorId: ObjectId;
  previousStock: number;
  adjustment: number;
  newStock: number;
  reason?: string;
  createdAt: Date;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
  };
  token?: string;
  message?: string;
}

// Product Input type for creating/updating products
export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
  description?: string;
}

// Profile types
export interface StudentProfile {
  displayName: string;
  email: string;
  phone?: string;
  studentId?: string;
  deliveryAddress?: string;
}

export interface VendorProfile {
  displayName: string;
  email: string;
  phoneNum?: string;
  address?: string;
  licenseNum?: string;
}

// Stats types
export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalSales?: number; // Alias for totalRevenue
  lowStockCount: number;
  lowStockItems?: number; // Alias for lowStockCount
  pendingOrders?: number;
}

// Feedback types
export interface Feedback {
  _id?: ObjectId;
  studentId: ObjectId;
  vendorId: ObjectId;
  orderId: ObjectId;
  productId: ObjectId;
  rating: number; // 1-5
  comment?: string; // Optional
  createdAt: Date;
}

// Payment types
export type PaymentMethod = 'cash' | 'bkash';
export type PaymentStatus = 'pending' | 'completed';

export interface Payment {
  _id?: ObjectId;
  studentId: ObjectId;
  vendorId: ObjectId;
  orderId: ObjectId;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  transactionId?: string; // For bKash
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
