# CUET Online Stationery 📚✏️

A comprehensive e-commerce platform for CUET students to browse, order, and receive stationery items, with a complete vendor management system. Built with Next.js and Firebase.

## 🌟 Overview

**CUET Online Stationery** connects CUET students with campus vendors, enabling seamless ordering and delivery of stationery items including pens, notebooks, lab materials, and art supplies directly at campus halls or designated pickup points.

The platform features **two distinct portals**:
- **Student Portal** - Browse products, manage cart/wishlist, place orders, track deliveries
- **Vendor Portal** - Manage products, inventory, orders, and view business analytics

---

## 🚀 Features

### Student Portal
- 🛍️ **Shop** - Browse all available products with category filters (Notebooks, Pens, Tools, Art, Accessories)
- 🔍 **Search** - Find products by name, category, or description
- 🛒 **Shopping Cart** - Add items, update quantities, proceed to checkout
- ❤️ **Wishlist** - Save favorite items for later
- 📦 **Order Tracking** - View order history with real-time status updates
- 📊 **Dashboard** - Quick overview of active orders and featured products

### Vendor Portal
- ➕ **Product Management** - Add, edit, delete products with emoji-based images
- 📊 **Dashboard** - View sales statistics, pending orders, and low stock alerts
- 📦 **Order Management** - Process orders and update status (pending → processing → shipped → delivered)
- 📈 **Inventory Tracking** - Monitor stock levels, receive low stock alerts, log inventory adjustments
- 🎯 **Demo Data** - One-click seed sample products for testing

---

## 🛠️ Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Language:** TypeScript
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** CSS Modules
- **State Management:** React Hooks (useState, useEffect)

---

## 📁 Project Structure

```
cuet-stationary-app/
├── app/                          # Next.js app router
│   ├── student/                  # Student portal pages
│   │   ├── dashboard/
│   │   ├── shop/
│   │   ├── cart/
│   │   ├── wishlist/
│   │   ├── orders/
│   │   └── profile/
│   └── vendor/                   # Vendor portal pages
│       ├── dashboard/
│       ├── products/
│       ├── orders/
│       ├── inventory/
│       └── profile/
├── components/                   # Reusable components
│   ├── UserNavbar.tsx           # Student navigation
│   └── VendorNavbar.tsx         # Vendor navigation
├── lib/                          # Core business logic
│   ├── firebase.ts              # Firebase configuration
│   ├── auth.ts                  # Authentication logic
│   ├── firestore-types.ts       # TypeScript interfaces
│   ├── vendor-service.ts        # Vendor CRUD operations
│   └── student-service.ts       # Student CRUD operations
└── pages/                        # Legacy page components
    ├── student/                  # Student components
    └── vendor/                   # Vendor components
```

---

## 🔥 Firebase Setup

### Collections Structure

#### **products**
```typescript
{
  id: string
  name: string
  description: string
  price: number
  category: string
  emoji: string              // 📓 📐 ✏️ 🖍️ etc.
  stock: number
  vendorId: string
  vendorName: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### **orders**
```typescript
{
  id: string
  customerId: string          // Student ID
  vendorId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### **cart**
```typescript
{
  id: string
  studentId: string
  productId: string
  productName: string
  productPrice: number
  productEmoji: string
  quantity: number
  vendorId: string
  addedAt: Timestamp
}
```

#### **wishlist**
```typescript
{
  id: string
  studentId: string
  productId: string
  productName: string
  productPrice: number
  productEmoji: string
  vendorId: string
  addedAt: Timestamp
}
```

#### **inventoryAdjustments**
```typescript
{
  id: string
  productId: string
  vendorId: string
  oldStock: number
  newStock: number
  change: number
  reason: string
  adjustedAt: Timestamp
}
```

### Firestore Rules (Basic)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read products
    match /products/{product} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Restrict to vendor in production
    }
    
    // Cart - students can only access their own cart
    match /cart/{item} {
      allow read, write: if request.auth != null && 
                           resource.data.studentId == request.auth.uid;
    }
    
    // Wishlist - students can only access their own wishlist
    match /wishlist/{item} {
      allow read, write: if request.auth != null && 
                           resource.data.studentId == request.auth.uid;
    }
    
    // Orders - users can access their own orders
    match /orders/{order} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null; // Restrict to vendor in production
    }
    
    // Inventory adjustments
    match /inventoryAdjustments/{adjustment} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Firebase configuration (from Firebase Console)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cuet-stationery.git
   cd cuet-stationery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create `lib/firebase.ts` with your Firebase config:
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 👤 User Roles & Authentication

### Vendor Account
- **Email:** vendor@cuet.com
- **Password:** (set during account creation)
- Redirects to `/vendor/dashboard`

### Student Account
- **Email:** Any email NOT in the vendor list
- **Password:** (set during account creation)
- Redirects to `/student/dashboard`

The system automatically detects the role based on email and routes accordingly.

---

## 📖 Usage Guide

### For Vendors

1. **Login** with vendor@cuet.com
2. **Seed Demo Data** (first-time only)
   - Navigate to Dashboard
   - Click "Seed Demo Data" button
   - Sample products will be created
3. **Add Products**
   - Go to Products → Add Product
   - Enter details (name, price, stock, category, emoji)
   - Submit to create
