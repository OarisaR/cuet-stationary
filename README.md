# CUET Stationary App 📚✏️

A full-stack e-commerce platform for university stationary supplies built with Next.js 16, MongoDB Atlas, and TypeScript. The application supports two user roles: **Students** (buyers) and **Vendors** (sellers).

## 🚀 Tech Stack

- **Frontend**: Next.js 16.0.1 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Styling**: CSS Modules + Tailwind CSS
- **Type Safety**: Full TypeScript implementation

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
   
   Create/edit `.env.local` file in the root directory:
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
│   │   │   ├── orders/          # Order management (GET, GET/:id, PUT/:id/cancel)
│   │   │   ├── products/        # Product browsing (GET, GET/:id, GET/search, GET/low-stock)
│   │   │   └── wishlist/        # Wishlist operations (GET, POST, DELETE)
│   │   └── vendor/              # Vendor API endpoints (13 routes)
│   │       ├── inventory/       # Inventory management (GET)
│   │       ├── orders/          # Order fulfillment (GET, GET/:id, PUT/:id/status)
│   │       ├── products/        # Product CRUD (GET, POST, GET/:id, PUT/:id, DELETE/:id)
│   │       └── stats/           # Vendor analytics (GET)
│   │
│   ├── student/                 # Student route pages (wrappers)
│   │   ├── cart/page.tsx        # Shopping cart page
│   │   ├── dashboard/page.tsx   # Student dashboard
│   │   ├── orders/page.tsx      # Order history
│   │   ├── profile/page.tsx     # User profile
│   │   ├── shop/page.tsx        # Product catalog
│   │   ├── wishlist/page.tsx    # Saved items
│   │   └── layout.tsx           # Student layout wrapper
│   │
│   ├── vendor/                  # Vendor route pages (wrappers)
│   │   ├── dashboard/page.tsx   # Vendor analytics dashboard
│   │   ├── inventory/page.tsx   # Stock management
│   │   ├── orders/page.tsx      # Order fulfillment
│   │   ├── products/            # Product management
│   │   │   ├── page.tsx         # Product list
│   │   │   └── add/page.tsx     # Add new product
│   │   ├── profile/page.tsx     # Vendor profile
│   │   └── layout.tsx           # Vendor layout wrapper
│   │
│   ├── signin/page.tsx          # Sign in page
│   ├── signup/page.tsx          # Sign up page
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── pages/                        # Component implementations (actual UI logic)
│   ├── student/                 # Student components
│   │   ├── Cart.tsx             # Cart component with add/remove/update
│   │   ├── Cart.css
│   │   ├── Dashboard.tsx        # Student dashboard with stats
│   │   ├── Dashboard.css
│   │   ├── Orders.tsx           # Order history and tracking
│   │   ├── Orders.css
│   │   ├── Profile.tsx          # Profile management
│   │   ├── Profile.css
│   │   ├── Shop.tsx             # Product browsing with search/filter
│   │   ├── Shop.css
│   │   ├── Wishlist.tsx         # Wishlist management
│   │   └── Wishlist.css
│   │
│   ├── vendor/                  # Vendor components
│   │   ├── AddProduct.tsx       # Add/edit product form
│   │   ├── AddProduct.css
│   │   ├── Dashboard.tsx        # Vendor analytics (revenue, orders, products)
│   │   ├── Dashboard.css
│   │   ├── VendorInventory.tsx  # Stock level monitoring
│   │   ├── VendorInventory.css
│   │   ├── VendorOrders.tsx     # Order fulfillment interface
│   │   ├── VendorOrders.css
│   │   ├── VendorProducts.tsx   # Product list with edit/delete
│   │   ├── VendorProducts.css
│   │   ├── VendorProfile.tsx    # Vendor profile settings
│   │   └── VendorProfile.css
│   │
│   ├── Home.tsx                 # Landing page component
│   ├── Home.css
│   ├── Login.tsx                # Login form component
│   ├── Login.css
│   ├── Signup.tsx               # Registration form component
│   ├── Signup.css
│   ├── About.tsx                # About page component
│   ├── About.css
│   ├── Contact.tsx              # Contact page component
│   ├── Contact.css
│   └── MainPage.tsx             # Main layout wrapper
│
├── components/                   # Shared/reusable components
│   ├── LandingNavbar.tsx        # Public navigation bar
│   ├── LandingNavbar.css
│   ├── UserNavbar.tsx           # Student navigation bar
│   ├── UserNavbar.css
│   ├── VendorNavbar.tsx         # Vendor navigation bar
│   ├── VendorNavbar.css
│   ├── Footer.tsx               # Footer component
│   └── Footer.css
│
├── lib/                          # Core utilities and services
│   ├── mongodb.ts               # MongoDB connection utility (singleton pattern)
│   ├── api-client.ts            # Frontend API client (28 methods)
│   ├── models.ts                # TypeScript type definitions
│   ├── jwt.ts                   # JWT token generation/verification
│   ├── auth-context.tsx         # React Context for authentication state
│   ├── firestore-types.ts       # Legacy type definitions (to be removed)
│   ├── student-service.ts       # Legacy service (to be removed)
│   └── vendor-service.ts        # Legacy service (to be removed)
│
├── scripts/                      # Utility scripts
│   ├── test-connection.ts       # MongoDB connection test
│   └── create-vendor.ts         # Vendor account creation script
│
├── public/                       # Static assets (images, icons, etc.)
│
├── .env.local                    # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── next-env.d.ts                # Next.js TypeScript declarations
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### 🗂️ Folder Details

