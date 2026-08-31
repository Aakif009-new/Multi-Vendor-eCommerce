# Multi-Vendor Marketplace for Local Businesses

> **Empowering Local Businesses Through Digital Commerce**
>
> A modern, production-style Multi-Vendor E-Commerce Marketplace built to help local brick-and-mortar shop owners and small businesses establish a digital presence, list products, and manage transactions through a shared marketplace.

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [The Real-World Problem](#-the-real-world-problem)
- [Key Features & Roles](#-key-features--roles)
- [Technology Stack](#-technology-stack)
- [Architecture & Design Flow](#-architecture--design-flow)
- [Project Directory Structure](#-project-directory-structure)
- [Local Development Quick Start](#-local-development-quick-start)
- [Environment Variables](#-environment-variables)
- [Database Schema & Seed](#-database-schema--seed)
- [API Route Reference](#-api-route-reference)
- [Testing Strategy](#-testing-strategy)
- [Git Workflow](#-git-workflow)
- [Deployment Plan](#-deployment-plan)
- [Security Considerations](#-security-considerations)
- [Future Enhancements](#-future-enhancements)
- [Team & Contributors](#-team--contributors)
- [License](#-license)

---

## 🌟 Project Overview

This platform functions as a shared digital marketplace inspired by services like Amazon and Flipkart, but tailored for local shop owners. The system enforces strict Role-Based Access Control (RBAC) across three primary actors: **Customers**, **Vendors**, and a **Super Admin**.

All transactional and catalog assets are stored in a fully-managed **MongoDB Atlas** cloud database, mapped via the **Prisma ORM**. Security is managed locally via **JWT (JSON Web Tokens)** session authentication and password encryption via **bcrypt**.

### Key Value Proposition
> *"Bridging the physical-to-digital gap for neighborhood retailers by providing an all-in-one storefront, order tracking, and payment processing suite."*

---

## 🧩 The Real-World Problem

Many neighborhood mom-and-pop stores lack:
1. The technical knowledge to build and host custom e-commerce web applications.
2. The financial resources to manage individual hosting, payment gateways, and databases.
3. A centralized platform to compete with national retail giants.

**Our Solution:** A multi-tenant shared marketplace where vendors get instant access to storefront management, payment collection via Razorpay, and cloud media handling via Cloudinary.

---

## 👥 Key Features & Roles

### 1. Customer Experience
- **Browsing & Search:** Dynamic product discovery with advanced filtering (price, category, ratings).
- **Cart & Wishlist:** Manage purchase items and list favorites before checkout.
- **Secure Checkout:** Integrates Razorpay checkout with automated webhook status synchronization.
- **Product Reviews:** Restrict reviews exclusively to customers with a verified `DELIVERED` purchase.

### 2. Vendor Portal
- **Vendor Onboarding:** Register a business application for Super Admin approval.
- **Storefront Dashboard:** Monitor sales charts, order counts, and total revenue.
- **Product Management:** Complete CRUD actions on products with image uploads directly to Cloudinary.
- **Inventory Control:** Track items in stock and trigger automatic reductions on successful payments.

### 3. Super Admin Suite
- **Merchant Approval:** Review, approve, or reject vendor application profiles.
- **Moderation Tools:** Suspend bad actors (users/vendors) and remove inappropriate listings.
- **Global Overview:** View platform-wide revenue metrics, total transactions, and active user counts.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js (App Router)](https://nextjs.org/) + TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) + TypeScript |
| **Database ORM** | [Prisma with MongoDB Connector](https://www.prisma.io/) |
| **Database Engine** | [MongoDB Atlas](https://www.mongodb.com/atlas/database) |
| **Authentication** | [JWT Authentication](https://jwt.io/) + Password Hashing via [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| **Payment Gateway** | [Razorpay (Test Mode)](https://razorpay.com/) |
| **Media Host** | [Cloudinary](https://cloudinary.com/) |
| **Testing** | [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) |

---

## 🏗️ Architecture & Design Flow

### 1. User Authentication (JWT + bcrypt)
```text
User Signup/Login  ───►  Express API (bcrypt verify)  ───►  Generate signed JWT
                                                                   │
                                                                   ▼
Return Client Cookie  ◄───  Authorize VENDOR / ADMIN  ◄───  Read payload role
```

### 2. Image Upload Flow
```text
Vendor Client  ───►  Cloudinary Client  ───►  Express Backend  ───►  MongoDB Atlas
(Select Image)       (File Upload)            (Store Cloud URL)     (Product Saved)
```

### 3. Razorpay Checkout & Webhook Flow
```text
Customer Checkout  ───►  Create Razorpay Order  ───►  Customer Pays (Razorpay Checkout UI)
                                                                  │
                                                                  ▼
MongoDB Update     ◄───  Reduce Inventory       ◄───  Razorpay Webhook Event (payment.captured)
```

---

## 📂 Project Directory Structure

```text
d:\Multi-Vendor-eCommerce
├───.github/workflows            # CI/CD pipeline automation definitions
├───apps
│   ├───api                      # Express API Gateway
│   │   └───src
│   │       ├───config           # Third-party configurations (Razorpay, Prisma, Cloudinary)
│   │       ├───controllers      # Express route controllers containing business logic
│   │       ├───middlewares      # JWT validation & RBAC security checkers
│   │       ├───routes           # REST routers mapped to path prefixes
│   │       ├───schemas          # Zod query & body request validation models
│   │       ├───services         # Razorpay & Cloudinary API clients
│   │       ├───types            # Server typing specifications
│   │       └───utils            # Logging and general helpers
│   └───web                      # Next.js App Router Client
│       └───src
│           ├───app              # layout.tsx and pages grouped by user roles
│           │   ├───(admin)      # Super Admin pages & dashboards
│           │   ├───(auth)       # Signup, login, password reset forms
│           │   ├───(customer)   # Public store, cart, address collection, profile
│           │   └───(vendor)     # Store management dashboard for merchants
│           ├───components       # Client/Server UI widgets
│           ├───hooks            # Custom React hooks
│           ├───lib              # Shared browser clients (API client configurations)
│           ├───providers        # Global Contexts (CartProvider, AuthProvider)
│           ├───services         # Fetch instances calling backend APIs
│           ├───types            # Client state declarations
│           └───utils            # Date, currency, string helpers
├───docs                         # Technical documentation & blueprints
├───packages
│   ├───types                    # Shared definitions between Next.js & Express
│   ├───ui                       # Shared layout utility components
│   └───utils                    # Global validators and common utility logic
├───prisma                       # Prisma ORM Database Models
└───tests
    ├───e2e                      # Playwright/Cypress end-to-end user journeys
    └───integration              # Backend route & DB schema query tests
```

---

## 🚀 Local Development Quick Start

The application runs in local development mode using Node.js and npm workspaces. Both the backend API and frontend client start concurrently with a single command.

### 📋 Prerequisites
Before launching the application, ensure you have:
- [Git](https://git-scm.com/)
- [Node.js (v18+)](https://nodejs.org/)
- Accounts and API credentials for our external services: **MongoDB Atlas** (database), **Cloudinary** (image storage), and **Razorpay** (payment gateway).

### 🚀 Quick Start
Follow these steps to clone, install, configure, and start the application:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/Multi-Vendor-eCommerce.git
cd Multi-Vendor-eCommerce

# 2. Install Workspace Dependencies
# Installs dependencies for Express backend, Next.js frontend, and concurrently package
npm install

# 3. Configure Environment Variables
# Create .env at the project root and fill out your credentials
cp .env.example .env

# 4. Start the application
npm run dev
```

Once running, **everything is accessible on port 3000**:
- **Website & Customer Storefront:** [http://localhost:3000](http://localhost:3000)
- **API Endpoints:** [http://localhost:3000/api/health](http://localhost:3000/api/health) (Proxied automatically from Express)

### 🏗️ Architecture & Flow
```text
  [ Client Browser / Postman ]
               │
               ▼ (All requests to localhost:3000)
       Next.js App Server
         │            │
  (UI Routes)     (/api/* Routes via Next.js Proxy)
         │            │
      Browser         ▼
               Express API Server (api) ────► Prisma ────► MongoDB Atlas (Cloud)
                      │                                 (Database Service)
                      ├─────────────────────────────────► Cloudinary Service (Cloud)
                      └─────────────────────────────────► Razorpay Sandbox (Cloud)
```

### 🔍 Troubleshooting

1. **Port Already Allocated (`address already in use`):**
   - **Issue:** Another process is running on port `3000` or `5000` on your machine.
   - **Fix:** Kill the process running on that port.
     - Windows: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force`
     - macOS/Linux: `kill -9 $(lsof -t -i:5000)`
2. **TypeScript / IDE Errors:**
   - **Issue:** Visual Studio Code or other editors show missing module errors for packages (like React).
   - **Fix:** Running `npm install` at the root directory of the workspace restores local packages and caches the type declarations correctly for your IDE.

---

## 🔑 Environment Variables

The project uses a **single unified `.env` file at the root of the workspace** (`d:\Multi-Vendor-eCommerce\.env`). The environment variables are loaded at startup via `dotenv-cli` and automatically shared with both frontend and backend processes.

Create a `.env` file at the root and fill in your keys:

```env
PORT=5000
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
JWT_SECRET="your-super-secure-jwt-secret-key"
PEXELS_API_KEY="your-pexels-api-key"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay Payments (Backend & Frontend)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Frontend Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

---

## 🗄️ Database Schema & Seed

Prisma ORM connects our code with the MongoDB Atlas database. Because MongoDB is schemaless, Prisma handles compilation to collections internally without requiring manual relational migrations.

```bash
# Generate the Prisma Client
npx prisma generate

# Seed initial database elements (categories, brands, products)
npx prisma db seed
```

---

## 🔌 API Route Reference

All backend requests map under the prefix `/api`:

| Module | Route | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Public | Registers customer / requests vendor status |
| | `/api/auth/login` | `POST` | Public | Log in, verifies password hash, returns JWT |
| **Products** | `/api/products` | `GET` | Public | List and search products with query filters |
| | `/api/products` | `POST` | Vendor | Create new product listing (vendor-scoped) |
| | `/api/products/:id` | `PUT` | Vendor | Update product information (vendor-scoped) |
| **Cart** | `/api/cart` | `GET` | Customer | Fetch current items in cart |
| **Payments**| `/api/payments/order`| `POST` | Customer | Create Razorpay order |
| | `/api/payments/webhook` | `POST` | Razorpay | Webhook verifying payment success (payment.captured) |
| **Reviews**  | `/api/reviews` | `POST` | Customer | Submit product review (requires verification) |
| **Admin** | `/api/admin/vendors` | `PATCH` | Admin | Approve or reject vendor profiles |

---

## 🧪 Testing Strategy

Automated tests check core business workflows before deployment:-

```bash
# Run integration unit tests (Jest + Supertest)
npm run test:integration --workspace=apps/api

# Run E2E user flow tests
npm run test:e2e --workspace=tests
```

### Core Tests Executed:
1. **JWT Auth Verification:** Test that protected routes block requests with invalid or missing tokens, and correctly decode the user role.
2. **RBAC Rules Verification:** Test that a Vendor cannot alter another vendor's products, and customers cannot access admin paths.
3. **Checkout Logic Validation:** Mock Razorpay order creation and check that webhook verification executes correctly.
4. **Review Guard Testing:** Assert that attempts to post reviews on unpurchased products fail with `403 Forbidden`.

---

## 🌿 Git Workflow

We adopt a strict feature-branch deployment strategy to collaborate across our team:

```text
main   ──────────────────────────────────────────► (Production Stable)
  ▲
  └── develop   ─────────────────────────────────► (Staging Integration)
        ▲
        ├── feature/customer-portal  ────
        ├── feature/vendor-dashboard  ───┤ (Local Feature Branches)
        └── feature/payment-razorpay ────
```

- **Branch Naming**: `feature/your-feature`, `bugfix/issue-description`.
- **Merge Action**: All merges to `develop` and `main` require a clean pull request review and successful build checks.

---

## 🌐 Deployment Plan

- **Frontend Client**: Hosted on **Vercel** with Next.js environment configurations.
- **Backend API**: Hosted on **Railway** or **Render** linking MongoDB connection variables.
- **Database Engine**: Hosted in the cloud on **MongoDB Atlas** cluster.
- **Media Asset Storage**: Managed on **Cloudinary**.

---

## 🔒 Security Considerations

1. **Strict Backend Middleware (RBAC):** Token validation occurs backend-side. Next.js routers do not authorize database mutations directly.
2. **Password Encryption:** Passwords are never stored in plain text. They are hashed using `bcrypt` (with a work factor of 10) on user creation.
3. **Environment Confidentiality:** Secret variables (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_API_SECRET`) are stored securely on the hosting platforms and never sent to the client side.

---

## 🖼️ Screenshots Section Placeholders

*(Once UI views are generated, visual flow layouts will be captured here)*

| Customer Home | Vendor Dashboard | Super Admin Portal |
| :---: | :---: | :---: |
| *Placeholder: Customer UI* | *Placeholder: Vendor Admin* | *Placeholder: Super Admin Dashboard* |

---

## 👥 Team & Contributors

This marketplace is built as a collaborative university project:

- **Member 1 (Customer Portal)**: Customer UI, Product discovery page, profile management.
- **Member 2 (Vendor Portal)**: Merchant application forms, vendor dashboard, item CRUD, Cloudinary integration.
- **Member 3 (Cart & Orders)**: Cart flows, address forms, purchase history, order tracker, product reviews.
- **Member 4 (Backend & Razorpay Integration)**: Server architecture, DB schema creation, Razorpay verification webhooks.
- **Member 5 (Super Admin Portal)**: Admin analytics panels, user moderation tables, category controls.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