4. **Manage Orders**
   - View pending orders in Dashboard
   - Navigate to Orders page
   - Update order status (pending → processing → shipped → delivered)
5. **Track Inventory**
   - Monitor stock levels in Inventory page
   - Receive low stock alerts (≤10 items)
   - Log inventory adjustments with reasons

### For Students

1. **Create Account** (any email except vendor@cuet.com)
2. **Browse Shop**
   - View all available products
   - Filter by category
   - Search by keyword
3. **Add to Cart**
   - Select products and quantities
   - Items saved to Firebase cart
4. **Manage Wishlist**
   - Save favorite items
   - Move items to cart when ready
5. **Checkout**
   - Review cart items
   - Place order (auto-splits by vendor)
   - Cart clears automatically
6. **Track Orders**
   - View order history
   - Filter by status
   - Monitor delivery progress

---

## 🔑 Key Services

### Vendor Service (`lib/vendor-service.ts`)
- `getVendorProducts()` - Fetch vendor's products
- `addProduct()` - Create new product
- `updateProduct()` - Edit existing product
- `deleteProduct()` - Remove product
- `getVendorOrders()` - Fetch vendor's orders
- `updateOrderStatus()` - Change order status
- `updateProductStock()` - Adjust inventory
- `getLowStockProducts()` - Get products with stock ≤10
- `getVendorStats()` - Calculate sales statistics
- `seedVendorDemoData()` - Generate sample products

### Student Service (`lib/student-service.ts`)
- `getAllProducts()` - Fetch all in-stock products
- `searchProducts()` - Search by query
- `getCartItems()` - Fetch student's cart
- `addToCart()` - Add product to cart
- `updateCartQuantity()` - Update cart item quantity
- `removeFromCart()` - Remove cart item
- `clearCart()` - Empty entire cart
- `getWishlist()` - Fetch student's wishlist
- `addToWishlist()` - Add product to wishlist
- `removeFromWishlist()` - Remove wishlist item
- `getStudentOrders()` - Fetch student's orders
- `createOrderFromCart()` - Place order from cart

---

## ⚡ Performance Optimizations

### Firebase Free Tier Considerations
- **No Firebase Storage** - Using emojis for product images (📓📐✏️)
- **No Composite Indexes** - Single-field queries with client-side filtering/sorting
- **Efficient Queries** - All queries filtered by vendorId/studentId first
- **Minimal Reads** - Data cached in component state

### Query Patterns
```typescript
// ❌ Requires composite index
const q = query(
  collection(db, 'products'),
  where('vendorId', '==', vendorId),
  where('stock', '<=', 10),
  orderBy('stock', 'asc')
);

// ✅ Free tier friendly
const q = query(
  collection(db, 'products'),
  where('vendorId', '==', vendorId)
);
const products = await getDocs(q);
const lowStock = products.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(p => p.stock <= 10)
  .sort((a, b) => a.stock - b.stock);
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Vendor redirects to student dashboard**
- Solution: Check `lib/auth.ts` - vendor@cuet.com should be in `VENDOR_EMAILS` array

**2. Firestore composite index errors**
- Solution: All queries use single where() clause with client-side sorting

**3. Products not showing in shop**
- Solution: Ensure products have `stock > 0` in Firestore

**4. Orders not appearing for vendor**
- Solution: Check that order's `vendorId` matches vendor's user ID

**5. Cart items disappearing**
- Solution: Verify student is logged in and cart items have correct `studentId`

---

## 📝 Testing Checklist

### Vendor Flow
- [ ] Login redirects to vendor dashboard
- [ ] Seed demo data creates products
- [ ] Add new product appears in products list
- [ ] Edit product updates successfully
- [ ] Delete product removes from list
- [ ] Orders show in dashboard and orders page
- [ ] Update order status reflects changes
- [ ] Low stock alerts appear in dashboard
- [ ] Inventory adjustments logged properly

### Student Flow
- [ ] Login redirects to student dashboard
- [ ] Products appear in shop
- [ ] Category filters work
- [ ] Search finds products
- [ ] Add to cart saves items
- [ ] Cart quantities update
- [ ] Wishlist saves items
- [ ] Checkout creates orders
- [ ] Orders appear in orders page
- [ ] Order statuses display correctly

---

## 🚧 Known Limitations

- Image upload not supported (using emojis on free Firebase tier)
- Payment integration not implemented (cash on delivery assumed)
- No real-time notifications (requires Firebase Cloud Messaging)
- Basic role system (only vendor@cuet.com vs everyone else)
- No admin super-user panel
- Single vendor support per order (no multi-vendor carts merged)

---

## 🔮 Future Enhancements

- [ ] Real-time order notifications
- [ ] Payment gateway integration (bKash, SSLCommerz)
- [ ] Multi-vendor cart consolidation
- [ ] Advanced search with filters (price range, brand)
- [ ] Product reviews and ratings
- [ ] Discount codes and promotions
- [ ] Email order confirmations
- [ ] Admin panel for platform management
- [ ] Image upload with Firebase Storage
- [ ] Mobile app (React Native)

---

## 👥 Team

- **Dipannita Paul Orni** (ID: 2104125)
- **Umme Sanjida** (ID: 2104126)
- **Oarisa Rebayet** (ID: 2104129)

---

## 📄 License

This project is created for academic purposes at CUET.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions, please create an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for CUET Students**
