# SBA MSMEs Online Database and Reporting Portal

Government-grade web platform for Liberia's Bureau of Small Business Administration (SBA) under the Ministry of Commerce and Industry, designed to serve as a centralized national inventory for MSMEs and BDSPs under PAYEI / YEIB.

## Features

- Secure authentication with password reset, invitation flow, JWT access tokens, refresh token cookies, account lockout, and login history
- Role-based access control for super admin, SBA admin, county supervisors, data officers, analysts, partners, auditors, and other portal actors
- MSME registry with workflow transitions, duplicate checks, history, product linkage, and verification views
- BDSP registry with county coverage, service offerings, support records, and performance summaries
- Product and service catalog for MSME visibility and approval
- Opportunity management for financing, grants, training, procurement, mentorship, and market linkage
- Reporting engine with stored report history and PDF / XLSX / CSV export generation
- Analytics dashboards for executive, county, partner, and data quality reporting
- Offline-ready PWA interface using IndexedDB draft storage and sync queue submission
- Import batches, rollback support, export generation, map/GIS views, notifications, audit logs, settings, and public aggregated views

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Radix primitives, Recharts, React Query, React Hook Form, Zod, React Router, Leaflet, PWA
- Backend: Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, JWT auth, multer uploads, PDFKit, ExcelJS, Swagger UI
- Infrastructure: Docker, docker-compose, PostgreSQL, optional MinIO container, environment-driven configuration

## Repository Structure

```text
.
├─ apps
│  ├─ api
│  │  ├─ prisma
│  │  ├─ src
│  │  │  ├─ modules
│  │  │  └─ server
│  │  └─ Dockerfile
│  └─ web
│     ├─ public
│     ├─ src
│     │  ├─ components
│     │  ├─ pages
│     │  ├─ providers
│     │  └─ lib
│     └─ Dockerfile
├─ packages
│  └─ shared
├─ scripts
├─ docker-compose.yml
├─ README.md
├─ SYSTEM_ARCHITECTURE.md
├─ API_DOCUMENTATION.md
├─ DATABASE_SCHEMA.md
├─ USER_MANUAL.md
├─ TRAINING_GUIDE.md
├─ DEPLOYMENT_GUIDE.md
└─ SECURITY_GUIDE.md
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop or Docker Engine
- PostgreSQL 16+ if running outside Docker

### Environment Variables

1. Copy `.env.example` to `.env`
2. Update the secrets and connection values for your environment

Key variables:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `APP_BASE_URL`
- `API_BASE_URL`
- `UPLOAD_DIR`
- `SMTP_*`

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate --schema apps/api/prisma/schema.prisma
```

3. Start PostgreSQL with Docker or use an existing database

4. Apply the schema:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

5. Seed the database:

```bash
npm run prisma:seed --workspace @sba/api
```

6. Start the monorepo:

```bash
npm run dev
```

Applications:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api/docs`

## Running With Docker

```bash
docker compose up --build
```

Services:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## Default Seed Users

- Super Admin: `admin@sba.gov.lr` / `ChangeMe123!`
- SBA Admin: `sba.admin@sba.gov.lr` / `ChangeMe123!`
- County Supervisor: `supervisor@sba.gov.lr` / `ChangeMe123!`
- Data Entry Officer: `data.officer@sba.gov.lr` / `ChangeMe123!`
- Inspector: `inspector@sba.gov.lr` / `ChangeMe123!`
- Data Analyst: `analyst@sba.gov.lr` / `ChangeMe123!`
- Partner Viewer: `partner@sba.gov.lr` / `ChangeMe123!`
- Financial Institution Viewer: `finance.viewer@sba.gov.lr` / `ChangeMe123!`
- MSME Owner: `owner@sba.gov.lr` / `ChangeMe123!`
- Auditor: `auditor@sba.gov.lr` / `ChangeMe123!`
- Additional operational users: `inspector@sba.gov.lr`, `auditor@sba.gov.lr`

## Tests

```bash
npm test
```

## Deployment Notes

- Use managed PostgreSQL or a hardened container deployment for production
- Replace all default passwords and JWT secrets before any shared environment deployment
- Put the API behind TLS and a reverse proxy
- Restrict `/uploads` access behind application-level authorization if sensitive files are exposed through signed URLs in a future hardening pass
- Configure SMTP and object storage for production notifications and document durability
