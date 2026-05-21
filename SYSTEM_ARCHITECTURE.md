# System Architecture

## Overview

The platform is implemented as a TypeScript monorepo with three main layers:

- `apps/web`: React PWA for public views, authenticated dashboards, registry management, offline draft capture, and reporting workflows
- `apps/api`: Express API with Prisma, JWT authentication, RBAC, analytics, workflows, reporting, imports, exports, and audit logging
- `packages/shared`: Shared role, permission, navigation, and master-data constants

## Frontend Architecture

- React Router provides public and authenticated route separation
- Auth state is managed with a lightweight provider and refresh-token-aware API wrapper
- React Query handles server fetching and cache invalidation
- Tailwind CSS provides the design system foundation using Liberia-inspired government colors
- Recharts powers executive and county analytics
- React Hook Form and Zod provide form control and validation
- IndexedDB stores offline drafts for MSME and BDSP records
- Vite PWA support provides installable offline-first behavior and service worker registration

## Backend Architecture

- Express server with modular routers per domain:
  - `auth`
  - `users`
  - `access-control`
  - `msmes`
  - `bdsps`
  - `products`
  - `opportunities`
  - `verifications`
  - `reports`
  - `analytics`
  - `imports`
  - `exports`
  - `files`
  - `notifications`
  - `audit-logs`
  - `settings`
  - `sync`
  - `public`
- Prisma handles database access, migrations, and seed operations
- REST APIs are protected using authentication and permission middleware
- Rate limiting, secure headers, and structured JSON error handling are enabled globally

## Database Design

- PostgreSQL with normalized master data and registry tables
- Explicit role and permission join tables for flexible RBAC
- Workflow, verification, and audit entities for traceable lifecycle management
- JSON fields used only where flexibility is required:
  - report summaries
  - metadata
  - offline sync payloads
  - import mappings

## Security Model

- Access tokens are short-lived JWTs
- Refresh tokens are stored server-side as hashed rotating tokens
- Passwords are hashed using Argon2
- Account lockout is enforced after repeated failed attempts
- Sensitive changes are written to `audit_logs`
- File access is captured through `data_access_logs`
- Soft delete is used for sensitive records instead of destructive removal

## Offline Sync Model

- Field users capture simplified MSME or BDSP drafts in IndexedDB
- Local records are assigned a `localRecordId`
- Manual sync sends queued drafts to `/api/sync/push`
- The backend creates `offline_sync_records`, detects duplicate conflicts, and responds with:
  - `SYNCED`
  - `FAILED`
  - `CONFLICT`
- Conflict states preserve local context for follow-up review

## Reporting Model

- Reports are generated server-side through `/api/reports/generate`
- Summary datasets are stored on the `reports` table
- Export artifacts are generated into `/uploads/reports`
- Output formats currently supported:
  - PDF
  - XLSX
  - CSV

## Deployment Model

- Docker Compose provisions PostgreSQL, API, web, and optional MinIO
- The web app can also be served independently from static hosting
- The API should sit behind a reverse proxy such as Nginx, Traefik, or a cloud load balancer
- Backup/restore scripts are included for containerized PostgreSQL operations

