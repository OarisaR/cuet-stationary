# CUET Stationary App 

A full-stack e-commerce platform for university stationary supplies built with Next.js 15, MongoDB, and TypeScript. The application supports two user roles: **Students** (customers) and **Admins** (vendors/sellers who manage the shared inventory).

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB with normalized schema
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Styling**: CSS Modules with vintage-themed custom styling
- **Type Safety**: Full TypeScript implementation
- **Icons**: React Icons

---

## ✨ Features

### For Students
- 🔐 **Authentication**: Secure signup/login with JWT
- 🛍️ **Product Browsing**: Browse products with search and category filters
- 🛒 **Shopping Cart**: Add/update/remove items from cart
- 📦 **Order Management**: Place orders and track their status (pending → processing → shipped → delivered)
- 📍 **Profile Management**: Update delivery address, phone number, student ID, and hall name
- ⭐ **Feedback System**: Rate and review delivered products
- 📋 **Order History**: View active and past orders with detailed item information

### For Admins (Vendors)
- 🔐 **Authentication**: Secure admin login
- 📊 **Dashboard**: Real-time statistics (total revenue, orders, pending orders, low stock items)
- 📦 **Inventory Management**: Add, edit, delete, and restock products
- 🎯 **Order Processing**: View all orders, update order status, see customer feedback
- 📈 **Sales Tracking**: Track total sales from completed orders
- ⚠️ **Low Stock Alerts**: Quick access to products needing restocking
- 🔄 **Stock Adjustments**: Log all inventory changes with reasons

### Shared Features
- 🎨 **Vintage Theme**: Consistent vintage stationary aesthetic across all pages
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔔 **Real-time Updates**: Automatic refresh of data when navigating between pages
- 🚫 **Error Handling**: User-friendly error messages and validation

---

## 📁 Project Structure

```
cuet-stationary-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── me/
│   │   ├── student/              # Student-specific endpoints
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── profile/
│   │   │   └── feedback/
│   │   └── vendor/               # Admin/Vendor endpoints
│   │       ├── products/
│   │       ├── orders/
│   │       ├── inventory/
│   │       ├── profile/
│   │       └── stats/
│   ├── signin/                   # Login page
│   ├── signup/                   # Registration page
│   ├── student/                  # Student dashboard pages
│   │   ├── dashboard/
│   │   ├── shop/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── profile/
│   └── vendor/                   # Admin/Vendor dashboard pages
│       ├── dashboard/
│       ├── products/
│       ├── inventory/
│       ├── orders/
│       └── profile/
├── components/                   # React components
│   ├── Footer.tsx
│   ├── LandingNavbar.tsx
│   ├── UserNavbar.tsx
│   └── VendorNavbar.tsx
├── lib/                          # Core utilities
│   ├── api-client.ts            # API client with data transformations
│   ├── auth-context.tsx         # Authentication context
│   ├── jwt.ts                   # JWT utilities
│   ├── models.ts                # TypeScript interfaces
│   └── mongodb.ts               # MongoDB connection
├── pages/                        # Page components (used by app router)
│   ├── student/                 # Student page components
│   └── vendor/                  # Vendor page components
└── public/                       # Static assets
```

---

## 🗄️ Database Schema

### Collections

#### **students**
```typescript
{
  _id: ObjectId
  student_id: string          // University student ID
  name: string                // Display name
  email: string               // Login email
  password: string            // Hashed password
  phone: string               // Contact number
  hall_name: string           // Residential hall
  delivery_address: string    // Delivery location
  createdAt: Date
  updatedAt: Date
}
```

#### **admins**
```typescript
{
  _id: ObjectId
  username: string            // Display name
  email: string               // Login email
  password: string            // Hashed password
  phoneNum: string
  address: string
  licenseNum: string          // Business license
  createdAt: Date
  updatedAt: Date
}
```

#### **inventory**
```typescript
{
  _id: ObjectId
  product_name: string
  category: string
  description: string
  emoji: string               // Product icon
  price: number
  stock_quantity: number
  brand: string (optional)
  createdAt: Date
  updatedAt: Date
}
```

#### **orders**
```typescript
{
  _id: ObjectId
  student_id: ObjectId        // Reference to students
  customer_name: string
  customer_email: string
  total_amount: number
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  delivery_address: string
  ordered_at: Date
  delivered_at: Date          // Set when status = 'delivered'
  notes: string (optional)
  updatedAt: Date
}
```

