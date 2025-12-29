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
  Timestamp,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order, OrderItem, OrderStatus } from "./firestore-types";

// ==================== CART ====================

export interface CartItem {
  id: string;
  studentId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productEmoji: string;
  quantity: number;
  vendorId: string;
  addedAt: Timestamp;
}

/**
 * Get student's cart items
 */
export const getCartItems = async (studentId: string): Promise<CartItem[]> => {
  try {
    const cartRef = collection(db, "cart");
    const q = query(cartRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CartItem));
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (
  studentId: string,
  product: Product,
  quantity: number = 1
): Promise<string> => {
  try {
    // Check if item already exists in cart
    const existingItems = await getCartItems(studentId);
    const existingItem = existingItems.find((item) => item.productId === product.id);

    if (existingItem) {
      // Update quantity if item exists
      await updateDoc(doc(db, "cart", existingItem.id), {
        quantity: existingItem.quantity + quantity,
      });
      return existingItem.id;
    } else {
      // Add new cart item
      const cartItem: Omit<CartItem, "id"> = {
        studentId,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productEmoji: product.emoji,
        quantity,
        vendorId: product.vendorId,
        addedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, "cart"), cartItem);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartQuantity = async (
  cartItemId: string,
  quantity: number
): Promise<void> => {
  try {
    if (quantity <= 0) {
      await deleteDoc(doc(db, "cart", cartItemId));
    } else {
      await updateDoc(doc(db, "cart", cartItemId), { quantity });
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartItemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "cart", cartItemId));
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (studentId: string): Promise<void> => {
  try {
    const cartItems = await getCartItems(studentId);
    const batch = writeBatch(db);
    cartItems.forEach((item) => {
      batch.delete(doc(db, "cart", item.id));
    });
    await batch.commit();
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// ==================== WISHLIST ====================

export interface WishlistItem {
  id: string;
  studentId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productEmoji: string;
  vendorId: string;
  addedAt: Timestamp;
}

/**
 * Get student's wishlist
 */
export const getWishlist = async (studentId: string): Promise<WishlistItem[]> => {
  try {
    const wishlistRef = collection(db, "wishlist");
    const q = query(wishlistRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WishlistItem));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};

/**
 * Add item to wishlist
 */
export const addToWishlist = async (
  studentId: string,
  product: Product
): Promise<string> => {
  try {
    // Check if already in wishlist
    const existing = await getWishlist(studentId);
    const exists = existing.find((item) => item.productId === product.id);
    if (exists) {
      return exists.id;
    }

    const wishlistItem: Omit<WishlistItem, "id"> = {
      studentId,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productEmoji: product.emoji,
      vendorId: product.vendorId,
      addedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "wishlist"), wishlistItem);
    return docRef.id;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

/**
 * Remove from wishlist
 */
export const removeFromWishlist = async (wishlistItemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "wishlist", wishlistItemId));
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

/**
 * Check if product is in wishlist
 */
export const isInWishlist = async (
  studentId: string,
  productId: string
): Promise<boolean> => {
  try {
    const wishlist = await getWishlist(studentId);
    return wishlist.some((item) => item.productId === productId);
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};

// ==================== ORDERS ====================

/**
 * Get student's orders
 */
export const getStudentOrders = async (studentId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("customerId", "==", studentId));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    return orders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching student orders:", error);
    throw error;
  }
};

/**
 * Create order from cart
 */
export const createOrderFromCart = async (
  studentId: string,
  studentName: string,
  studentEmail: string,
  shippingAddress?: string
): Promise<string> => {
  try {
    const cartItems = await getCartItems(studentId);
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Group items by vendor
    const itemsByVendor = cartItems.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = [];
      }
      acc[item.vendorId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    const batch = writeBatch(db);
    const orderIds: string[] = [];

    // Create one order per vendor
    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      const orderItems: OrderItem[] = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productEmoji: item.productEmoji,
        quantity: item.quantity,
        price: item.productPrice,
        subtotal: item.productPrice * item.quantity,
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      const orderRef = doc(collection(db, "orders"));
      const order: Omit<Order, "id"> = {
        vendorId,
        customerId: studentId,
        customerName: studentName,
        customerEmail: studentEmail,
        items: orderItems,
        totalAmount,
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...(shippingAddress && { shippingAddress }),
      };
      batch.set(orderRef, order);
      orderIds.push(orderRef.id);

      // Delete cart items
      items.forEach((item) => {
        batch.delete(doc(db, "cart", item.id));
      });
    }

    await batch.commit();
    return orderIds[0]; // Return first order ID
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// ==================== PRODUCTS ====================

/**
 * Get all available products (from all vendors)
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    const products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    return products
      .filter(p => p.stock > 0) // Only show in-stock items
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Get single product
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
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
 * Search products
 */
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    return products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

// ==================== STUDENT PROFILE ====================

export interface StudentProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  phone?: string;
  studentId?: string;
  deliveryAddress?: string;
  createdAt: any;
}

/**
 * Get student profile from users collection
 */
export const getStudentProfile = async (studentId: string): Promise<StudentProfile | null> => {
  try {
    const docRef = doc(db, "users", studentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StudentProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

/**
 * Update student profile in users collection
 */
export const saveStudentProfile = async (
  studentId: string,
  profileData: {
    displayName?: string;
    phone?: string;
    studentId?: string;
    deliveryAddress?: string;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, "users", studentId);
    // Use setDoc with merge to create or update
    await setDoc(docRef, profileData, { merge: true });
  } catch (error) {
    console.error("Error saving student profile:", error);
    throw error;
  }
};
