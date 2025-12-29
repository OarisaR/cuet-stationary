import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Product,
  ProductInput,
  Order,
  OrderStatus,
  InventoryAdjustment,
  VendorStats,
} from "./firestore-types";

// ==================== PRODUCTS ====================

/**
 * Get all products for a vendor
 */
export const getVendorProducts = async (vendorId: string): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    // Single field query to avoid composite index requirement
    const q = query(
      productsRef,
      where("vendorId", "==", vendorId)
    );
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    
    // Sort in memory
    return products.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

/**
 * Add a new product
 */
export const addProduct = async (
  vendorId: string,
  productInput: ProductInput
): Promise<string> => {
  try {
    const productsRef = collection(db, "products");
    const now = Timestamp.now();
    const product = {
      vendorId,
      ...productInput,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(productsRef, product);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

/**
 * Update a product
 */
export const updateProduct = async (
  productId: string,
  updates: Partial<ProductInput>
): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

/**
 * Update product stock
 */
export const updateProductStock = async (
  productId: string,
  adjustment: number,
  vendorId: string,
  reason?: string
): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      throw new Error("Product not found");
    }
    
    const product = productSnap.data() as Product;
    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + adjustment);
    
    // Use batch write to update product and log adjustment
    const batch = writeBatch(db);
    
    batch.update(productRef, {
      stock: newStock,
      updatedAt: Timestamp.now(),
    });
    
    // Log the inventory adjustment
    const adjustmentRef = doc(collection(db, "inventoryAdjustments"));
    const adjustmentData: Omit<InventoryAdjustment, "id"> = {
      productId,
      productName: product.name,
      vendorId,
      previousStock,
      adjustment,
      newStock,
      reason,
      createdAt: Timestamp.now(),
    };
    batch.set(adjustmentRef, adjustmentData);
    
    await batch.commit();
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
};

// ==================== ORDERS ====================

/**
 * Get all orders for a vendor
 */
export const getVendorOrders = async (vendorId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    // Single field query only to avoid needing composite index
    const q = query(
      ordersRef,
      where("vendorId", "==", vendorId)
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    
    // Sort in memory
    return orders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    throw error;
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (
  vendorId: string,
  status: OrderStatus
): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    // Simplified query - filter in memory instead of requiring composite index
    const q = query(
      ordersRef,
      where("vendorId", "==", vendorId)
    );
    const querySnapshot = await getDocs(q);
    const allOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    
    // Filter by status and sort in memory
    return allOrders
      .filter(order => order.status === status)
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    throw error;
  }
};

/**
 * Get a single order
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }
    
    const order = { id: orderSnap.id, ...orderSnap.data() } as Order;
    
    // If status is changing to "processing", deduct stock from products
    if (status === "processing" && order.status === "pending") {
      const batch = writeBatch(db);
      
      for (const item of order.items) {
        const productRef = doc(db, "products", item.productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const product = { id: productSnap.id, ...productSnap.data() } as Product;
          const newStock = product.stock - item.quantity;
          
          // Update product stock
          batch.update(productRef, {
            stock: Math.max(0, newStock), // Ensure stock doesn't go negative
            updatedAt: Timestamp.now(),
          });
          
          // Log inventory adjustment
          const adjustmentRef = doc(collection(db, "inventoryAdjustments"));
          const adjustmentData: Omit<InventoryAdjustment, "id"> = {
            productId: item.productId,
            productName: item.productName,
            vendorId: order.vendorId,
            previousStock: product.stock,
            adjustment: -item.quantity,
            newStock: Math.max(0, newStock),
            reason: `Order #${orderId.substring(0, 8)} accepted`,
            createdAt: Timestamp.now(),
          };
          batch.set(adjustmentRef, adjustmentData);
        }
      }
      
      // Update order status
      batch.update(orderRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      
      await batch.commit();
    } else {
      // Just update order status for other transitions
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// ==================== INVENTORY ====================

/**
 * Get inventory adjustments history
 */
export const getInventoryHistory = async (
  vendorId: string,
  limit: number = 50
): Promise<InventoryAdjustment[]> => {
  try {
    const adjustmentsRef = collection(db, "inventoryAdjustments");
    // Single field query to avoid composite index
    const q = query(
      adjustmentsRef,
      where("vendorId", "==", vendorId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as InventoryAdjustment)
    );
    
    // Sort in memory and limit
    return results
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching inventory history:", error);
    throw error;
  }
};