#### **order_items**
```typescript
{
  _id: ObjectId
  order_id: ObjectId          // Reference to orders
  inventory_id: ObjectId      // Reference to inventory
  product_name: string
  quantity: number
  unit_price: number
}
```

#### **cart**
```typescript
{
  _id: ObjectId
  student_id: ObjectId        // Reference to students
  inventory_id: ObjectId      // Reference to inventory
  product_name: string
  product_price: number
  product_emoji: string
  quantity: number
}
```

#### **feedbacks**
```typescript
{
  _id: ObjectId
  student_id: ObjectId        // Reference to students
  order_id: ObjectId          // Reference to orders
  inventory_id: ObjectId      // Reference to inventory
  rating: number              // 1-5 stars
  comment: string (optional)
  createdAt: Date
}
```

#### **payments**
```typescript
{
  _id: ObjectId
  student_id: ObjectId
  order_id: ObjectId
  payment_method: 'cash' | 'bkash'
  payment_status: 'pending' | 'completed'
  amount: number
  transactionId: string (optional)
  payment_date: Date
  createdAt: Date
  updatedAt: Date
}
```

#### **inventoryAdjustments**
```typescript
{
  _id: ObjectId
  inventory_id: ObjectId
  product_name: string
  admin_id: ObjectId
  previousStock: number
  adjustment: number          // Can be negative (sale) or positive (restock)
  newStock: number
  reason: string
  createdAt: Date
}
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cuet-stationary-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_secret_key_here
   ```

4. **Test database connection**
   ```bash
   npx tsx scripts/test-connection.ts
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)


---

## 📁 Project Structure

```
cuet-stationary-app/
│
├── app/                          # Next.js App Router (v13+)
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/           # POST /api/auth/login
│   │   │   ├── signup/          # POST /api/auth/signup
│   │   │   └── me/              # GET /api/auth/me
│   │   ├── student/             # Student API endpoints (10 routes)
│   │   │   ├── cart/            # Cart operations (GET, POST, PUT, DELETE)
│   │   │   ├── checkout/        # POST checkout order

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Landing page with signup/login options
   - Student portal: `/student/dashboard`
   - Admin portal: `/vendor/dashboard`

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (student or admin)
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user information

### Student Endpoints
- `GET /api/student/products` - Browse products with search/filters
- `GET /api/student/cart` - Get cart items
- `POST /api/student/cart` - Add item to cart
- `PATCH /api/student/cart/:id` - Update cart item quantity
- `DELETE /api/student/cart/:id` - Remove item from cart
- `POST /api/student/orders` - Place order from cart
- `GET /api/student/orders` - Get order history
- `GET /api/student/profile` - Get profile
- `PATCH /api/student/profile` - Update profile
- `POST /api/student/feedback` - Submit product feedback

### Admin/Vendor Endpoints
- `GET /api/vendor/stats` - Get dashboard statistics
- `GET /api/vendor/products` - Get all products
- `POST /api/vendor/products` - Add new product
- `GET /api/vendor/products/:id` - Get product details
- `PATCH /api/vendor/products/:id` - Update product
- `DELETE /api/vendor/products/:id` - Delete product
- `GET /api/vendor/orders` - Get all orders
- `PATCH /api/vendor/orders/:id` - Update order status
- `GET /api/vendor/inventory` - Get low stock items
- `GET /api/vendor/profile` - Get vendor profile
- `PATCH /api/vendor/profile` - Update vendor profile

---

## 🎨 Design System

### Color Palette
- **Primary (Teal)**: `rgb(111, 164, 175)` - Main brand color
- **Secondary (Slate)**: `#5a6c7d` - Text and borders
- **Accent (Coral)**: `rgb(217, 125, 85)` - Highlights and CTAs
- **Background**: Gradient from `rgb(244, 233, 215)` to `rgb(250, 245, 235)`
- **Success**: `#10b981` - Positive actions
- **Warning**: `#f59e0b` - Alerts and ratings

### Typography
- **Headers**: Playfair Display (serif) - vintage aesthetic
- **Body**: Poppins (sans-serif) - modern readability
- **Weights**: 400 (regular), 600 (semi-bold), 700 (bold), 800 (extra-bold)

### UI Components
- **Borders**: 2px solid with theme colors
- **Shadows**: 3px 3px 0px offset shadows for depth
- **Buttons**: No border-radius (sharp corners for vintage feel)
- **Cards**: Elevated with shadows, hover effects
- **Forms**: Labeled inputs with validation feedback

