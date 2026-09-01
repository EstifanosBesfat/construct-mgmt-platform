# ConstructCMS — Mini Construction Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)

A full-stack, enterprise-grade **Construction Management System (CMS)** built to provide construction companies and site engineers with unified control over projects, Bill of Quantities (BOQ), warehouse inventory management, and field milestone progress tracking.

---

## 📑 Table of Contents

- [Core Features](#-core-features)
- [Business Rules & Validation](#-business-rules--validation)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Quick Start (Local Setup)](#-quick-start-local-setup)
- [Docker Deployment](#-docker-deployment)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [API Documentation (Swagger)](#-api-documentation-swagger)
- [Repository Structure](#-repository-structure)
- [Default Seed Accounts](#-default-seed-accounts)

---

## 🚀 Core Features

### 1. 🏗️ Project Management
* **Lifecycle Management**: Track projects across `PLANNED`, `ONGOING`, and `COMPLETED` statuses.
* **Comprehensive Metadata**: Manage project code, name, client, site location, timeline dates, and overall budget.
* **Interactive Table & Sorting**: Instant multi-column sorting (Project, Code, Client, Location, Timeline, Budget, BOQ Value, Status), search, and pagination.
* **Safe Deletion**: Soft-delete safeguards project historical records and inventory audit trails while freeing project codes for reuse.

### 2. 📋 Bill of Quantities (BOQ) Management
* **Measured Work Items**: Manage item descriptions, measurement units ($m, m^2, m^3, \text{tons, bags, pcs}$), quantities, and unit rates in ETB.
* **Server-Side Calculated Total**: Automatic enforcement of `Total = Quantity × Unit Price`.
* **Real-time Financial Aggregates**: Auto-summed Total BOQ Value and dynamic Budget Adherence comparison with visual health alerts.
* **Multi-Format Export**: Export project BOQs directly to styled **Excel (.xlsx)**, **PDF (.pdf)**, or raw **CSV (.csv)**.

### 3. 📦 Materials Catalogue & Inventory Control
* **Central Catalogue**: Track materials with unit definitions, current stock on hand, and minimum reorder threshold warnings.
* **Stock In (Deliveries)**: Record vendor shipments and warehouse receipts (increases `currentStock`).
* **Stock Out (Site Allocations)**: Issue materials directly to ongoing construction projects with reference vouchers.
* **Transaction Ledger**: Complete searchable and sortable historical movement log.

### 4. 📈 Field Milestone Progress Tracking
* **Progress Logging**: Record site milestones with completion percentage ($0 - 100\%$), inspection dates, and supervisor notes.
* **Progress Visualization**: Dynamically displays the latest project progress percentage and milestones timeline.

### 5. 📊 Executive Dashboard & Analytics
* **KPI Metrics**: Real-time summary cards for Total Projects, Live Sites, Catalogue Items, and Low-Stock Warnings.
* **Interactive Charts**:
  * Project Status distribution breakdown (Recharts).
  * Financial comparison of Contract Budget vs. Total BOQ Value.
* **Active Performance Table**: Sortable overview of active projects, latest progress bars, and direct detail links.
* **Live Feeds**: Recent site allocations and milestone progress updates filtered against soft-deleted projects.

---

## 🛡️ Business Rules & Validation

| Module | Business Rule | Enforcement Mechanism |
|---|---|---|
| **Inventory** | **Negative Stock Prevention** (`Stock Out > Available Stock`) | HTTP 422 Exception + Server & Client Validation |
| **Inventory** | **Low-Stock Alert Trigger** (`Current Stock ≤ Minimum Stock`) | Real-time warning badge and dashboard alert |
| **BOQ** | **Rate Calculation** (`Total = Quantity × Unit Price`) | Server-side computed column before persistence |
| **Projects** | **Code Uniqueness** | Enforced on active projects; reusable after deletion |
| **Projects** | **Date Validation** (`End Date ≥ Start Date`) | Class-validator decorator `@IsAfterDate` |
| **Security** | **Data Integrity** | Prisma foreign key constraints and transactional integrity |

---

## 🛠️ Technology Stack

### Frontend
* **Framework**: Next.js 14 (App Router), React 18
* **Language**: TypeScript 5.6
* **Styling**: Tailwind CSS, CSS Custom Properties (shadcn/ui design tokens)
* **Data Fetching & Caching**: TanStack Query (React Query) v5
* **Tables & Sorting**: TanStack Table v8 + custom multi-type sort headers
* **Forms & Validation**: React Hook Form, Zod v3
* **Visualizations**: Recharts v2, Lucide Icons
* **Export Engines**: ExcelJS, jsPDF, jsPDF-AutoTable, PapaParse
* **Notifications & Theme**: Sonner Toast, `next-themes` (Dark / Light mode)

### Backend
* **Framework**: NestJS 10 (Modular Architecture)
* **Runtime**: Node.js v20+ / v22+ (LTS)
* **Language**: TypeScript 5.6
* **ORM & Database**: Prisma ORM 5, PostgreSQL 15
* **API Documentation**: Swagger / OpenAPI 3.0
* **Validation & Security**: `class-validator`, `class-transformer`, Helmet, CORS, Throttler

### DevOps & Tooling
* **Containerization**: Docker, Docker Compose
* **Package Manager**: npm (Monorepo workspace support)
* **Code Quality**: ESLint, Prettier

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
* **Node.js**: v20.x or v22.x
* **npm**: v10+
* **PostgreSQL**: Local service or Docker container

### 2. Clone the Repository
```bash
git clone https://github.com/EstifanosBesfat/construct-mgmt-platform.git
cd construct-mgmt-platform
git checkout develop
```

### 3. Configure Environment Variables
Copy the root `.env.example` file:
```bash
cp .env.example .env
```

Ensure the database connection string in `.env` matches your PostgreSQL configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/construct_mgmt?schema=public"
PORT=4002
NEXT_PUBLIC_API_URL="http://localhost:4002"
```

### 4. Install Dependencies
```bash
# Install root and workspace dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 5. Database Setup & Seeding
```bash
# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Seed demo projects, materials, and BOQ items
npm run db:seed
```

### 6. Run the Application
In separate terminal tabs:

**Backend Server (Port 4002):**
```bash
npm run dev:backend
# Or: cd backend && npm run start:dev
```

**Frontend Server (Port 3000):**
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

---

## 🐳 Docker Deployment

To run the complete system (PostgreSQL, NestJS API, and Next.js Frontend) in isolated containers:

```bash
# 1. Build and start all services in the background
docker compose up -d --build

# 2. Apply database migrations and seed demo data inside the backend container
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# 3. Verify running containers
docker compose ps

# 4. View real-time logs
docker compose logs -f

# 5. Stop services when finished
docker compose down
```

---

## 🌐 Application URLs

| Service | URL | Description |
|---|---|---|
| **Web Application** | [http://localhost:3000](http://localhost:3000) | Next.js Frontend Interface |
| **API Base URL** | [http://localhost:4002](http://localhost:4002) | NestJS REST API |
| **Swagger API Docs** | [http://localhost:4002/api/docs](http://localhost:4002/api/docs) | Interactive OpenAPI Documentation |
| **Prisma Studio** | [http://localhost:5555](http://localhost:5555) | Database GUI (`npm run db:studio`) |

---

## 🧪 Testing & Quality Assurance

The system includes automated tests verifying critical business logic (negative stock prevention, BOQ calculation, project progress):

```bash
# Run backend Jest unit tests
cd backend && npm run test

# Run backend tests with coverage report
cd backend && npm run test:cov

# Run frontend TypeScript validation
cd frontend && npx tsc --noEmit
```

---

## 📖 API Documentation (Swagger)

All REST endpoints are documented with Swagger/OpenAPI. Visit **[http://localhost:4002/api/docs](http://localhost:4002/api/docs)** to test endpoints interactively:

* **Projects**: `GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id`
* **BOQ**: `GET /projects/:projectId/boq`, `POST /projects/:projectId/boq`, `PATCH /projects/:projectId/boq/:id`, `DELETE /projects/:projectId/boq/:id`
* **Materials**: `GET /materials`, `POST /materials`, `GET /materials/:id`, `PATCH /materials/:id`, `DELETE /materials/:id`
* **Inventory**: `GET /inventory`, `POST /inventory/stock-in`, `POST /inventory/stock-out`
* **Progress**: `GET /progress`, `POST /progress`, `PATCH /progress/:id`, `DELETE /progress/:id`
* **Dashboard**: `GET /dashboard/summary`

---

## 📁 Repository Structure

```
construct-mgmt-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # PostgreSQL Database Schema
│   │   ├── migrations/              # Database Migration History
│   │   └── seed.ts                  # Database Seeder (Demo Projects & Materials)
│   ├── src/
│   │   ├── projects/                # Project CRUD, aggregates & soft-delete
│   │   ├── boq/                     # BOQ line items & rate computations
│   │   ├── materials/               # Materials catalogue & stock levels
│   │   ├── inventory/               # Stock-in, stock-out & overdraft guards
│   │   ├── progress/                # Field milestone progress records
│   │   ├── dashboard/               # Aggregated KPI analytics & feeds
│   │   ├── common/                  # Filters, interceptors, validators, DTOs
│   │   └── main.ts                  # Server bootstrap, Swagger & CORS config
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Landing Page with live stats & auth dialogs
│   │   ├── layout.tsx               # Root Layout with Theme & Query Providers
│   │   ├── dashboard/               # Executive KPI overview & charts
│   │   ├── projects/                # Project portfolio with multi-column sorting
│   │   │   ├── new/                 # Create new project form
│   │   │   └── [id]/                # Project Hub (Overview, BOQ, Progress, Stock)
│   │   ├── materials/               # Materials catalogue & reorder thresholds
│   │   ├── inventory/               # Inventory ledger & issue vouchers
│   │   ├── progress/                # Field milestone tracking
│   │   ├── timeline/                # Gantt schedule roadmap view
│   │   └── globals.css              # shadcn/ui HSL design tokens & dark mode
│   ├── components/
│   │   ├── auth/                    # Sign In, Register, Forgot Password Dialogs
│   │   ├── landing/                 # Hero section with 3D helmet live stats
│   │   ├── layout/                  # Sidebar, Navbar, PageHeader, CommandMenu
│   │   ├── projects/                # Project form dialogs
│   │   ├── boq/                     # BOQ item dialogs & table
│   │   ├── inventory/               # Stock-in & Stock-out modal forms
│   │   ├── progress/                # Milestone log form dialogs
│   │   └── ui/                      # Reusable UI primitives (Button, Card, Badge, TableSortHeader)
│   ├── hooks/                       # TanStack Query data fetching hooks
│   ├── lib/                         # API client, Export engines (Excel, PDF, CSV), Utils
│   ├── types/                       # TypeScript data contracts & interfaces
│   └── Dockerfile
├── docker-compose.yml               # Multi-container orchestration (DB, API, Web)
├── package.json                     # Monorepo configuration & scripts
└── README.md                        # Documentation
```

---

## 👤 Default Seed Accounts

* **Admin User**: `admin@gmail.com`
* **Default Password**: `Root@123`

---

*ConstructCMS — Construction Management Platform (Internship Capstone Project)*