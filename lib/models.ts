import { ObjectId } from 'mongodb';

// Student entity
export interface Student {
  _id?: ObjectId;
  student_id?: string;
  name: string; // displayName
  email: string;
  phone?: string;
  password: string; // hashed
  hall_name?: string;
  delivery_address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User type alias for backward compatibility
export type User = Student | Admin;

// Admin entity (Vendors are admins who manage inventory)
export interface Admin {
  _id?: ObjectId;
  username: string; // displayName
  email: string;
  password: string; // hashed
  phoneNum?: string;
  address?: string;
  licenseNum?: string;
  createdAt: Date;
  updatedAt: Date;
}

// VendorProfile type (frontend compatibility)
export interface VendorProfile {
  _id?: ObjectId;
  email: string;
  displayName: string;
  phoneNum?: string;
  address?: string;
  licenseNum?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Inventory types (formerly Product)
export interface Inventory {
  _id?: ObjectId;
  product_name: string;
  category: string;
  description?: string;
  brand?: string;
  price: number;
  stock_quantity: number;
  emoji?: string; // keeping for UI
  createdAt: Date;
  updatedAt: Date;
}

// (maps to Inventory)
export interface Product {
  _id?: ObjectId;
  name: string;
  category: string;
  description?: string;
  brand?: string;
  price: number;
  stock: number;
  emoji?: string;
  vendorId?: ObjectId; // deprecated but kept for compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

// ProductInput for frontend forms
export interface ProductInput {
  name: string;
  category: string;
  description?: string;
  brand?: string;
  price: number;
  stock: number;
  emoji?: string;
}

// Cart types (keeping for student shopping)
export interface CartItem {
  _id?: ObjectId;
  student_id?: ObjectId;
  inventory_id?: ObjectId;
  product_name?: string;
  product_price?: number;
  product_emoji?: string;
  quantity: number;
  addedAt?: Date;
  // Frontend compatibility fields (added by transformation)
  studentId?: ObjectId;
  productId?: ObjectId;
  productName?: string;
  productPrice?: number;
  productEmoji?: string;
}

// WishlistItem type (frontend compatibility)
export interface WishlistItem {
  _id?: ObjectId;
  studentId: ObjectId;
  productId: ObjectId;
  productName: string;
  productPrice: number;
  productEmoji?: string;
  addedAt: Date;
}



// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  _id?: ObjectId;
  order_id: ObjectId;
  inventory_id: ObjectId;
  product_name: string;
  quantity: number;
  unit_price: number;
}

// Database Order interface (backend)
export interface Order {
  _id?: ObjectId;
  student_id?: ObjectId;
  customer_name?: string;
  customer_email?: string;
  total_amount?: number;
  order_status?: OrderStatus;
  delivery_address?: string;
  ordered_at?: Date;
  delivered_at?: Date;
  updatedAt?: Date;
  notes?: string;
  // Frontend compatibility fields (added by transformation)
  studentId?: ObjectId;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  status: OrderStatus; // Required for frontend
  deliveryAddress?: string;
  orderedAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date; // Alias for orderedAt
  items?: Array<{
    productId: ObjectId;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
  total?: number;
  orderStatus?: OrderStatus;
}

// Inventory Adjustment types (for admin management)
export interface InventoryAdjustment {
  _id?: ObjectId;
  inventory_id: ObjectId;
  product_name: string;
  admin_id?: ObjectId;
  previousStock: number;
  adjustment: number;
  newStock: number;
  reason?: string;
  createdAt: Date;
}

// Vendor/Admin stats type
export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  totalSales?: number; // Alias for totalRevenue
  pendingOrders: number;
  lowStockProducts: number;
  lowStockItems?: number; // Alias
  lowStockCount?: number; // Alias
  totalProducts?: number;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    userType: 'student' | 'admin';
  };
  token?: string;
  message?: string;
}

// Inventory Input type for creating/updating inventory
export interface InventoryInput {
  product_name: string;
  price: number;
  stock_quantity: number;
  category: string;
  brand?: string;
  emoji?: string;
  description?: string;
}

// Profile types
export interface StudentProfile {
  name: string;
  email: string;
  phone?: string;
  student_id?: string;
  delivery_address?: string;
  hall_name?: string;
}

export interface AdminProfile {
  username: string;
  email: string;
}

// Feedback types
export interface Feedback {
  _id?: ObjectId;
  student_id: ObjectId;
  inventory_id: ObjectId;
  order_id: ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

// Payment types
export type PaymentMethod = 'cash' | 'bkash';
export type PaymentStatus = 'pending' | 'completed';

export interface Payment {
  _id?: ObjectId;
  student_id: ObjectId;
  order_id: ObjectId;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  payment_date?: Date;
  transactionId?: string; // For bKash
  createdAt: Date;
  updatedAt: Date;
}