---

## 🔐 Authentication Flow

### Student Registration
1. User fills signup form (name, email, password, student ID, phone)
2. Password is hashed using bcrypt
3. User document created in `students` collection
4. JWT token generated with `userType: 'student'`
5. Token stored in localStorage
6. Redirect to student dashboard

### Admin Registration
1. Admin fills signup form (username, email, password, license number)
2. Password is hashed using bcrypt
3. Admin document created in `admins` collection
4. JWT token generated with `userType: 'admin'`
5. Token stored in localStorage
6. Redirect to admin dashboard

### Login
1. User enters email and password
2. System checks both `students` and `admins` collections
3. Password verified with bcrypt
4. JWT token generated with appropriate `userType`
5. Token stored in localStorage
6. Redirect to respective dashboard

### Protected Routes
- All API routes verify JWT token
- Frontend uses AuthContext to manage authentication state
- Unauthorized requests return 401 status
- Expired tokens trigger re-login

---

## 📦 Order Lifecycle

### 1. Order Placement (Student)
- Student adds items to cart
- Reviews cart and proceeds to checkout
- System validates delivery address (must be set in profile)
- Selects payment method (Cash on Delivery or bKash)
- Order created with status: `pending`
- Cart cleared after successful order
- Payment record created with status: `pending`

### 2. Order Processing (Admin)
- Admin views order in pending orders list
- Clicks "Start Processing"
- Status changes to `processing`
- Inventory automatically deducted for each item
- Inventory adjustments logged

### 3. Order Shipping
- Admin marks order as `shipped`
- Status visible to student
- Student can track order status

### 4. Order Delivery
- Admin marks order as `delivered`
- `delivered_at` timestamp set
- Payment status changed to `completed`
- Student can now submit feedback for each item

### 5. Feedback Submission
- Student rates product (1-5 stars)
- Optional comment
- Feedback saved and visible to admin
- "Give Feedback" button replaced with rating display

---

## 🛠️ Data Transformation Layer

The application uses a transformation layer in `lib/api-client.ts` to handle field name conversion between backend (snake_case) and frontend (camelCase):

### Backend → Frontend
```typescript
// Database: product_name, stock_quantity, unit_price
// Frontend: productName, stock, price
```

### Transformation Functions
- `transformInventoryToProduct()` - Inventory → Product
- `transformProductToInventoryInput()` - Product → Inventory
- `transformOrder()` - Order with items enrichment
- `transformCartItem()` - Cart data normalization
- `transformStudentProfile()` - Student data mapping
- `transformVendorProfile()` - Admin data mapping

This ensures:
- Database uses consistent snake_case naming
- Frontend uses JavaScript-standard camelCase
- TypeScript provides type safety at both layers
- Easy to maintain and extend

---

## 🚀 Deployment

### Environment Variables
Ensure the following are set in production:
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret_key
NODE_ENV=production
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deployment Platforms
- **Vercel**: Recommended (built for Next.js)
  ```bash
  vercel deploy
  ```
- **Railway**: Easy deployment with MongoDB Atlas
- **Netlify**: Alternative with serverless functions
- **Docker**: Container deployment option

### MongoDB Atlas Setup
1. Create cluster
2. Configure network access (allow application IP)
3. Create database user
4. Get connection string
5. Add to environment variables

---

## 🧪 Testing

### Test Database Connection
```bash
npx tsx scripts/test-connection.ts
```

### Manual Testing Checklist
- [ ] Student signup and login
- [ ] Admin signup and login
- [ ] Product browsing and search
- [ ] Add to cart, update quantities
- [ ] Place order with delivery address
- [ ] Admin view orders
- [ ] Admin update order status
- [ ] Inventory deduction on processing
- [ ] Order delivered timestamp set
- [ ] Student submit feedback
- [ ] Feedback visible to admin
- [ ] Product CRUD operations
- [ ] Profile updates (student and admin)
- [ ] Dashboard statistics accuracy

---

## 🐛 Known Issues & Limitations

- No image upload for products (uses emojis instead)
- No email notifications for orders
- Single admin manages all inventory (no multi-vendor separation)
- No order cancellation after processing
- No refund system
- Payment verification manual (for bKash)

---


## 📝 License

This project is licensed under the MIT License.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or support, please contact: [your-email@example.com]

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the flexible database
- React Icons for the icon library
- CUET for project inspiration