#### `/app` - Next.js App Router
The core of the application using Next.js 13+ App Router convention. Contains:
- **API Routes**: All backend endpoints organized by domain (auth, student, vendor)
- **Page Routes**: React Server Components that define routes (student/*, vendor/*)
- **Layouts**: Shared layouts for different user roles

#### `/pages` - Component Implementations
Contains the actual React component logic (client components). While the `/app` folder defines routes, `/pages` holds the functional components that are imported and rendered by those routes. This separation allows for better code organization.

#### `/components` - Shared UI Components
Reusable components used across multiple pages:
- Navigation bars for different user types (landing, student, vendor)
- Footer component
- Future: Buttons, modals, form inputs, etc.

#### `/lib` - Core Libraries
Business logic and utility functions:
- **mongodb.ts**: Database connection management with connection pooling
- **api-client.ts**: Type-safe API client for frontend (wraps fetch calls)
- **models.ts**: TypeScript interfaces/types for all data models
- **jwt.ts**: Authentication token handling (sign, verify)
- **auth-context.tsx**: React Context for managing global auth state

#### `/scripts` - Utility Scripts
Helper scripts for development and testing:
- Database connection testing
- Admin account creation
- Data seeding (future)

#### `/public` - Static Assets
Publicly accessible files served at the root URL:
- Images, icons, logos
- Fonts (if not using next/font)
- manifest.json, robots.txt

---

## 🚀 Features

### Student Portal
- 🛍️ **Shop** - Browse all available products with category filters
- 🔍 **Search** - Find products by name or category
- 🛒 **Shopping Cart** - Add items, update quantities, checkout
- ❤️ **Wishlist** - Save favorite items for later
- 📦 **Order Tracking** - View order history with real-time status
- 📊 **Dashboard** - Quick overview of active orders

### Vendor Portal
- ➕ **Product Management** - Add, edit, delete products
- 📊 **Dashboard** - View sales statistics and pending orders
- 📦 **Order Management** - Process orders and update status
- 📈 **Inventory Tracking** - Monitor stock levels and low stock alerts
- 💰 **Analytics** - Revenue tracking and business insights

---

## 📚 API Documentation

### Authentication Endpoints (3)

- **POST** `/api/auth/signup` - Register new user (student/vendor)
  - Body: `{ email, password, name, role }`
  - Returns: `{ token, user }`
  
- **POST** `/api/auth/login` - Login and receive JWT token
  - Body: `{ email, password }`
  - Returns: `{ token, user }`
  
- **GET** `/api/auth/me` - Get current user info
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }`

### Student Endpoints (10 routes)

**Products**
- **GET** `/api/student/products` - Get all products
- **GET** `/api/student/products/:id` - Get single product
- **GET** `/api/student/products/search?query=...` - Search products
- **GET** `/api/student/products/low-stock` - Get low stock items

**Cart**
- **GET** `/api/student/cart` - Get user's cart
- **POST** `/api/student/cart` - Add item to cart
- **PUT** `/api/student/cart` - Update cart item quantity
- **DELETE** `/api/student/cart/:productId` - Remove item

**Orders**
- **POST** `/api/student/checkout` - Create order from cart
- **GET** `/api/student/orders` - Get order history
- **GET** `/api/student/orders/:id` - Get order details
- **PUT** `/api/student/orders/:id/cancel` - Cancel order

**Wishlist**
- **GET** `/api/student/wishlist` - Get wishlist
- **POST** `/api/student/wishlist` - Add to wishlist
- **DELETE** `/api/student/wishlist/:productId` - Remove from wishlist

### Vendor Endpoints (13 routes)

**Products**
- **GET** `/api/vendor/products` - Get vendor's products
- **POST** `/api/vendor/products` - Create product
- **GET** `/api/vendor/products/:id` - Get product
- **PUT** `/api/vendor/products/:id` - Update product
- **DELETE** `/api/vendor/products/:id` - Delete product

**Orders**
- **GET** `/api/vendor/orders` - Get vendor's orders
- **GET** `/api/vendor/orders/:id` - Get order details
- **PUT** `/api/vendor/orders/:id/status` - Update order status

**Inventory**
- **GET** `/api/vendor/inventory` - Get inventory overview

**Analytics**
- **GET** `/api/vendor/stats` - Get vendor statistics

---

## 🔐 Authentication Flow

1. User signs up via `/api/auth/signup` (role: 'student' or 'vendor')
2. User logs in via `/api/auth/login` and receives JWT token
3. Token stored in localStorage and sent in Authorization header
4. Protected routes validate token via JWT middleware
5. User info accessible via `/api/auth/me` endpoint

**Token Details:**
- Expires in 7 days
- Contains: userId, email, name, role
- Verified using JWT_SECRET from environment

---

## 🧪 Testing

### Test Accounts

**Vendor Account:**
- Email: vendor@cuet.com
- Password: vendor123

**Student Account:**
- Create your own via signup page

### Test Database Connection
```bash
npx tsx scripts/test-connection.ts
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check `.env.local` file exists
- Verify MONGODB_URI is correct
- Ensure IP whitelist includes your IP in MongoDB Atlas

**JWT Token Invalid**
- Check JWT_SECRET is set in `.env.local`
- Token may be expired (7-day limit)
- Clear localStorage and login again

**TypeScript Errors**
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart dev server

**API Routes Not Found**
- Ensure Next.js dev server is running
- Check file structure in `app/api/` folder

---

## 🚀 Deployment

### Environment Variables (Production)
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_key
```

### Vercel Deployment
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

---

## ️ Development Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

---

## 📞 Support

For issues or questions, please create an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for CUET Students**