/**
 * Get low stock products (stock <= threshold)
 */
export const getLowStockProducts = async (
  vendorId: string,
  threshold: number = 10
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    // Single field query to avoid composite index
    const q = query(
      productsRef,
      where("vendorId", "==", vendorId)
    );
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    
    // Filter and sort in memory
    return products
      .filter(product => product.stock <= threshold)
      .sort((a, b) => a.stock - b.stock);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    throw error;
  }
};

// ==================== STATS ====================

/**
 * Calculate and get vendor statistics
 */
export const getVendorStats = async (vendorId: string): Promise<VendorStats> => {
  try {
    // Get all products
    const products = await getVendorProducts(vendorId);
    
    // Get all orders
    const orders = await getVendorOrders(vendorId);
    
    // Calculate stats
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const lowStockItems = products.filter((product) => product.stock <= 10).length;
    
    return {
      vendorId,
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      lowStockItems,
      lastUpdated: Timestamp.now(),
    };
  } catch (error) {
    console.error("Error calculating vendor stats:", error);
    throw error;
  }
};

// ==================== DEMO DATA SEEDING ====================

/**
 * Seed initial demo data for a vendor (call once)
 */
export const seedVendorDemoData = async (vendorId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Demo products
    const demoProducts = [
      { name: "Premium Notebook", price: 5.99, stock: 45, category: "Notebooks", emoji: "📓", description: "High-quality ruled notebook with 200 pages" },
      { name: "Pen Set (10pcs)", price: 3.5, stock: 5, category: "Pens", emoji: "✏️", description: "Smooth writing gel pens in assorted colors" },
      { name: "Geometry Set", price: 8.0, stock: 2, category: "Tools", emoji: "📐", description: "Complete geometry set with compass and protractor" },
      { name: "Color Markers", price: 6.25, stock: 30, category: "Art", emoji: "🖍️", description: "Vibrant markers for art and design" },
      { name: "Sticky Notes", price: 2.99, stock: 3, category: "Accessories", emoji: "📝", description: "Colorful sticky notes in various sizes" },
      { name: "Calculator", price: 12.0, stock: 20, category: "Tools", emoji: "🔢", description: "Scientific calculator for complex calculations" },
    ];
    
    const now = Timestamp.now();
    const productIds: string[] = [];
    
    for (const product of demoProducts) {
      const productRef = doc(collection(db, "products"));
      productIds.push(productRef.id);
      batch.set(productRef, {
        vendorId,
        ...product,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    // Demo orders
    const demoOrders = [
      {
        customerId: "demo_customer_1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        items: [
          { productId: productIds[0], productName: "Premium Notebook", productEmoji: "📓", quantity: 2, price: 5.99, subtotal: 11.98 },
          { productId: productIds[1], productName: "Pen Set (10pcs)", productEmoji: "✏️", quantity: 1, price: 3.5, subtotal: 3.5 },
        ],
        totalAmount: 15.48,
        status: "pending" as OrderStatus,
      },
      {
        customerId: "demo_customer_2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        items: [
          { productId: productIds[3], productName: "Color Markers", productEmoji: "🖍️", quantity: 1, price: 6.25, subtotal: 6.25 },
        ],
        totalAmount: 6.25,
        status: "processing" as OrderStatus,
      },
      {
        customerId: "demo_customer_3",
        customerName: "Bob Johnson",
        customerEmail: "bob@example.com",
        items: [
          { productId: productIds[5], productName: "Calculator", productEmoji: "🔢", quantity: 1, price: 12.0, subtotal: 12.0 },
          { productId: productIds[2], productName: "Geometry Set", productEmoji: "📐", quantity: 1, price: 8.0, subtotal: 8.0 },
        ],
        totalAmount: 20.0,
        status: "shipped" as OrderStatus,
      },
    ];
    
    for (const order of demoOrders) {
      const orderRef = doc(collection(db, "orders"));
      batch.set(orderRef, {
        vendorId,
        ...order,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    await batch.commit();
    console.log("Demo data seeded successfully");
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
};
