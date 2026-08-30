# ConstructCMS — Mini Construction Management Platform

A modern, production-grade full-stack Construction Management System built during the 2-week internship sprint (August 18–31, 2026). The platform provides unified management for construction projects, Bill of Quantities (BOQ) with unit rates, materials and warehouse inventory control, and field milestone progress tracking.

---

## 🚀 Key Features

### 1. 🏗️ Project Management
- Full lifecycle project management (`PLANNED`, `ONGOING`, `COMPLETED`).
- Project portfolio dashboard with budget tracking, client data, and duration calculation.
- Search, filter by status, sorting, and pagination powered by TanStack Table.
- Soft-delete capability to safeguard audit trail and historical inventory allocations.

### 2. 📋 Bill of Quantities (BOQ)
- Interactive BOQ measured rate table per project.
- **Server-Side Calculated Total**: Automatic rule enforcement `Total = Quantity × Unit Price`.
- Real-time Total BOQ Value summary calculation and budget adherence comparison.
- **CSV Export**: Export project BOQs directly to CSV spreadsheet format.

### 3. 📦 Materials Catalogue & Inventory Movement
- Centralized material inventory catalogue with minimum threshold triggers.
- **Stock-In**: Record supplier deliveries and warehouse receipts (increases `currentStock`).
- **Stock-Out (Business Rules)**:
  - **Rule 1 (Negative Stock Prevention)**: Rejects issues where `Requested Quantity > Available Stock` (HTTP 422).
  - **Rule 2 (Low Stock Warning)**: Flags alerts whenever `Current Stock ≤ Minimum Stock`.
- Complete paginated, sortable transaction history log with project and material filters.

### 4. 📈 Milestone Progress Tracking
- Field progress logging with completion slider (0–100%), inspection notes, and milestone dates.
- Project detail displays the latest calculated progress percentage and visual timeline.

### 5. 📊 Executive Analytics & Dashboard
- Aggregate KPI cards (Total Projects, Live Sites, Low-Stock Warnings, Total Committed BOQ).
- Interactive Recharts visualization (Project Status Doughnut, Budget vs. BOQ Bar Chart).
- Multi-project Gantt chart & roadmap schedule view.

### 6. 🎨 Advanced DX & Polish
- **Dark Mode**: System-aware theme toggle with smooth transitions (`next-themes`).
- **Global Search (`Ctrl+K`)**: Instant search across projects, materials, and actions.
- **Toast Notifications**: Contextual alerts for low stock and transaction status.
- **Swagger / OpenAPI**: Complete API specification documented at `/api/docs`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, TanStack Query v5, TanStack Table v8, React Hook Form, Zod, Recharts, Lucide Icons, Sonner |
| **Backend** | NestJS 10, TypeScript, Prisma ORM 5, Swagger/OpenAPI, Class Validator, Throttler, Helmet |
| **Database** | PostgreSQL 15 |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfiles |

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+
- **PostgreSQL**: Local instance or via Docker

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/EstifanosBesfat/construct-mgmt-platform.git
cd construct-mgmt-platform
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Setup & Seed
```bash
# Generate Prisma Client
npm run db:generate

# Run Database Migrations
npm run db:migrate

# Seed Sample Demo Projects & Materials
npm run db:seed
```

### 5. Run Development Servers
In separate terminals (or using the monorepo root scripts):
```bash
# Start NestJS Backend (Port 4000)
npm run dev:backend

# Start Next.js Frontend (Port 3000)
npm run dev:frontend
```

---

## 🐳 Docker Deployment

To build and run the entire stack (PostgreSQL, NestJS API, and Next.js Frontend) inside Docker containers:

```bash
# Start all containers in background (backend applies migrations on boot)
docker compose up -d --build

# Seed sample demo data once the API is healthy
docker compose exec backend node backend/dist/prisma/seed.js

# View container status and logs
docker compose ps
docker compose logs -f

# Stop containers
docker compose down
```

---

## 🌐 Application URLs

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Swagger API Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Prisma Studio**: `npm run db:studio` → [http://localhost:5555](http://localhost:5555)

---

## 🧪 Testing & Validation

```bash
# Run backend Jest unit tests
cd backend && npm run test

# Run test suite with coverage
cd backend && npm run test:cov

# Run build check across all workspaces
npm run build
```

---

## 📁 Repository Structure

```
construct-mgmt-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Projects, BOQ, Materials, Txns, Progress)
│   │   └── seed.ts             # Rich initial demo seed data
│   ├── src/
│   │   ├── projects/           # Project CRUD & aggregates
│   │   ├── boq/                # BOQ line items & rate computations
│   │   ├── materials/          # Materials catalogue & stock levels
│   │   ├── inventory/          # Stock movements & business rule guards
│   │   ├── progress/           # Field milestone records
│   │   ├── dashboard/          # Aggregated summary analytics
│   │   ├── common/             # Interceptors, filters, validators
│   │   └── main.ts             # Swagger bootstrap, CORS, Validation
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Sidebar & Providers
│   │   ├── page.tsx            # Dashboard redirect
│   │   ├── dashboard/          # Executive KPI cards & charts
│   │   ├── projects/           # Project list, create, and detail views
│   │   │   └── [id]/           # Tabbed Project Hub (Overview, BOQ, Progress, Stock)
│   │   ├── materials/          # Material catalogue & reorder thresholds
│   │   ├── inventory/          # Stock ledger & issue vouchers
│   │   ├── progress/           # Global milestone tracking feed
│   │   └── timeline/           # Gantt schedule roadmap
│   ├── components/             # Reusable UI widgets & Dialogs
│   ├── hooks/                  # TanStack Query data fetching hooks
│   ├── lib/                    # API client & formatting utilities
│   ├── types/                  # TypeScript interface contracts
│   └── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

*Mini Construction Management System — Internship Project (August 2026)*