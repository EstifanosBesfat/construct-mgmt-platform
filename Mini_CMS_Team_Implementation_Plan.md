# Mini Construction Management System
## Team Implementation Plan — August 18–31, 2026

---

> **Internship Assignment | Full-Stack Development | 2-Week Sprint**
> Team Size: 3 Members | Stack: Next.js · NestJS · PostgreSQL · Prisma · Docker

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Feature Specifications](#5-feature-specifications)
6. [Advanced Features](#6-advanced-features)
7. [Team Roles & Responsibilities](#7-team-roles--responsibilities)
8. [Day-by-Day Implementation Schedule](#8-day-by-day-implementation-schedule)
9. [GitHub Workflow](#9-github-workflow)
10. [API Specification](#10-api-specification)
11. [Testing Plan](#11-testing-plan)
12. [Deliverables Checklist](#12-deliverables-checklist)

---

## 1. Project Overview

The **Mini Construction Management System (Mini CMS)** is a full-stack web application built during a two-week internship (August 18–31, 2026). The system enables a construction company to manage projects, Bills of Quantities (BOQ), material inventory, and project progress from a single platform.

### 1.1 Core Objectives

| # | Objective |
|---|-----------|
| 1 | Create and manage construction projects with full CRUD operations |
| 2 | Define and manage Bill of Quantities (BOQ) per project |
| 3 | Manage construction materials and inventory |
| 4 | Record stock-in and stock-out transactions with business rules |
| 5 | Track and record project progress over time |
| 6 | Provide a comprehensive dashboard with project and inventory analytics |
| 7 | Document all REST APIs through Swagger/OpenAPI |
| 8 | Containerize the full application using Docker |

### 1.2 Out of Scope

The following are explicitly **outside** the assignment scope:

- Full accounting and payroll
- Procurement workflow
- Human resources management
- Subcontractor management
- Mobile application
- User authentication / role-based access control *(base scope only — see Advanced Features)*

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version (Target) | Purpose |
|------------|-----------------|---------|
| Next.js | 14+ (App Router) | Frontend framework & SSR |
| React | 18+ | UI component library |
| TypeScript | 5+ | Type-safe development |
| Tailwind CSS | 3+ | Utility-first styling |
| shadcn/ui | Latest | Pre-built accessible components |
| TanStack Query | v5 | Server state & API data fetching |
| TanStack Table | v8 | Feature-rich data tables |
| React Hook Form | v7 | Form state management |
| Zod | v3 | Schema validation (forms & API) |
| Recharts | v2 | Charts & data visualization |
| date-fns | v3 | Date utilities |
| lucide-react | Latest | Icon set |

### 2.2 Backend

| Technology | Version (Target) | Purpose |
|------------|-----------------|---------|
| NestJS | 10+ | Backend framework |
| Node.js | 20 LTS | JavaScript runtime |
| TypeScript | 5+ | Type-safe backend |
| Prisma ORM | 5+ | Database access & migrations |
| Swagger/OpenAPI | NestJS built-in | API documentation |
| class-validator | Latest | DTO validation |
| class-transformer | Latest | Object transformation |

### 2.3 Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL 15 | Primary relational database |
| Prisma Migrate | Schema versioning & migrations |
| Prisma Studio | Visual database browser |

### 2.4 DevOps & Tooling

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| Git + GitHub | Version control & source hosting |
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Unit testing (backend) |
| Jest + React Testing Library | Unit testing (frontend) |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User / Browser                        │
└─────────────────────────┬───────────────────────────────┘
                          │  HTTP / HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Next.js Frontend  (:3000)                │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Pages   │  │  Components  │  │  Hooks / Queries  │  │
│  │ (App     │  │  (shadcn/ui  │  │  (TanStack Query) │  │
│  │  Router) │  │   + custom)  │  │                   │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │
│  │ React Hook   │  │     Zod      │  │  TanStack   │   │
│  │    Form      │  │  Validation  │  │    Table    │   │
│  └──────────────┘  └──────────────┘  └─────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │  REST API (JSON)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 NestJS Backend  (:4000)                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  API Modules                                     │   │
│  │  ┌──────────┐ ┌─────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │ Projects │ │ BOQ │ │Materials │ │Progress│  │   │
│  │  └──────────┘ └─────┘ └──────────┘ └────────┘  │   │
│  │               ┌───────────┐                      │   │
│  │               │ Inventory │                      │   │
│  │               └───────────┘                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Controllers → Services → DTOs → Guards → Interceptors  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Swagger UI  (/api/docs)                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │  Prisma ORM
                          ▼
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL  (:5432)                       │
│                                                         │
│  projects │ boq_items │ materials │ inventory_txns │     │
│  progress_records                                        │
└─────────────────────────────────────────────────────────┘
```

### 3.1 Module Structure (Backend)

Each NestJS module follows:

```
src/
├── projects/
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── dto/
│   │   ├── create-project.dto.ts
│   │   └── update-project.dto.ts
│   └── projects.module.ts
├── boq/
├── materials/
├── inventory/
├── progress/
├── dashboard/
├── prisma/
│   └── prisma.service.ts
└── main.ts
```

---

## 4. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ProjectStatus {
  PLANNED
  ONGOING
  COMPLETED
}

model Project {
  id          String        @id @default(cuid())
  name        String
  code        String        @unique
  clientName  String
  location    String
  startDate   DateTime
  endDate     DateTime
  budget      Decimal       @db.Decimal(15, 2)
  status      ProjectStatus @default(PLANNED)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  boqItems           BoqItem[]
  inventoryTransactions InventoryTransaction[]
  progressRecords    ProgressRecord[]
}

model BoqItem {
  id          String   @id @default(cuid())
  projectId   String
  description String
  unit        String
  quantity    Decimal  @db.Decimal(10, 3)
  unitPrice   Decimal  @db.Decimal(15, 2)
  total       Decimal  @db.Decimal(15, 2)   // Computed: qty × unitPrice
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

enum TransactionType {
  STOCK_IN
  STOCK_OUT
}

model Material {
  id           String   @id @default(cuid())
  name         String
  code         String   @unique
  unit         String
  currentStock Decimal  @db.Decimal(10, 3) @default(0)
  minimumStock Decimal  @db.Decimal(10, 3) @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  inventoryTransactions InventoryTransaction[]
}

model InventoryTransaction {
  id          String          @id @default(cuid())
  materialId  String
  projectId   String?
  type        TransactionType
  quantity    Decimal         @db.Decimal(10, 3)
  date        DateTime
  reference   String
  notes       String?
  createdAt   DateTime        @default(now())

  material Material @relation(fields: [materialId], references: [id])
  project  Project? @relation(fields: [projectId], references: [id])
}

model ProgressRecord {
  id          String   @id @default(cuid())
  projectId   String
  date        DateTime
  description String
  percentage  Decimal  @db.Decimal(5, 2)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

---

## 5. Feature Specifications

### 5.1 Project Management

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Create | `POST /projects` | Create a new project |
| List | `GET /projects` | Paginated list with filters |
| Detail | `GET /projects/:id` | Full project detail + latest progress |
| Update | `PUT /projects/:id` | Edit project fields |
| Delete | `DELETE /projects/:id` | Soft delete project |

**Project Fields:**

| Field | Type | Validation |
|-------|------|-----------|
| Project Name | string | Required, 3–100 chars |
| Project Code | string | Required, unique, uppercase |
| Client Name | string | Required |
| Location | string | Required |
| Start Date | date | Required |
| End Date | date | Must be after start date |
| Budget | decimal | Required, > 0 |
| Status | enum | PLANNED / ONGOING / COMPLETED |

### 5.2 BOQ Management

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Create | `POST /projects/:id/boq` | Add BOQ item |
| List | `GET /projects/:id/boq` | List all BOQ items for project |
| Update | `PUT /boq/:id` | Edit BOQ item |
| Delete | `DELETE /boq/:id` | Remove BOQ item |

**Calculation rule:**
```
Total = Quantity × Unit Price
```
*Total BOQ Value = SUM of all item totals for a project.*

### 5.3 Materials & Inventory

**Material CRUD:**

| Operation | Endpoint |
|-----------|----------|
| Create | `POST /materials` |
| List | `GET /materials` |
| Update | `PUT /materials/:id` |
| Delete | `DELETE /materials/:id` |

**Stock Transactions:**

| Operation | Endpoint |
|-----------|----------|
| Stock In | `POST /inventory/stock-in` |
| Stock Out | `POST /inventory/stock-out` |
| History | `GET /inventory/transactions` |

**Business Rules:**

> **Rule 1 — Prevent Negative Stock**
> `Stock Out > Available Stock` → Transaction REJECTED (HTTP 422)

> **Rule 2 — Low Stock Warning**
> `Current Stock ≤ Minimum Stock` → Warning flag returned in API response

### 5.4 Project Progress

| Operation | Endpoint |
|-----------|----------|
| Record progress | `POST /progress` |
| List records | `GET /progress?projectId=:id` |
| Update record | `PUT /progress/:id` |
| Delete record | `DELETE /progress/:id` |

### 5.5 Dashboard

**Endpoint:** `GET /dashboard/summary`

Returns:

```json
{
  "projects": {
    "total": 12,
    "planned": 3,
    "ongoing": 7,
    "completed": 2
  },
  "inventory": {
    "totalMaterials": 15,
    "lowStockCount": 3
  },
  "projectPerformance": [
    {
      "id": "...",
      "name": "Project Alpha",
      "budget": 500000,
      "boqValue": 480000,
      "latestProgress": 65,
      "status": "ONGOING"
    }
  ]
}
```

---

## 6. Advanced Features

> These features go **beyond** the base assignment scope and demonstrate production-grade thinking.

### 6.1 Advanced Inventory Analytics *(Member 1)*
- **Consumption rate chart** — materials consumed per week per project
- **Stock forecast** — estimated days until stock-out based on consumption rate
- **Material utilization report** — actual vs. planned usage per project

### 6.2 BOQ vs. Actual Cost Variance *(Member 2)*
- Compare estimated BOQ cost per project against actual material cost (from Stock Out transactions)
- Visual gauge showing budget adherence
- Export BOQ report as CSV

### 6.3 Project Timeline & Gantt View *(Member 3)*
- Visual Gantt chart showing project start/end dates
- Color-coded status (Planned = gray, Ongoing = blue, Completed = green)
- Progress overlay on timeline

### 6.4 Global Search *(All Members)*
- Single search bar in navbar
- Searches across projects, materials, and BOQ descriptions simultaneously

### 6.5 Audit Log *(Backend — Member 1)*
- Every create/update/delete stored in an `audit_log` table
- Viewable per entity in the UI

### 6.6 Dark Mode *(Frontend — Member 3)*
- System-aware dark/light mode toggle using `next-themes`

### 6.7 Notifications / Toast System *(Frontend — Member 2)*
- Low-stock alerts appear as persistent toasts
- Stock Out near-rejection warnings

### 6.8 API Rate Limiting & Helmet *(Backend — Member 1)*
- `@nestjs/throttler` for rate limiting
- `helmet` for HTTP security headers

---

## 7. Team Roles & Responsibilities

### Member 1 — Backend Lead

**Primary domain:** NestJS backend, database design, DevOps

| Responsibility | Details |
|----------------|---------|
| Docker & Docker Compose setup | PostgreSQL + backend + frontend containers |
| Prisma schema & migrations | Full schema design, seed data |
| NestJS project bootstrap | Main module, Prisma service, global pipes, Swagger |
| Projects API | Full CRUD controller + service |
| BOQ API | Full CRUD + total calculation logic |
| Inventory API | Stock-in, stock-out, business rule enforcement |
| Audit Log (Advanced) | Prisma middleware for logging |
| API Rate Limiting (Advanced) | Throttler + Helmet integration |
| Swagger documentation | All endpoints documented |
| Backend unit tests | Jest tests for all business rules |

### Member 2 — Frontend Lead

**Primary domain:** Next.js UI, forms, tables, API integration

| Responsibility | Details |
|----------------|---------|
| Next.js project bootstrap | App Router setup, Tailwind, shadcn/ui install |
| Global layout & navigation | Sidebar nav, breadcrumbs, responsive shell |
| Projects pages | List page, create/edit form, detail page |
| BOQ section | BOQ table inside project detail, add/edit/delete |
| Materials pages | Material list, create/edit form |
| Inventory transactions | Stock-in/out forms + transaction history table |
| TanStack Query setup | API client (axios/fetch), query client config |
| TanStack Table integration | Sorting, pagination, search on all tables |
| React Hook Form + Zod | All form schemas and validation |
| BOQ vs. Actual Cost (Advanced) | Variance chart using Recharts |
| Notifications / Toast (Advanced) | Low-stock toast notifications |
| Frontend unit tests | React Testing Library tests |

### Member 3 — Full-Stack / Integration

**Primary domain:** Progress module, dashboard, integration, advanced UI

| Responsibility | Details |
|----------------|---------|
| Materials API (backend) | Full CRUD controller + service |
| Progress API (backend) | Create, list, update, delete + latest % query |
| Dashboard API (backend) | Aggregated summary endpoint |
| Dashboard page (frontend) | Stats cards, charts, performance table |
| Progress pages (frontend) | Progress form + history list per project |
| Dark mode (Advanced) | next-themes integration |
| Gantt chart (Advanced) | Project timeline view with Recharts |
| Global Search (Advanced) | Multi-entity search bar |
| README documentation | Setup, migration, seed, run commands |
| End-to-end integration testing | Verify full flows across frontend ↔ backend |

---

## 8. Day-by-Day Implementation Schedule

> **Current date: August 19, 2026** — Day 2 of the sprint.
> Day 1 (Aug 18) tasks are marked as **[CATCH UP]** if not yet complete.

---

### Day 1 — Aug 18 (Monday) `[CATCH UP IF NEEDED]`
**Theme: Project Setup & Environment**

| Member | Tasks |
|--------|-------|
| **Member 1** | ✅ Initialize GitHub repo, branch strategy, `.gitignore`. Create `docker-compose.yml` with PostgreSQL service. Create NestJS project in `/backend`. Install dependencies: `@nestjs/swagger`, `prisma`, `@prisma/client`, `class-validator`, `class-transformer`, `@nestjs/throttler`, `helmet`. |
| **Member 2** | ✅ Initialize Next.js (App Router, TypeScript, Tailwind) in `/frontend`. Install shadcn/ui, TanStack Query, TanStack Table, React Hook Form, Zod, Recharts, lucide-react, next-themes, date-fns. Configure `tailwind.config.ts` and global CSS. |
| **Member 3** | ✅ Write Prisma schema (`schema.prisma`) covering all tables. Set up environment files (`.env`, `.env.example`). Write `seed.ts` with sample data (5 projects, 10 materials, BOQ items). Test `npx prisma migrate dev` + `npx prisma db seed`. |

**End-of-day merge target:** `main` has repo structure, Docker running, DB connected, seed works.

---

### Day 2 — Aug 19 (Tuesday) `← TODAY`
**Theme: Backend Foundation + Frontend Shell**

| Member | Tasks |
|--------|-------|
| **Member 1** | Create `PrismaService` (singleton). Configure `main.ts` (global ValidationPipe, CORS, Swagger bootstrap). Create `ProjectsModule` with `ProjectsController` + `ProjectsService`. Implement `POST /projects` and `GET /projects` (with pagination query params). |
| **Member 2** | Create global layout: sidebar navigation (`Projects`, `BOQ`, `Materials`, `Inventory`, `Progress`, `Dashboard`). Configure TanStack Query `QueryClient`. Create `api.ts` utility (axios instance pointing to `NEXT_PUBLIC_API_URL`). Scaffold page routes under `app/`. |
| **Member 3** | Create `MaterialsModule` with controller + service. Implement `POST /materials`, `GET /materials`, `GET /materials/:id`. Add low-stock flag logic (`currentStock <= minimumStock`). Write `CreateMaterialDto` and `UpdateMaterialDto` with `class-validator`. |

**Git commits today:**
```
feat(backend): add prisma service and projects CRUD (Member 1)
feat(frontend): global layout and query client setup (Member 2)
feat(backend): add materials module with low-stock flag (Member 3)
```

---

### Day 3 — Aug 20 (Wednesday)
**Theme: Projects CRUD Complete**

| Member | Tasks |
|--------|-------|
| **Member 1** | Complete Projects API: `GET /projects/:id`, `PUT /projects/:id`, `DELETE /projects/:id`. Add query filters (status, search by name/code). Add Swagger decorators to all project endpoints. Write `CreateProjectDto` and `UpdateProjectDto`. |
| **Member 2** | Build **Projects List Page**: TanStack Table with columns (Code, Name, Client, Status, Budget, Start/End date). Add search input (filter by name/code client-side). Add status badge component. Add `New Project` button → modal/form. |
| **Member 3** | Complete Materials API: `PUT /materials/:id`, `DELETE /materials/:id`. Add `GET /materials?lowStock=true` filter. Start `BoqModule`: create `BoqController` + `BoqService`. Implement `POST /projects/:id/boq` with auto-calculate `total = qty × unitPrice`. |

**Git commits:**
```
feat(backend): complete projects API with filters and Swagger (Member 1)
feat(frontend): projects list page with TanStack Table (Member 2)
feat(backend): complete materials API + BOQ create endpoint (Member 3)
```

---

### Day 4 — Aug 21 (Thursday)
**Theme: Project Create/Edit Forms**

| Member | Tasks |
|--------|-------|
| **Member 1** | Add end-date-after-start-date validation in `CreateProjectDto`. Wire up Swagger tags and response schemas. Set up `@nestjs/throttler` + `helmet` in `AppModule`. Test all project endpoints in Swagger UI. |
| **Member 2** | Build **Project Create/Edit Form** using React Hook Form + Zod schema. Fields: name, code, client, location, startDate, endDate, budget, status. Add form validation errors inline. Implement `useMutation` for create + update. |
| **Member 3** | Complete BOQ API: `GET /projects/:id/boq`, `PUT /boq/:id`, `DELETE /boq/:id`. Add `GET /projects/:id/boq/summary` returning total BOQ value. Swagger decorators for BOQ. Start `ProgressModule`. |

**Git commits:**
```
feat(backend): date validation, throttler, helmet (Member 1)
feat(frontend): project create/edit form with Zod validation (Member 2)
feat(backend): complete BOQ API with total summary (Member 3)
```

---

### Day 5 — Aug 22 (Friday)
**Theme: Project Detail + BOQ UI**

| Member | Tasks |
|--------|-------|
| **Member 1** | Review and merge all open PRs. Fix any backend validation bugs found during frontend integration. Run full backend test suite. Add `AuditLog` Prisma middleware (advanced). |
| **Member 2** | Build **Project Detail Page**: tabbed layout (Overview, BOQ, Progress, Inventory Usage). Show project summary card with budget, status, latest progress. |
| **Member 3** | Build **BOQ table** inside Project Detail (TanStack Table): columns (Description, Unit, Qty, Unit Price, Total). Inline add/edit row. Display Total BOQ Value footer. Implement TanStack Query invalidation on mutation. |

**Git commits:**
```
feat(backend): audit log middleware (Member 1)
feat(frontend): project detail page with tabs (Member 2)
feat(frontend): BOQ table with inline edit and total (Member 3)
```
**End-of-week push:** All members push branches → create PRs → review → merge to `main`.

---

### Day 6 — Aug 23 (Saturday)
**Theme: Inventory Backend**

| Member | Tasks |
|--------|-------|
| **Member 1** | Create `InventoryModule`. Implement `POST /inventory/stock-in`: validate quantity > 0, update `currentStock += quantity`, create `InventoryTransaction`. Return updated material. |
| **Member 2** | Build **Materials List Page**: TanStack Table (Code, Name, Unit, Current Stock, Min Stock, Low Stock badge). Add `New Material` button + form (React Hook Form + Zod). |
| **Member 3** | Implement `POST /inventory/stock-out`: validate `quantity <= currentStock` (return HTTP 422 with descriptive error if not), update `currentStock -= quantity`, require `projectId`, create transaction record. |

**Git commits:**
```
feat(backend): stock-in endpoint with stock update (Member 1)
feat(frontend): materials list page and form (Member 2)
feat(backend): stock-out with negative stock prevention (Member 3)
```

---

### Day 7 — Aug 24 (Sunday)
**Theme: Inventory UI + Transaction History**

| Member | Tasks |
|--------|-------|
| **Member 1** | Add `GET /inventory/transactions` with filters (type, materialId, projectId, date range). Swagger documentation for inventory. Add low-stock warning in stock-out response. Write Jest unit tests for inventory business rules. |
| **Member 2** | Build **Stock-In Form**: material selector (dropdown from API), quantity, date, reference. Wire up with React Hook Form + Zod. Show success/error toast notifications. |
| **Member 3** | Build **Stock-Out Form**: material + project selectors, quantity, date, reference. Show available stock dynamically. Display error toast on rejection (negative stock). Build **Transaction History Table**: filterable by type/material/project, sortable date column. |

**Git commits:**
```
feat(backend): inventory history endpoint + Jest tests (Member 1)
feat(frontend): stock-in form with toasts (Member 2)
feat(frontend): stock-out form + transaction history table (Member 3)
```

---

### Day 8 — Aug 25 (Monday)
**Theme: Progress Module**

| Member | Tasks |
|--------|-------|
| **Member 1** | Code review for all existing modules. Fix any edge-case bugs. Add `GET /projects/:id` to include `latestProgressPercentage` computed from `MAX(percentage)` in progress records for that project. |
| **Member 2** | Build **Progress History section** inside Project Detail tab: list of progress records (date, description, %, notes). Add progress percentage as a visual progress bar component. |
| **Member 3** | Complete `ProgressModule`: `POST /progress`, `GET /progress?projectId=:id`, `PUT /progress/:id`, `DELETE /progress/:id`. Return records ordered by date DESC. Add Swagger docs. |

**Git commits:**
```
feat(backend): latest progress on project detail (Member 1)
feat(frontend): progress history with progress bar (Member 2)
feat(backend): complete progress module CRUD (Member 3)
```

---

### Day 9 — Aug 26 (Tuesday)
**Theme: Progress UI + Integration**

| Member | Tasks |
|--------|-------|
| **Member 1** | Create `DashboardModule` with `GET /dashboard/summary` endpoint aggregating: project counts by status, inventory low-stock count, per-project performance (budget, BOQ value, latest progress, status). |
| **Member 2** | Build **Add Progress Record Form**: project selector, date picker, description textarea, percentage slider (0–100), notes. Zod validation. Wire up `useMutation`. |
| **Member 3** | Build **Dashboard Page**: 4 stats cards (Total Projects, Ongoing, Completed, Low-Stock Materials). Project Performance Table (TanStack Table): project name, budget, BOQ value, progress bar, status badge. |

**Git commits:**
```
feat(backend): dashboard summary endpoint (Member 1)
feat(frontend): add progress form (Member 2)
feat(frontend): dashboard stats and performance table (Member 3)
```

---

### Day 10 — Aug 27 (Wednesday)
**Theme: Dashboard Charts + Advanced Features Start**

| Member | Tasks |
|--------|-------|
| **Member 1** | Implement Audit Log viewer endpoint `GET /audit-logs`. Begin `GET /inventory/analytics` endpoint for consumption rate data. |
| **Member 2** | Add **Recharts** to Dashboard: `BarChart` for project statuses, `PieChart` for material stock levels. Add **BOQ vs. Actual Cost** variance chart in Project Detail. |
| **Member 3** | Add **dark mode** toggle (`next-themes`): system-aware default, toggle button in navbar. Add **Gantt Chart** page: horizontal bar chart using Recharts showing project timeline. |

**Git commits:**
```
feat(backend): audit log viewer + inventory analytics (Member 1)
feat(frontend): dashboard charts + BOQ variance chart (Member 2)
feat(frontend): dark mode + Gantt timeline (Member 3)
```

---

### Day 11 — Aug 28 (Thursday)
**Theme: Polish, Responsiveness, Remaining Advanced Features**

| Member | Tasks |
|--------|-------|
| **Member 1** | Finalize Swagger with full schemas, examples, response codes. Add `GET /materials/:id/stock-forecast` (advanced: days to stockout). Write remaining backend unit tests. |
| **Member 2** | Global Search bar (advanced): search across projects + materials. Keyboard shortcut `Ctrl+K` to open command palette style search. Mobile responsive adjustments for all pages. |
| **Member 3** | Add CSV export for BOQ table (advanced: use PapaParse). Notification badges on sidebar for low-stock materials. Finalize dark mode across all components. Responsive audit log page. |

**Git commits:**
```
feat(backend): stock forecast + full Swagger (Member 1)
feat(frontend): global search + mobile responsive (Member 2)
feat(frontend): CSV export + sidebar notifications (Member 3)
```
**End-of-day push:** Comprehensive review PR. All members review each other's code.

---

### Day 12 — Aug 29 (Friday)
**Theme: Testing & Documentation**

| Member | Tasks |
|--------|-------|
| **Member 1** | Write Jest unit tests (backend): ✅ Project creation, ✅ BOQ total calculation, ✅ Stock-in increases stock, ✅ Stock-out decreases stock, ✅ Negative stock prevention, ✅ Progress record creation. Run `npm run test` — all tests green. |
| **Member 2** | Write React Testing Library tests (frontend): ✅ Project form renders and submits, ✅ BOQ table shows correct total, ✅ Stock-out form shows error on negative stock attempt. Fix any failing tests. |
| **Member 3** | Write `README.md` with exact commands. Write integration test for full flow (create project → add BOQ → stock-in → stock-out → add progress → view dashboard). Update `docker-compose.yml` if needed. |

**Git commits:**
```
test(backend): all business rule unit tests passing (Member 1)
test(frontend): component tests (Member 2)
docs: complete README and integration tests (Member 3)
```

---

### Day 13 — Aug 30 (Saturday)
**Theme: Final QA & Finalization**

| Member | Tasks |
|--------|-------|
| **Member 1** | Full E2E smoke test of the backend (all endpoints via Swagger). Fix any remaining backend bugs. Verify Docker Compose brings up all services cleanly from scratch. |
| **Member 2** | Full UI walkthrough on all pages. Fix any visual/UX issues. Check all form error states. Test on different screen sizes. |
| **Member 3** | Final README review. Seed database with rich demo data. Prepare demonstration scenario (sample projects, BOQs, inventory transactions, progress records). |

**Git commits:**
```
fix: final backend bug fixes (Member 1)
fix: final frontend UI fixes (Member 2)
docs: final README and demo seed data (Member 3)
```

---

### Day 14 — Aug 31 (Sunday)
**Theme: Demo Day**

| Member | Tasks |
|--------|-------|
| **Member 1** | Prepare backend demo: live Swagger walkthrough, show API responses, explain architecture decisions. |
| **Member 2** | Prepare frontend demo: walk through all UI pages, demonstrate form validation, table features (search, sort, paginate). |
| **Member 3** | Present dashboard, Gantt chart, dark mode. Walk through the README. Show Git log / commit history. Present overall architecture diagram. |

**Final push:**
```bash
git tag v1.0.0
git push origin main --tags
```

---

## 9. GitHub Workflow

### 9.1 Repository Structure

```
construction-management-system/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Redirects to /dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx          # List
│   │   │   ├── new/page.tsx      # Create
│   │   │   └── [id]/page.tsx     # Detail
│   │   ├── materials/page.tsx
│   │   ├── inventory/page.tsx
│   │   └── progress/page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── projects/
│   │   ├── boq/
│   │   ├── materials/
│   │   ├── inventory/
│   │   ├── progress/
│   │   └── dashboard/
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   ├── useBoq.ts
│   │   ├── useMaterials.ts
│   │   ├── useInventory.ts
│   │   └── useProgress.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── projects/
│   │   ├── boq/
│   │   ├── materials/
│   │   ├── inventory/
│   │   ├── progress/
│   │   ├── dashboard/
│   │   ├── prisma/
│   │   └── main.ts
│   └── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

### 9.2 Branch Strategy

```
main
├── feature/m1-backend-setup        (Member 1)
├── feature/m1-projects-api
├── feature/m1-inventory-api
├── feature/m1-audit-log
├── feature/m2-frontend-setup       (Member 2)
├── feature/m2-projects-ui
├── feature/m2-inventory-ui
├── feature/m2-dashboard-charts
├── feature/m3-materials-api        (Member 3)
├── feature/m3-progress-api
├── feature/m3-dashboard-ui
└── feature/m3-advanced-ui
```

### 9.3 Daily Merge Ritual

1. Each member pushes their feature branch at end of day
2. Open Pull Request → assign one other member as reviewer
3. Reviewer checks: no merge conflicts, ESLint clean, tests pass
4. Squash merge to `main`
5. All members pull `main` before starting next day

### 9.4 Commit Convention

```
feat(scope): description      # New feature
fix(scope): description       # Bug fix
test(scope): description      # Tests
docs(scope): description      # Documentation
refactor(scope): description  # Refactoring
chore(scope): description     # Config, tooling
```

**Example commits:**
```
feat(backend): add project CRUD with Swagger docs
feat(frontend): project list page with TanStack Table
feat(backend): stock-out negative stock prevention
fix(backend): end-date validation on project create
test(backend): inventory business rule unit tests
docs: update README with all start commands
chore: add ESLint and Prettier config
```

---

## 10. API Specification

### Base URL

```
http://localhost:4000
Swagger UI: http://localhost:4000/api/docs
```

### Complete Endpoint Reference

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Projects | POST | `/projects` | Create project |
| Projects | GET | `/projects` | List projects (paginated, filterable) |
| Projects | GET | `/projects/:id` | Get project detail |
| Projects | PUT | `/projects/:id` | Update project |
| Projects | DELETE | `/projects/:id` | Delete project |
| BOQ | POST | `/projects/:id/boq` | Add BOQ item |
| BOQ | GET | `/projects/:id/boq` | List BOQ items |
| BOQ | GET | `/projects/:id/boq/summary` | BOQ total value |
| BOQ | PUT | `/boq/:id` | Update BOQ item |
| BOQ | DELETE | `/boq/:id` | Delete BOQ item |
| Materials | POST | `/materials` | Create material |
| Materials | GET | `/materials` | List materials |
| Materials | GET | `/materials/:id` | Get material |
| Materials | PUT | `/materials/:id` | Update material |
| Materials | DELETE | `/materials/:id` | Delete material |
| Inventory | POST | `/inventory/stock-in` | Record stock-in |
| Inventory | POST | `/inventory/stock-out` | Record stock-out |
| Inventory | GET | `/inventory/transactions` | Transaction history |
| Progress | POST | `/progress` | Add progress record |
| Progress | GET | `/progress` | List progress records |
| Progress | PUT | `/progress/:id` | Update progress record |
| Progress | DELETE | `/progress/:id` | Delete progress record |
| Dashboard | GET | `/dashboard/summary` | Dashboard aggregated data |
| Audit | GET | `/audit-logs` | View audit log (Advanced) |
| Analytics | GET | `/inventory/analytics` | Consumption rates (Advanced) |

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET, PUT |
| 201 | Created — successful POST |
| 204 | No Content — successful DELETE |
| 400 | Bad Request — validation error |
| 404 | Not Found — entity not found |
| 409 | Conflict — duplicate code |
| 422 | Unprocessable Entity — business rule violation (negative stock) |
| 500 | Internal Server Error |

---

## 11. Testing Plan

### 11.1 Required Tests (Assignment)

| Test | Module | Type | Who |
|------|--------|------|-----|
| Project can be created successfully | Projects | Unit | Member 1 |
| `Total = Quantity × Unit Price` | BOQ | Unit | Member 1 |
| Stock increases after Stock-In | Inventory | Unit | Member 1 |
| Stock decreases after Stock-Out | Inventory | Unit | Member 1 |
| Stock-Out > Available Stock is rejected | Inventory | Unit | Member 1 |
| Progress record can be created | Progress | Unit | Member 1 |
| Latest progress % is returned correctly | Progress | Unit | Member 1 |

### 11.2 Frontend Tests (Extended)

| Test | Page | Who |
|------|------|-----|
| Project form renders all fields | Projects | Member 2 |
| Zod validation triggers on invalid input | Projects Form | Member 2 |
| BOQ table shows correct row totals | BOQ | Member 2 |
| Stock-out form shows error toast on rejection | Inventory | Member 2 |

### 11.3 Integration Tests

| Flow | Who |
|------|-----|
| Create project → Add BOQ → Verify BOQ total | Member 3 |
| Stock-in → Verify currentStock increases | Member 3 |
| Stock-out → Verify currentStock decreases | Member 3 |
| Stock-out beyond stock → Verify 422 | Member 3 |
| Add progress → Verify project shows latest % | Member 3 |
| Full dashboard data is consistent | Member 3 |

### 11.4 Test Commands

```bash
# Backend unit tests
cd backend && npm run test

# Backend test with coverage
cd backend && npm run test:cov

# Frontend tests
cd frontend && npm run test

# All tests
npm run test --workspaces
```

---

## 12. Deliverables Checklist

### Infrastructure
- [ ] `docker-compose.yml` — PostgreSQL + backend + frontend
- [ ] `.env.example` — all required environment variables documented
- [ ] `README.md` — complete setup and run instructions

### Backend
- [ ] NestJS application running on `:4000`
- [ ] Prisma schema with all 5 tables
- [ ] Migrations applied (`prisma migrate dev`)
- [ ] Seed data (`prisma db seed`)
- [ ] Projects module — full CRUD
- [ ] BOQ module — full CRUD + total calculation
- [ ] Materials module — full CRUD + low-stock flag
- [ ] Inventory module — stock-in, stock-out + business rules
- [ ] Progress module — full CRUD + latest %
- [ ] Dashboard module — aggregated summary
- [ ] Swagger UI accessible at `/api/docs`
- [ ] Global validation pipe (`class-validator`)
- [ ] CORS configured for frontend origin

### Frontend
- [ ] Next.js application running on `:3000`
- [ ] Global layout with sidebar navigation
- [ ] Dashboard page with stats cards + charts
- [ ] Projects list, create, edit, detail pages
- [ ] BOQ table with inline add/edit/delete
- [ ] Materials list + create/edit form
- [ ] Stock-in form
- [ ] Stock-out form with real-time stock display
- [ ] Transaction history table
- [ ] Progress records per project
- [ ] Add progress form
- [ ] All tables: search, sort, pagination

### Advanced Features (Bonus)
- [ ] Dark mode toggle
- [ ] Gantt chart / project timeline
- [ ] BOQ vs. Actual Cost variance chart
- [ ] Global search (Ctrl+K)
- [ ] Audit log
- [ ] CSV export
- [ ] Stock forecast
- [ ] Low-stock toast notifications
- [ ] API rate limiting

### Testing
- [ ] All 7 required unit tests passing
- [ ] Frontend component tests
- [ ] Integration tests

### Git / GitHub
- [ ] Clean commit history with conventional commits
- [ ] Feature branches used throughout
- [ ] All code merged to `main`
- [ ] Repo tagged `v1.0.0`

---

## README Template

```markdown
# Mini Construction Management System

A full-stack construction project management system built with Next.js, NestJS, and PostgreSQL.

## Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm 10+

## Quick Start

### 1. Clone the repository
git clone https://github.com/<your-org>/construction-management-system.git
cd construction-management-system

### 2. Set up environment variables
cp .env.example .env
# Edit .env with your values

### 3. Start all services
docker compose up -d

### 4. Run database migrations
cd backend && npx prisma migrate dev

### 5. Seed the database
cd backend && npx prisma db seed

### 6. Start the backend
cd backend && npm run start:dev

### 7. Start the frontend
cd frontend && npm run dev

## Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger UI: http://localhost:4000/api/docs
- Prisma Studio: npx prisma studio

## Stop all services
docker compose down

## Run tests
cd backend && npm run test
cd frontend && npm run test
```

---

*Document prepared for: Mini Construction Management System Internship Assignment*
*Team: Member 1 (Backend Lead) · Member 2 (Frontend Lead) · Member 3 (Full-Stack/Integration)*
*Sprint: August 18–31, 2026*
*Version: 1.0*
