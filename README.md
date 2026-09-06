# BazaarOne

### A Modern Multi-Vendor Marketplace for Local & Independent Businesses

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19.2-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-7.6.0-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-5.22.0-indigo?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-80%20Passed%20(17%20Suites)-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![CI Quality Gate](https://img.shields.io/badge/CI-GitHub_Actions-blue?style=flat-square&logo=githubactions)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

BazaarOne is a full-stack, multi-tenant e-commerce platform engineered to bridge physical neighborhood storefronts with digital consumer markets. Built on Next.js 14, Express.js, TypeScript, and MongoDB Atlas via Prisma ORM, BazaarOne provides an end-to-end marketplace experience featuring role-based portals for customers, vendors, and platform administrators, multi-vendor cart and checkout routing, cryptographically verified Razorpay sandbox payments, Cloudinary media processing, and automated testing.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why BazaarOne](#2-why-bazaarone)
3. [Problem Statement](#3-problem-statement)
4. [Solution](#4-solution)
5. [Core Features](#5-core-features)
6. [Customer Features](#6-customer-features)
7. [Vendor Features](#7-vendor-features)
8. [Admin Features](#8-admin-features)
9. [Multi-Vendor Architecture](#9-multi-vendor-architecture)
10. [Technology Stack](#10-technology-stack)
11. [System Architecture](#11-system-architecture)
12. [Authentication & RBAC](#12-authentication--rbac)
13. [Security](#13-security)
14. [Cart, Orders & Inventory](#14-cart-orders--inventory)
15. [Razorpay Test Mode Payment Flow](#15-razorpay-test-mode-payment-flow)
16. [Cloudinary & Pexels Image Pipeline](#16-cloudinary--pexels-image-pipeline)
17. [Database Architecture](#17-database-architecture)
18. [API Overview](#18-api-overview)
19. [Project Structure](#19-project-structure)
20. [Local Development Setup](#20-local-development-setup)
21. [Environment Variables](#21-environment-variables)
22. [Testing & Quality Assurance](#22-testing--quality-assurance)
23. [Deployment Architecture](#23-deployment-architecture)
24. [Demo Credentials](#24-demo-credentials)
25. [Screenshots / UI Preview](#25-screenshots--ui-preview)
26. [Future Improvements](#26-future-improvements)
27. [Team / Contributors](#27-team--contributors)
28. [License](#28-license)

---

## 1. Project Overview

BazaarOne is designed to support decentralized multi-vendor digital commerce. Rather than restricting buyers to single-store orders, BazaarOne enables shoppers to discover items across multiple distinct neighborhood merchants, aggregate them into a unified shopping cart, and complete a single payment transaction. The platform automatically decomposes the transaction into vendor-isolated order items, preserving historical price snapshots and providing each vendor with dedicated fulfillment workflows.

The system is architected as a clean monorepo comprising a Next.js 14 App Router frontend (`apps/web`), an Express.js TypeScript REST API (`apps/api`), and a shared Prisma database schema (`prisma/schema.prisma`) connected to MongoDB Atlas.

---

## 2. Why BazaarOne

Traditional e-commerce platforms often impose high commission overheads and complex onboarding procedures that alienate independent and neighborhood merchants. Conversely, standalone store builders require individual sellers to manage their own hosting, traffic generation, and payment compliance.

BazaarOne addresses this gap by offering:
- **Unified Discovery:** A shared marketplace catalog where independent merchants gain collective visibility.
- **Low Operational Overhead:** Built-in storefront management, asset processing, and order lifecycle tracking.
- **Enterprise-Grade Security:** Robust cryptographic payment verification, strict role-based access control, and complete data isolation between competing vendors.
- **Frictionless Shopping:** Multi-vendor cart consolidation with transparent delivery status per merchant item.

---

## 3. Problem Statement

Neighborhood brick-and-mortar merchants face significant structural hurdles when transitioning to digital commerce:
1. **Catalog Fragmentation:** Individual stores lack the technical resources to deploy and maintain custom e-commerce infrastructure.
2. **Order Management Complexity:** Multi-vendor transactions typically require complex backend logic to distribute order items, track independent fulfillment states, and manage inventory deductions.
3. **Data Security & Privacy:** In a shared database environment, unauthorized cross-vendor data leakage (IDOR/BOLA) poses serious operational and privacy risks.
4. **Payment Reconciliation:** Ensuring payment authenticity and idempotency without race conditions or stock overselling requires strict cryptographic controls.

---

## 4. Solution

BazaarOne provides a production-grade multi-vendor platform featuring:
- **Dedicated Portals:** Tailored user interfaces for Customers (`/`), Vendors (`/vendor`), and Super Administrators (`/admin`).
- **Atomic Multi-Vendor Checkout:** Single-transaction checkout that partitions into vendor-specific `OrderItem` records with immutable price snapshots.
- **Strict Data Isolation:** Controller- and service-level verification ensuring vendors can only access, edit, and fulfill their own catalog items and assigned orders.
- **Cryptographic Payment Integrity:** HMAC-SHA256 signature verification for client payment payloads and incoming Razorpay webhooks.
- **Automated Media Pipelines:** Direct-to-cloud image streaming via Multer and Cloudinary with automatic optimization.

---

## 5. Core Features

- **Multi-Tenant Domain Model:** Full separation of Customer, Vendor, and Administrator concerns across all database queries and endpoints.
- **Dynamic Catalog Engine:** Multi-parameter search, category filtering, price range filters, and sorting algorithms.
- **Synchronized Cart & Wishlist:** Persistent, user-bound cart and wishlist state with real-time stock and catalog status checks.
- **Multi-Address Management:** Multiple shipping addresses per customer with default selection for expedited checkout.
- **Vendor Storefronts:** Dedicated vendor profile pages displaying merchant information, ratings, and catalog inventory.
- **Governance & Approvals:** Administrative controls for reviewing vendor applications, toggling catalog taxonomies, and managing platform accounts.

---

## 6. Customer Features

| Feature | Description |
| :--- | :--- |
| **Catalog Discovery** | Browse products across 12 standard categories with live search, price filtering, and sorting. |
| **Vendor Store Profiles** | View individual vendor stores, merchant contact details, business locations, and ratings. |
| **Persistent Cart** | Add products from multiple vendors into a single persistent shopping cart with inventory validation. |
| **Wishlist Management** | Save favorite items to a persistent wishlist with one-click migration to the shopping cart. |
| **Multi-Address Book** | Save, edit, and designate default shipping addresses with ownership security. |
| **Single-Click Checkout** | Complete multi-vendor purchases using Razorpay Test Mode modal with instant payment verification. |
| **Order History & Timeline** | View detailed purchase history, individual vendor fulfillment milestones, and frozen price snapshots. |
| **Verified Purchase Reviews** | Submit 1–5 star reviews with comments exclusively for delivered order items. |

---

## 7. Vendor Features

| Feature | Description |
| :--- | :--- |
| **Merchant Dashboard** | Dedicated console (`/vendor`) displaying revenue, order counts, product metrics, and store status. |
| **Product CRUD** | Create, edit, and delete products with SKU, category, brand, pricing, and discount attributes. |
| **Cloudinary Media Upload** | Upload high-resolution product photography via memory-streamed Cloudinary processing. |
| **Inventory Management** | Update stock counts and monitor low-stock thresholds in real time. |
| **Isolated Order Fulfillment** | View and update status (`CONFIRMED` $\rightarrow$ `PACKED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`) strictly for assigned order items. |
| **Storefront Customization** | Manage store description, business address, contact telephone, logo, and banner assets. |

---

## 8. Admin Features

| Feature | Description |
| :--- | :--- |
| **Governance Console** | Centralized Super Admin console (`/admin`) with aggregate system metrics and health overview. |
| **Vendor Application Review** | Review incoming merchant applications; approve or reject with audit notes. |
| **User & Vendor Management** | Search, filter, and modify account statuses (`ACTIVE`, `SUSPENDED`, `INACTIVE`) across all platform users. |
| **Taxonomy Management** | Create and manage categories and brand entities with active/inactive visibility toggles. |
| **Platform Analytics** | Real-time counts of users, approved vendors, active products, pending applications, and taxonomy items. |

---

## 9. Multi-Vendor Architecture

In a multi-vendor marketplace, a single customer checkout often contains products originating from multiple independent merchants. BazaarOne handles this via a parent-child order decomposition pattern:

```mermaid
graph TD
    A[Customer Shopping Cart] -->|Contains Items from Vendor A & Vendor B| B[Initiate Checkout]
    B --> C[Validate Stock & Calculate Totals]
    C --> D[Create Razorpay Test Order]
    D --> E[Customer Payment in Sandbox]
    E --> F[Backend HMAC-SHA256 Verification]
    F --> G[Parent Order: CONFIRMED / PAID]
    G --> H[OrderItem 1: Vendor A / Status: PENDING]
    G --> I[OrderItem 2: Vendor B / Status: PENDING]
    H --> J[Vendor A Dashboard: Pack & Ship Item 1]
    I --> K[Vendor B Dashboard: Pack & Ship Item 2]
```

### Architectural Guarantees:
1. **Price Freezing:** `OrderItem` records store immutable snapshots of `productName`, `productImage`, `price`, `discountPrice`, and `vendorId` at the moment of purchase. Subsequent vendor price changes do not alter historical orders.
2. **Independent Status Lifecycles:** Each vendor transitions their specific `OrderItem` through fulfillment stages (`CONFIRMED` $\rightarrow$ `PACKED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`) without affecting items from other vendors.
3. **Atomic Stock Decrement:** Upon successful payment verification, inventory counts for all purchased items are atomically decremented in a single transaction sequence.

---

## 10. Technology Stack

### Frontend Application (`apps/web`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `14.2.35` | React Framework (App Router, Server & Client Components, Route Rewrites) |
| **React** | `18.3.1` | UI Component Rendering & State Management |
| **TypeScript** | `5.4.5` | Static Type Safety across UI Components and Services |
| **Tailwind CSS** | `3.4.3` | Utility-First Responsive Styling System |
| **Lucide React** | `1.39.0` | Accessible Icon Library |
| **clsx / tailwind-merge** | `2.1.1 / 3.6.0` | Dynamic Class Composition and Conflict Resolution |

### Backend API (`apps/api`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `20.x` | Server Runtime Environment |
| **Express.js** | `4.19.2` | REST API Routing, Middleware Pipeline, and Request Handling |
| **TypeScript** | `5.4.5` | End-to-End Type Safety for Controllers, Services, and Utilities |
| **Prisma ORM** | `5.22.0` | Type-Safe Database Client for MongoDB Atlas |
| **MongoDB Atlas** | `7.6.0` | Cloud Document Database Cluster |
| **jsonwebtoken** | `9.0.3` | Signed JWT Issuance and Verification |
| **bcryptjs** | `3.0.3` | Secure Password Hashing (Salt Factor 10) |
| **cookie-parser** | `1.4.7` | Signed HTTP-Only Cookie Parser |
| **Helmet** | `8.3.0` | HTTP Security Header Hardening |
| **CORS** | `2.8.5` | Cross-Origin Resource Sharing Configuration |
| **Zod** | `4.5.4` | Request Payload Validation Schemas |
| **express-rate-limit** | `8.7.0` | Rate Limiting for Public, Auth, and Payment Endpoints |
| **Multer** | `2.3.0` | Memory Storage File Upload Streaming |
| **Cloudinary SDK** | `2.11.0` | Cloud Media Asset Management & CDN Optimization |
| **Razorpay SDK** | `2.9.8` | Payment Gateway Integration (Test Mode) |
| **Axios** | `1.20.0` | External HTTP Client for Media Pipelines |

### Testing & Quality Assurance
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Jest** | `30.5.1` | Test Runner & Assertion Framework |
| **Supertest** | `7.2.2` | HTTP Endpoint Integration Testing |
| **ts-jest** | `29.4.12` | TypeScript Preprocessor for Jest |

---

## 11. System Architecture

```mermaid
flowchart TD
    Client["Browser Client / Next.js 14 Frontend<br/>Port 3000"]
    Proxy["Next.js API Rewrite Proxy<br/>/api/* -> http://localhost:5000/api/*"]
    API["Express.js REST API<br/>Port 5000"]
    
    subgraph Middlewares["Express Middleware Pipeline"]
        MW1["Helmet & CORS Security"]
        MW2["Rate Limiting (Global / Auth / Payments)"]
        MW3["JSON & Cookie Parsers"]
        MW4["JWT Authentication (authenticate)"]
        MW5["Role & Vendor RBAC (requireRole, requireVendor)"]
        MW6["Zod Schema Validation (validate)"]
    end

    subgraph ServiceLayer["Business Logic & Service Layer"]
        AuthSvc["AuthService"]
        ProductSvc["ProductService"]
        OrderSvc["OrderService"]
        PaymentSvc["PaymentService"]
        ReviewSvc["ReviewService"]
        AdminSvc["AdminService"]
        VendorSvc["VendorService"]
        CloudSvc["CloudinaryService"]
    end

    subgraph Storage["Data & External Services"]
        Prisma["Prisma ORM Client (Singleton)"]
        Mongo[("MongoDB Atlas Database<br/>marketplace")]
        Cloudinary[("Cloudinary Media CDN")]
        Razorpay[("Razorpay Payment Gateway<br/>Test Mode Sandbox")]
    end

    Client --> Proxy --> API
    API --> Middlewares --> ServiceLayer
    ServiceLayer --> Prisma --> Mongo
    ServiceLayer --> Cloudinary
    ServiceLayer --> Razorpay
```

---

## 12. Authentication & RBAC

BazaarOne implements a dual-mode JWT authentication architecture supporting both standard `Authorization: Bearer <token>` headers and signed HTTP-only cookies (`token`).

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: Visit Application
    Unauthenticated --> Login: Redirect to /login
    Login --> CustomerSession: Login as CUSTOMER
    Login --> VendorSession: Login as VENDOR (Approved)
    Login --> AdminSession: Login as ADMIN
    
    CustomerSession --> CustomerPortal: Route to / (Marketplace)
    VendorSession --> VendorDashboard: Route to /vendor (Merchant Console)
    AdminSession --> AdminConsole: Route to /admin (Governance Console)
```

### Route & Resource Access Matrix

| Route / Resource | Required Role | Unauthenticated Behavior | Unauthorized Behavior |
| :--- | :--- | :--- | :--- |
| **`/`** (Marketplace) | `CUSTOMER`, `VENDOR`, `ADMIN` | Redirect to `/login` | N/A |
| **`/vendor`** (Merchant Portal) | `VENDOR` | Redirect to `/login` | Access Restricted (403 Forbidden Screen) |
| **`/admin`** (Super Admin Console) | `ADMIN` | Redirect to `/login` | Access Denied (403 Forbidden Screen) |
| **`POST /api/products`** | `VENDOR` | `401 Unauthorized` | `403 Forbidden` (Pending or Non-Vendor) |
| **`PUT /api/orders/items/:id/status`** | `VENDOR` | `401 Unauthorized` | `403 Forbidden` (Non-owner vendor) |
| **`GET /api/admin/*`** | `ADMIN` | `401 Unauthorized` | `403 Forbidden` |
| **`POST /api/reviews`** | `CUSTOMER` (Owner of delivered item) | `401 Unauthorized` | `403 Forbidden` |

### Account Status Lifecycle
- **`ACTIVE`:** Normal operational state with full permissions.
- **`PENDING` (Vendors):** Registered vendor awaiting Super Admin approval; restricted from product creation and sales.
- **`SUSPENDED`:** Account blocked from authentication; middleware immediately rejects active tokens.
- **`INACTIVE`:** Decommissioned account.

---

## 13. Security

BazaarOne incorporates multiple defense-in-depth security controls across the frontend, middleware, and database layers:

1. **Cryptographic Payment Verification:**
   - Client-side payment confirmations must provide `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature`.
   - The backend validates the signature using HMAC-SHA256:
     $$\text{HMAC-SHA256}(\text{razorpayOrderId} \parallel "|" \parallel \text{razorpayPaymentId}, \text{RAZORPAY\_KEY\_SECRET})$$
   - Comparison uses `crypto.timingSafeEqual` to prevent timing attacks.

2. **Webhook Verification & Idempotency:**
   - Incoming webhooks (`POST /api/payments/webhook`) verify `x-razorpay-signature` against `RAZORPAY_WEBHOOK_SECRET`.
   - Processed events are recorded in the `Payment` collection using `webhookEventId` to prevent duplicate processing.

3. **IDOR & BOLA Protection:**
   - **Addresses:** Customers can only view, update, or delete addresses where `address.userId === req.user.id`.
   - **Orders:** Order detail views verify `order.userId === req.user.id`. Cross-customer order lookups return `403 Forbidden`.
   - **Vendor Ownership:** Product updates/deletions and order item status changes verify `resource.vendorId === req.vendor.id`.

4. **Inventory & Race Condition Safeguards:**
   - Pre-checkout validation confirms available stock for all cart items.
   - Post-payment stock reduction utilizes atomic decrements (`Product.stock -= quantity`).

5. **HTTP & Network Hardening:**
   - **Helmet:** Sets secure HTTP response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
   - **Environment-Aware CORS:** Restricts origin access in production to verified client domains while allowing test suites to execute without origin headers.
   - **Tiered Rate Limiting:** Global limiter (600 req/15 min), Auth limiter (50 req/15 min), and Payment limiter (60 req/15 min).
   - **Safe Payload Caps:** Request body parsers limited to 5MB to prevent memory exhaustion denial-of-service.

---

## 14. Cart, Orders & Inventory

### Cart Mechanics
- Each customer possesses a single `Cart` document containing an array of `CartItem` records.
- Adding an item validates that the requested quantity does not exceed current stock (`Product.stock`).
- If an item is already present in the cart, the quantity is updated rather than duplicated (`@@unique([cartId, productId])`).

### Order Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> PENDING: Checkout Initiated
    PENDING --> CONFIRMED: Payment Signature Verified
    PENDING --> FAILED: Invalid Signature / Payment Error
    CONFIRMED --> PROCESSING: Vendor Acknowledges Order
    PROCESSING --> SHIPPED: Carrier Dispatches Item
    SHIPPED --> DELIVERED: Customer Receives Package
    CONFIRMED --> CANCELLED: Order Cancellation
    PROCESSING --> CANCELLED: Order Cancellation
```

---

## 15. Razorpay Test Mode Payment Flow

> **Note on Payment Processing:** Razorpay is configured exclusively in **Test / Sandbox Mode**. No real financial transactions are executed. Test card and UPI credentials are used for evaluation and automated integration testing.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Browser)
    participant Web as Next.js Frontend
    participant API as Express API
    participant RZP as Razorpay Sandbox API
    participant DB as MongoDB Atlas

    Customer->>Web: Click "Proceed to Checkout"
    Web->>API: POST /api/orders/checkout (addressId)
    API->>DB: Validate Cart Stock & Calculate Total
    API->>RZP: Create Order (amount, currency: INR)
    RZP-->>API: Return razorpayOrderId
    API->>DB: Save Order (status: PENDING, paymentStatus: PENDING)
    API-->>Web: Return orderId, razorpayOrderId, keyId
    Web->>Customer: Open Razorpay Checkout Modal
    Customer->>RZP: Complete Test Payment (UPI / Card)
    RZP-->>Web: Return paymentId, signature
    Web->>API: POST /api/orders/confirm (orderId, razorpayPaymentId, razorpaySignature)
    API->>API: Verify HMAC-SHA256 Signature (timingSafeEqual)
    alt Valid Signature
        API->>DB: Decrement Product Stock (Atomic)
        API->>DB: Update Order (status: CONFIRMED, paymentStatus: PAID)
        API->>DB: Clear Customer Cart
        API-->>Web: Payment Confirmed (Status 200)
        Web->>Customer: Display Order Confirmation & Timeline
    else Forged / Invalid Signature
        API->>DB: Record Failed Payment Record
        API-->>Web: 400 Bad Request (Invalid Transaction)
    end
```

---

## 16. Cloudinary & Pexels Image Pipeline

1. **Vendor Image Upload Flow:**
   - Vendors upload product imagery through the merchant portal via `POST /api/upload/image`.
   - Multer intercepts the multipart payload into an in-memory buffer without writing temporary files to disk.
   - The buffer is streamed directly to Cloudinary (`bazaarone/products`) with automated optimization transformations (`quality: auto`, `fetch_format: auto`, `max-width: 1000px`).
   - Cloudinary returns a secure HTTPS CDN URL that is saved to the product's `images` array.

2. **Automated Catalog Seeding Pipeline:**
   - The catalog seeder (`apps/api/src/services/seed.service.ts`) queries the Pexels API for category-aligned imagery matching product definitions.
   - Retrieved images are ingested into Cloudinary (`bazaarone/catalog`) and associated with seeded products to guarantee authentic, high-resolution photography with fallback resilience.

---

## 17. Database Architecture

BazaarOne utilizes **MongoDB Atlas** managed via the **Prisma ORM** (`provider = "mongodb"`).

```mermaid
erDiagram
    User ||--o| Vendor : "owns"
    User ||--o{ VendorApplication : "submits"
    User ||--o{ Address : "saves"
    User ||--o| Cart : "owns"
    User ||--o| Wishlist : "owns"
    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"

    Vendor ||--o{ Product : "lists"
    Vendor ||--o{ OrderItem : "fulfills"

    Category ||--o{ Product : "classifies"
    Brand ||--o{ Product : "brands"

    Product ||--o{ CartItem : "contains"
    Product ||--o{ WishlistItem : "contains"
    Product ||--o{ OrderItem : "purchased_in"
    Product ||--o{ Review : "reviewed_in"

    Cart ||--o{ CartItem : "holds"
    Wishlist ||--o{ WishlistItem : "holds"

    Order ||--o{ OrderItem : "contains"
    Order ||--o{ Payment : "has"
    Order }o--|| Address : "ships_to"

    OrderItem ||--o| Review : "enables"
```

### Key Prisma Models & Relationships

- **`User`:** Central authentication entity holding role (`CUSTOMER`, `VENDOR`, `ADMIN`) and account status.
- **`Vendor`:** Business entity linked 1-to-1 with `User`, storing business metadata, store slug, verification status, and rating.
- **`Product`:** Catalog items linked to `Vendor`, `Category`, and `Brand`. Stores inventory stock, pricing, discount prices, and Cloudinary image URLs.
- **`Cart` & `CartItem`:** User-isolated shopping carts with quantity constraints and unique product indexes.
- **`Order` & `OrderItem`:** Multi-vendor order structure preserving historical price snapshots and item-level fulfillment states.
- **`Payment`:** Audit trail storing transaction identifiers, Razorpay IDs, HMAC signatures, and webhook event IDs.
- **`Review`:** Verified purchase reviews linked 1-to-1 with `OrderItem` and `Product`.

---

## 18. API Overview

All REST API endpoints are mounted under the `/api` route prefix.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Customer or Vendor account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT / session cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clear session cookie and invalidate token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile for currently authenticated user |

### Products & Catalog (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products with pagination, search, category, vendor, and price filters |
| `GET` | `/api/products/:idOrSlug` | Public | Retrieve detailed product information by ID or unique slug |
| `POST` | `/api/products` | Vendor | Create a new product listing in vendor's catalog |
| `PUT` | `/api/products/:id` | Vendor | Update product attributes (restricted to product owner) |
| `DELETE` | `/api/products/:id` | Vendor | Delete product listing (restricted to product owner) |

### Vendors & Storefronts (`/api/vendors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vendors` | Public | List all approved and active vendor storefronts |
| `GET` | `/api/vendors/store/:idOrSlug`| Public | Retrieve vendor storefront details and active catalog |
| `GET` | `/api/vendors/profile` | Vendor | Retrieve authenticated vendor's private profile |
| `PUT` | `/api/vendors/profile` | Vendor | Update vendor storefront details |
| `GET` | `/api/vendors/orders` | Vendor | Retrieve order items assigned to authenticated vendor |

### Cart & Wishlist (`/api/cart`, `/api/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | Fetch current customer shopping cart with live stock |
| `POST` | `/api/cart` | Customer | Add product to cart with quantity validation |
| `PUT` | `/api/cart/:productId` | Customer | Update item quantity in cart |
| `DELETE` | `/api/cart/:productId` | Customer | Remove specific item from cart |
| `DELETE` | `/api/cart` | Customer | Clear all items from cart |
| `GET` | `/api/wishlist` | Customer | Fetch current customer wishlist items |
| `POST` | `/api/wishlist` | Customer | Add product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | Customer | Remove product from wishlist |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | Customer | Validate cart stock and create Razorpay test order |
| `POST` | `/api/orders/confirm` | Customer | Verify HMAC payment signature and confirm order |
| `GET` | `/api/orders` | Customer | Retrieve customer order history |
| `GET` | `/api/orders/:id` | Customer | Retrieve single order details (ownership validated) |
| `GET` | `/api/orders/customer/stats` | Customer | Retrieve customer account metrics (order counts, totals) |
| `PUT` | `/api/orders/items/:id/status`| Vendor | Update order item fulfillment status (owner vendor only) |

### Payments & Webhooks (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/webhook` | Public (Signed) | Process incoming Razorpay webhook events idempotently |

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Customer | Submit verified review for delivered purchase item |
| `GET` | `/api/reviews/product/:id`| Public | Fetch approved reviews and ratings for a product |

### Admin Governance (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Aggregate platform statistics and catalog metrics |
| `GET` | `/api/admin/users` | Admin | Search and list platform users with status filters |
| `PUT` | `/api/admin/users/:id/status` | Admin | Update user account status (`ACTIVE`, `SUSPENDED`) |
| `GET` | `/api/admin/vendors/applications` | Admin | List pending vendor onboarding applications |
| `PUT` | `/api/admin/vendors/applications/:id` | Admin | Approve or reject vendor application |

### System & Media (`/api/health`, `/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health status, uptime, and environment check |
| `POST` | `/api/upload/image` | Vendor | Stream product image buffer to Cloudinary CDN |

---

## 19. Project Structure

```
Multi-Vendor-eCommerce/
├── package.json                   # Root monorepo workspace configuration
├── package-lock.json              # Dependency lockfile
├── tsconfig.json                  # Root TypeScript configuration
├── .gitignore                     # Git exclusion rules (.env, node_modules, build artifacts)
├── .env.example                   # Environment variable template
├── README.md                      # Project documentation
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline (Node 18.x / 20.x, tests, builds)
│
├── prisma/
│   └── schema.prisma              # Prisma MongoDB schema definition
│
├── apps/
│   ├── api/                       # Express.js REST API Service
│   │   ├── package.json           # API dependencies and run scripts
│   │   ├── tsconfig.json          # Backend TypeScript compiler configuration
│   │   ├── jest.config.js         # Jest test runner configuration
│   │   ├── src/
│   │   │   ├── config/            # Database (db.ts) and environment (env.ts) loaders
│   │   │   ├── controllers/       # HTTP request handlers (auth, product, order, admin, etc.)
│   │   │   ├── middlewares/       # Auth, RBAC, error, validation, and rate-limit middleware
│   │   │   ├── routes/            # Express route declarations and router mounting
│   │   │   ├── services/          # Core business logic, pricing, payments, Cloudinary, seed
│   │   │   ├── scripts/           # Seeding, catalog reset, and QA audit utilities
│   │   │   ├── utils/             # JWT, password hashing, API responses, AppError classes
│   │   │   ├── types/             # Express request extensions and data interfaces
│   │   │   ├── app.ts             # Express application initialization & middleware setup
│   │   │   └── server.ts          # HTTP server listener entry point
│   │   └── tests/                 # 17 Automated Integration Test Suites
│   │
│   └── web/                       # Next.js 14 Frontend Application
│       ├── package.json           # Frontend dependencies and run scripts
│       ├── tsconfig.json          # Next.js TypeScript compiler configuration
│       ├── tailwind.config.js     # Tailwind CSS theme configuration
│       ├── next.config.mjs        # Next.js configuration & API proxy rewrite rules
│       └── src/
│           ├── app/               # Next.js App Router (/, /login, /vendor, /admin)
│           ├── components/        # UI components (Marketplace, Vendor, Admin, Auth, Layout)
│           ├── context/           # React contexts (AuthContext session management)
│           ├── hooks/             # Custom React hooks
│           ├── lib/               # Utility helper functions
│           ├── services/          # Frontend API service wrappers
│           └── types/             # Frontend TypeScript interfaces
│
└── packages/
    ├── types/                     # Shared TypeScript type definitions
    ├── ui/                        # Shared UI primitives
    └── utils/                     # Shared helper utilities
```

---

## 20. Local Development Setup

### Prerequisites
- **Node.js:** `v18.x` or `v20.x` installed
- **npm:** `v9.x` or higher
- **MongoDB Atlas:** Active connection string (replica set enabled)

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Aakif009-new/Multi-Vendor-eCommerce.git
cd Multi-Vendor-eCommerce
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory following the provided template:
```bash
cp .env.example .env
```
*(Populate `.env` with your MongoDB Atlas connection string, JWT secrets, Cloudinary credentials, and Razorpay test keys.)*

### 3. Generate Prisma Client & Seed Catalog
```bash
# Generate Prisma Client types
npx prisma generate

# Seed initial verified vendors, categories, brands, and catalog products
npm run seed --workspace=apps/api
```

### 4. Start Development Servers
```bash
# Concurrently start Express API (Port 5000) and Next.js Frontend (Port 3000)
npm run dev
```

Alternatively, run each workspace in separate terminal windows:
```bash
# Terminal 1: Backend Express API
npm run dev --workspace=apps/api

# Terminal 2: Frontend Next.js Application
npm run dev --workspace=apps/web
```

Navigate to `http://localhost:3000` in your browser.

---

## 21. Environment Variables

The following environment variables are required across the workspace:

| Variable Name | Required By | Description | Example / Placeholder |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Backend / Web | Application execution mode | `development` / `production` / `test` |
| `PORT` | Backend | Express API server port | `5000` |
| `DATABASE_URL` | Backend / Prisma | MongoDB Atlas connection string with replica set | `mongodb+srv://user:pass@cluster.mongodb.net/marketplace?retryWrites=true&w=majority` |
| `JWT_SECRET` | Backend | 256-bit cryptographically secure secret for JWT signing | `<secure_random_string_min_32_chars>` |
| `JWT_EXPIRES_IN` | Backend | Token validity duration | `7d` |
| `COOKIE_SECRET` | Backend | Secret for signing HTTP-only cookies | `<secure_random_string_min_32_chars>` |
| `CORS_ORIGIN` | Backend | Allowed origins for cross-origin requests | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary cloud account name | `your_cloudinary_cloud_name` |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API access key | `your_cloudinary_api_key` |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API access secret | `your_cloudinary_api_secret` |
| `PEXELS_API_KEY` | Backend | Pexels API key for catalog imagery seeding | `your_pexels_api_key` |
| `RAZORPAY_KEY_ID` | Backend / Web | Razorpay Test Mode Key ID | `rzp_test_your_key_id` |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay Test Mode Key Secret | `your_razorpay_key_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Razorpay Webhook HMAC secret | `your_razorpay_webhook_secret` |
| `NEXT_PUBLIC_API_URL` | Frontend | Public API client endpoint path | `http://localhost:3000/api` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`| Frontend | Public Razorpay Test Key ID for modal | `rzp_test_your_key_id` |
| `BACKEND_INTERNAL_URL` | Frontend | Next.js server proxy target | `http://localhost:5000` |

---

## 22. Testing & Quality Assurance

BazaarOne features a comprehensive automated integration test suite written with **Jest** and **Supertest** covering the entire Express API lifecycle.

### Verified Test Suite Results (17 Suites / 80 Tests)

```bash
npm run test --workspace=apps/api
```

```
PASS tests/orders.test.ts
PASS tests/payments.test.ts
PASS tests/reviews.test.ts
PASS tests/inventory.test.ts
PASS tests/products.test.ts
PASS tests/cart.test.ts
PASS tests/wishlist.test.ts
PASS tests/auth.test.ts
PASS tests/images.test.ts
PASS tests/admin.test.ts
PASS tests/vendors.test.ts
PASS tests/addresses.test.ts
PASS tests/seed.test.ts
PASS tests/health.test.ts
PASS tests/webhook.test.ts
PASS tests/pricing.test.ts
PASS tests/customer.test.ts

Test Suites: 17 passed, 17 total
Tests:       80 passed, 80 total
Snapshots:   0 total
Result:      100% Pass Rate (0 Failures)
```

### Test Suite Coverage Breakdown

| Test Suite | Scope & Key Assertions |
| :--- | :--- |
| `auth.test.ts` | Customer/Vendor registration, login, wrong password rejection, public admin registration rejection, `/api/auth/me`. |
| `products.test.ts` | Product pagination, CRUD operations, vendor ownership isolation (`403 Forbidden` on foreign product edits). |
| `vendors.test.ts` | Approved vendor directory, multi-parameter filtering (Category + Vendor + Price + Sort), storefront queries. |
| `cart.test.ts` | Cart additions, out-of-stock rejection, quantity bounds, cart clearance upon checkout. |
| `wishlist.test.ts` | Wishlist additions, duplicate prevention, item migration from wishlist to active cart. |
| `addresses.test.ts` | Address creation, listing, and IDOR protection (forbids User B from editing/deleting User A's address). |
| `orders.test.ts` | Multi-vendor checkout, price history snapshots, vendor order isolation (Vendor 2 cannot edit Vendor 1 items). |
| `payments.test.ts` | Razorpay order creation, HMAC-SHA256 signature verification, forged signature rejection, idempotency. |
| `webhook.test.ts` | Webhook signature validation, forged payload rejection, duplicate event processing prevention. |
| `inventory.test.ts` | Real-time stock validation, overselling prevention, atomic stock decrement upon payment verification. |
| `reviews.test.ts` | Verified purchase eligibility (item must be `DELIVERED`), 1–5 rating bounds, duplicate review rejection, product average rating updates. |
| `images.test.ts` | Authorization checks (non-vendors rejected with `403`), empty payload rejection, Cloudinary asset streaming. |
| `admin.test.ts` | Super Admin role enforcement (`403` for non-admins), platform statistics, vendor application approval/rejection. |
| `pricing.test.ts` | Category-aligned price ranges and discount price validation across all standard product categories. |
| `seed.test.ts` | Database seeding verification: 12 core categories and complete catalog attribute integrity. |
| `customer.test.ts` | IDOR protections on order lookups, customer account metrics, and cross-session data persistence. |
| `health.test.ts` | System uptime, environment check, and database connection responsiveness. |

### Type Checking & Build Verification
```bash
# Type-check Express Backend
npx tsc --noEmit --project apps/api/tsconfig.json

# Type-check Next.js Frontend
npx tsc --noEmit --project apps/web/tsconfig.json

# Production Build Express Backend
npm run build --workspace=apps/api

# Production Build Next.js Frontend
npm run build --workspace=apps/web
```

---

## 23. Deployment Architecture

```mermaid
graph LR
    subgraph Source["Source Control"]
        Git["GitHub Repository"]
        Actions["GitHub Actions CI<br/>Matrix: Node 18.x & 20.x<br/>Lint, Test, Build"]
    end

    subgraph Hosting["Production Cloud Infrastructure"]
        Vercel["Vercel<br/>Next.js 14 Frontend<br/>Edge CDN & API Rewrites"]
        Render["Render / Railway<br/>Express.js REST API<br/>Node.js Container Runtime"]
        MongoAtlas[("MongoDB Atlas<br/>Cloud Database Cluster")]
        CloudinaryCDN[("Cloudinary<br/>Media CDN")]
        RazorpayAPI[("Razorpay Sandbox<br/>Test Payment Gateway")]
    end

    Git --> Actions
    Actions -->|Continuous Deployment| Vercel
    Actions -->|Continuous Deployment| Render
    Vercel -->|Proxy /api/*| Render
    Render --> MongoAtlas
    Render --> CloudinaryCDN
    Render --> RazorpayAPI
```

- **Frontend (Vercel):** Serves optimized Next.js 14 App Router client bundles and handles `/api/*` rewrites to the backend API.
- **Backend (Render / Railway):** Runs the compiled Express.js Node.js service with health checks, rate limiting, and CORS restrictions.
- **Database (MongoDB Atlas):** Managed replica-set cluster configured with secure network access lists.
- **CI/CD (GitHub Actions):** Automatically triggers on pull requests and branch pushes, executing dependency installation, Prisma client generation, TypeScript checks, the 17 Jest integration test suites, and production builds.

---

## 24. Demo Credentials

For evaluation and testing, the seeded database contains pre-configured evaluation accounts:

| Role | Email | Password | Target Destination | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@bazaarone.com` | `Market@123` | `/admin` | Full platform governance, vendor moderation, system metrics |
| **Verified Vendor** | `apex@bazaarone.com` | `Market@123` | `/vendor` | Storefront management, product CRUD, order item fulfillment |
| **Customer** | `customer@bazaarone.com` | `Market@123` | `/` | Marketplace browsing, wishlist, multi-vendor cart & checkout |

> **Note:** Quick-fill credential buttons are available directly on the `/login` screen to facilitate immediate evaluation.

---

## 25. Screenshots / UI Preview

| Marketplace Catalog (`/`) | Vendor Merchant Dashboard (`/vendor`) |
| :---: | :---: |
| *Product discovery, search, multi-category filters, and responsive product cards* | *Product management, inventory stock updates, and vendor order fulfillment* |

| Super Admin Governance (`/admin`) | Multi-Vendor Checkout & Payment Modal |
| :---: | :---: |
| *System statistics, vendor application review, and account status management* | *Consolidated multi-vendor cart with Razorpay Test Mode checkout* |

---

## 26. Future Improvements

- **Real-Time Order Tracking:** Implement WebSockets / Server-Sent Events (SSE) for live order status updates across vendor and customer portals.
- **Automated Payouts & Commission Splitting:** Integrate automated merchant payout calculations upon order delivery confirmation.
- **Advanced Full-Text Search:** Incorporate Atlas Search or Elasticsearch for typo-tolerant fuzzy search and faceted product filtering.
- **Multi-Language & Localization:** Expand currency conversion and localized language support for regional marketplace deployments.

---

## 27. Team / Contributors

- **Mohammed Aakif** — *Lead Full-Stack Architecture, Backend API, Database Design, & UI/UX*
- **BazaarOne Project Contributors**

---

## 28. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
