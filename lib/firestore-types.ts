import { Timestamp } from "firebase/firestore";

// Product types
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductInput {
  name: string;
  price: number;
  stock: number;
  category: string;
  emoji: string;
  description?: string;
}

// Order types
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  productEmoji: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shippingAddress?: string;
  notes?: string;
}

// Inventory adjustment types
export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  previousStock: number;
  adjustment: number;
  newStock: number;
  reason?: string;
  createdAt: Timestamp;
}

// Analytics/Stats types
export interface VendorStats {
  vendorId: string;
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockItems: number;
  lastUpdated: Timestamp;
}
