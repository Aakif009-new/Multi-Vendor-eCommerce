# BazaarOne — Multi-Vendor Marketplace for Local Businesses

> **Empowering Local Businesses Through Digital Commerce**
>
> An enterprise-grade, university-level Multi-Vendor E-Commerce Marketplace designed to help neighborhood brick-and-mortar storefronts establish a digital presence, manage product inventory, and serve online shoppers nationwide with secure Razorpay payment processing, Cloudinary media handling, and role-based access control.

---

## 📖 Table of Contents

- [Phase 4 Final Production Architecture](#-phase-4-final-production-architecture)
- [Authentication Gate & Protected Routes](#-authentication-gate--protected-routes)
- [100-Product Catalog & Category Matrix](#-100-product-catalog--category-matrix)
- [Technology Stack (Locked)](#-technology-stack-locked)
- [Architecture & Layered Flow](#-architecture--layered-flow)
- [Monorepo Structure](#-monorepo-structure)
- [Local Development Quick Start](#-local-development-quick-start)
- [Environment Variables](#-environment-variables)
- [Database Models (MongoDB Atlas + Prisma)](#-database-models-mongodb-atlas--prisma)
- [REST API Reference](#-rest-api-reference)
- [Payment & Webhook Lifecycle](#-payment--webhook-lifecycle)
- [Security & Authorization Invariants](#-security--authorization-invariants)
- [Automated Testing Suite (15 Suites, 59 Tests)](#-automated-testing-suite)

---

## 🌟 Phase 4 Final Production Architecture

### 🔐 1. Root Authentication Gate & Route Protection
- **Root Authentication Gate (`/`):** When accessing `http://localhost:3000`, unauthenticated visitors are automatically gated and redirected to `/login`. No marketplace products, cart data, or dashboards are rendered before authenticating.
- **Role-Based Destination Routing:** Upon successful authentication, users are automatically routed to their authorized experience:
  - `CUSTOMER` $\rightarrow$ Customer Marketplace (`/`) with search, filters, wishlist, cart, orders, reviews, addresses.
  - `VENDOR` $\rightarrow$ Vendor Dashboard (`/vendor`) with product CRUD, Cloudinary image upload, inventory management, and multi-vendor order fulfillment.
  - `ADMIN` $\rightarrow$ Super Admin Console (`/admin`) with platform analytics, vendor onboarding review, catalog moderation, and taxonomy management.
- **Strict Route Barriers:** Protected routes (`/vendor`, `/admin`) block unauthorized users with locked security screens, and backend Express middleware strictly enforces `401 Unauthorized` and `403 Forbidden` statuses.

### 🛒 2. Transactions & Multi-Vendor Orders
- **Multi-Vendor Checkout:** Shoppers can add items from multiple distinct merchants to a single unified shopping cart and complete checkout in a single Razorpay payment order.
- **Price History Snapshots:** `OrderItem` records retain frozen snapshots of `productName`, `productImage`, `price`, `discountPrice`, and `vendorId` at time of purchase to ensure historical audit integrity regardless of future product updates.
- **Inventory Stock Deductions:** Real-time stock verification at checkout prevents overselling. Stock is atomically decremented (`Product.stock -= quantity`) upon verified payment confirmation.

### 💳 3. Razorpay Test Mode & Webhook Integration
- **Cryptographic Payment Verification:** Client-side Razorpay payment responses are verified on the Express backend using HMAC-SHA256 signatures (`crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)`).
- **Idempotent Webhook Processing:** Secure webhook endpoint (`POST /api/payments/webhook`) validates `x-razorpay-signature` against `RAZORPAY_WEBHOOK_SECRET` and utilizes `webhookEventId` indexing to prevent duplicate event processing.

### 🖼️ 4. Cloudinary & Pexels Asset Pipeline
- **Vendor Product Image Uploader:** Vendors can upload image files (JPEG, PNG, WebP up to 5MB) via Multer memory streaming to Cloudinary (`/api/upload/image`) with automatic thumbnail and format optimization.
- **Curated 100-Product Catalog:** 100 products mapped 1-to-1 to verified, high-resolution photography matching each product's title and category with 0 duplicate URLs.

### ⭐ 5. Verified Product Reviews
- **Purchase Verification Policy:** Only customers with a verified `DELIVERED` order item can submit a review with star ratings (1 to 5) and comments (`POST /api/reviews`).
- **Rating Aggregation:** Product average rating (`rating`) and review count (`numReviews`) are recalculated and stored on the `Product` document.

---

## 🚪 Authentication Gate & Protected Routes

| Route | Allowed Roles | Unauthenticated / Unauthorized Behavior |
| :--- | :--- | :--- |
| **`/`** | Authenticated Users | Unauthenticated visitors redirect to `/login`. |
| **`/login`** | Public | Authenticated users redirect to `/`. |
| **`/vendor`** | `VENDOR` | Non-vendors receive an "Access Restricted: Approved Vendor Account Required" security screen. |
| **`/admin`** | `ADMIN` | Non-admins receive an "Access Denied: Super Administrator Privileges Required" security screen. |

---

## 📊 100-Product Catalog & Category Matrix

The database is seeded with **exactly 100 realistic products** distributed across 12 standard categories with Indian Rupee (₹) pricing:

| # | Category Name | Slug | Product Count | Representative Items |
| :-: | :--- | :--- | :-: | :--- |
| 1 | **Electronics** | `electronics` | **12** | Active Noise-Cancelling Headphones, 4K Action Cameras, Smartwatches, Portable Bluetooth Speakers, True Wireless Earbuds, Home Projectors, 65W Power Banks, 4K Drones, E-Readers, Studio Microphones, Wi-Fi Smart Plugs, Security Cameras |
| 2 | **Computers & Accessories** | `computers-accessories` | **8** | Mechanical Keyboards, Ergonomic Vertical Mice, 12-in-1 USB-C Hubs, Aluminum Laptop Stands, 2K Webcams, 1TB Portable SSDs, Wi-Fi 6 Routers, Extended Desk Pads |
| 3 | **Men's Fashion** | `mens-fashion` | **8** | French Linen Shirts, 14oz Raw Denim Jeans, Full-Grain Oxford Dress Shoes, Supima Cotton Henleys, Polarized Sunglasses, Merino Wool Sweaters, RFID Wallets, Waxed Canvas Duffles |
| 4 | **Women's Fashion** | `womens-fashion` | **10** | Banarasi Silk Sarees, Floral Chiffon Maxi Dresses, Leather Shoulder Totes, Chanderi Kurti Sets, Cashmere Wraps, Suede Block Heel Boots, 925 Silver Earrings, Denim Trucker Jackets, Quilted Clutches, Memory Foam Ballet Flats |
| 5 | **Home & Kitchen** | `home-kitchen` | **12** | Pre-Seasoned Cast Iron Skillets, Matte Ceramic Dinnerware, 15-Bar Espresso Machines, 400TC Egyptian Cotton Bedsheets, Sheesham Spice Boxes, 5.5L Air Fryers, Cervical Contour Memory Pillows, German Chef Knife Sets, Hand-Tufted Wool Rugs, Scented Soy Candles, Gravity Water Purifiers, 1200W Nutri-Blenders |
| 6 | **Beauty & Personal Care** | `beauty-personal-care` | **8** | 2% Hyaluronic Acid Serums, Cold-Pressed Argan Oil, Anti-Hairfall Shampoos, SPF 50 Gel Sunscreens, Beard Grooming Kits, Velvet Matte Lipsticks, Green Clay Detox Masks, Sonic Electric Toothbrushes |
| 7 | **Grocery & Food** | `grocery-food` | **10** | Kashmir Mongra Saffron, Wild Forest Raw Honey, Vedic A2 Gir Cow Ghee, Arabica Whole Coffee Beans, Royal Masala Chai Tea, Himalayan Pink Salt, Cold-Pressed Coconut Oil, 72% Bean-to-Bar Dark Chocolate, California Almonds & Walnuts, Gluten-Free Rolled Oats |
| 8 | **Sports & Fitness** | `sports-fitness` | **7** | Adjustable Dumbbell Pairs, 8mm Eco-Friendly Yoga Mats, Insulated Stainless Steel Bottles, Resistance Bands Sets, Speed Cable Jump Ropes, Deep Tissue Foam Rollers, Weightlifting Wrist Wrap Gloves |
| 9 | **Books & Stationery** | `books-stationery` | **7** | 160 GSM Dotted Journals, Solid Brass Fountain Pens, Productivity Goal Planners, 36-Color Watercolor Sets, Bamboo Desk Organizers, Dual-Tip Acrylic Markers, Modern Calligraphy Kits |
| 10 | **Toys & Games** | `toys-games` | **6** | Wooden Tournament Chess Sets, 1000-Piece Jigsaw Puzzles, 14-in-1 STEM Solar Robotics Kits, Hardwood Tumbling Towers, 3D Magnetic Tiles Sets, Wooden Sling Puck Board Games |
| 11 | **Automotive** | `automotive` | **6** | 150 PSI Digital Cordless Tire Inflators, Dual 4K+1080p Dash Cams, MagSafe Car Phone Mounts, 120W Portable Car Vacuums, 800 GSM Microfiber Detailing Towels, Dual USB-C 85W Fast Car Chargers |
| 12 | **Mobile Accessories** | `mobile-accessories` | **6** | MagSafe European Leather Cases, 65W GaN Fast Wall Chargers, 2M Braided 100W USB-C Cables, 3-in-1 Wireless Charging Stands, 9H Tempered Glass Screen Protectors, 10-Inch Desktop Ring Lights |
| **TOTAL** | **12 Core Categories** | — | **100 Products** | **100% Quality Controlled** |

---

## 🛠️ Technology Stack (Locked)

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React.
- **Backend:** Node.js, Express.js, TypeScript, REST APIs.
- **Database:** MongoDB Atlas (`marketplace` cluster).
- **ORM / Database Client:** Prisma 5 (`provider = "mongodb"`).
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs password hashing (salt factor 10), HTTP-only cookies, Helmet, CORS.
- **Image Cloud Storage:** Cloudinary.
- **Asset Sourcing:** Pexels API.
- **Payment Gateway:** Razorpay Test Mode with HMAC-SHA256 verification.
- **Testing:** Jest, Supertest, ts-jest (15 test suites, 59 integration tests).

---

## 🏗️ Architecture & Layered Flow

```
Next.js Frontend (Port 3000)
    │
    ▼ (Internal Next.js rewrite proxy `/api/*` -> `http://localhost:5000/api/*`)
Express.js Backend (Port 5000)
    │
    ├── Helmet Security & CORS Middleware
    ├── JSON Body & Cookie Parsers
    ├── Route Layer (`/api/auth`, `/api/products`, `/api/orders`, `/api/payments`, `/api/reviews`, etc.)
    ├── Zod Request Validation Middleware
    ├── JWT Authentication Middleware (`authenticate`)
    ├── Role-Based Access Control Middleware (`requireRole`, `requireVendor`)
    ├── Controller Layer (Request/Response formatting)
    ├── Service Layer (Business rules, stock checks, ownership validation, Razorpay & Cloudinary)
    ├── Prisma ORM Client Singleton
    └── MongoDB Atlas Cluster (`marketplace` database)
```

---

## 📁 Monorepo Structure

```
Multi-Vendor-eCommerce/
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
├── .env.example
├── README.md
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/            # db.ts, env.ts
│   │   │   ├── controllers/       # auth, products, orders, payments, reviews, admin
│   │   │   ├── middlewares/       # auth, rbac, validation, error, upload
│   │   │   ├── routes/            # REST route definitions
│   │   │   ├── services/          # business logic, pricing, payment, seed, cloudinary
│   │   │   ├── scripts/           # reseed, QA audit, verify scripts
│   │   │   ├── utils/             # jwt, password, apiResponse, appError
│   │   │   └── app.ts, server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Prisma MongoDB Schema
│   │   ├── tests/                 # 15 Jest/Supertest test suites
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── app/               # Next.js App Router (/, /login, /vendor, /admin)
│       │   ├── components/        # UI, Marketplace, Vendor, Admin, Auth, Layout
│       │   ├── context/           # AuthContext (session management)
│       │   ├── types/             # TypeScript marketplace models
│       │   └── styles/
│       └── package.json
```

---

## ⚡ Local Development Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
- Backend: `apps/api/.env`
- Frontend: `apps/web/.env`

### 3. Generate Prisma Client & Seed 100 Products
```bash
npm run prisma:generate --workspace=apps/api
node apps/api/dist/scripts/reset-exact-100.js
```

### 4. Start Development Servers
```bash
# Terminal 1: Express Backend (Port 5000)
npm run dev --workspace=apps/api

# Terminal 2: Next.js Frontend (Port 3000)
npm run dev --workspace=apps/web
```

Open `http://localhost:3000`.

---

## 🧪 Automated Testing Suite

To run all 15 integration test suites:

```bash
npm run test --workspace=apps/api
```

### Test Suite Highlights (59 Tests Passed, 100% Pass Rate):
- `seed.test.ts`: Exactly 100 products exist across the 12-category distribution matrix.
- `inventory.test.ts`: Insufficient stock rejection, atomic stock deduction, and negative stock prevention.
- `orders.test.ts`: Multi-vendor order creation, price snapshots, vendor order isolation (`403 Forbidden` on cross-vendor edits).
- `payments.test.ts`: Razorpay order creation, authentic HMAC signature verification, forged signature rejection, idempotency.
- `webhook.test.ts`: Webhook signature verification, invalid signature rejection, duplicate event idempotency.
- `reviews.test.ts`: Verified delivered purchase policy, non-delivered rejection, rating range 1-5, duplicate review prevention, average rating calculation.
- `images.test.ts`: Cloudinary upload authorization, non-vendor rejection (`403 Forbidden`), missing file rejection.
- `pricing.test.ts`: Category-aligned Indian Rupee (₹) price ranges and discount bounds.
- `products.test.ts`: Product CRUD, pagination, vendor ownership isolation.
- `auth.test.ts`: Registration, login, admin registration rejection, password security.
- `cart.test.ts`, `wishlist.test.ts`, `addresses.test.ts`, `admin.test.ts`, `health.test.ts`.

---

## 📜 Demo Credentials for Evaluation

| Role | Email | Password | Destination |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@bazaarone.com` | `Market@123` | `/admin` (Super Admin Console) |
| **Approved Vendor** | `apex@bazaarone.com` | `Market@123` | `/vendor` (Vendor Dashboard) |
| **Customer** | `customer@bazaarone.com` | `Market@123` | `/` (Customer Marketplace) |
