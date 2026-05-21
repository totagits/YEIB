# Deployment Guide

## 1. Server Requirements

### Minimum Pilot Environment

- 4 vCPU
- 8 GB RAM
- 100 GB SSD
- Docker Engine
- TLS-capable reverse proxy

### Recommended Production Baseline

- 8 vCPU
- 16 GB RAM
- 250 GB SSD
- Managed PostgreSQL or replicated PostgreSQL setup
- Nightly backup schedule
- Centralized monitoring and log aggregation

## 2. Environment Preparation

1. Copy `.env.example` to `.env`
2. Replace all secrets
3. Confirm `DATABASE_URL`, `APP_BASE_URL`, and `API_BASE_URL`
4. Configure SMTP and object storage as required

## 3. Docker Deployment

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

## 4. Database Migration and Seed

Generate Prisma client:

```bash
npx prisma generate --schema apps/api/prisma/schema.prisma
```

Apply migrations:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Seed data:

```bash
npm run prisma:seed --workspace @sba/api
```

## 5. Backup and Restore

Shell:

```bash
./scripts/backup-db.sh
./scripts/restore-db.sh backup_file.sql
```

PowerShell:

```powershell
.\scripts\backup-db.ps1
.\scripts\restore-db.ps1 -InputFile backup_file.sql
```

## 6. SSL / TLS Setup

- Terminate TLS at Nginx, Traefik, or your cloud load balancer
- Force HTTPS for the portal
- Set secure cookie mode in production
- Use HSTS and modern TLS settings at the edge

## 7. Production Environment Variables

At minimum, set:

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `APP_BASE_URL`
- `API_BASE_URL`
- `COOKIE_DOMAIN`
- `UPLOAD_DIR`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`

## 8. Post-Deployment Checklist

- Change all seed passwords
- Create named county accounts
- Validate report generation
- Validate file upload and access permissions
- Confirm backups complete successfully
- Confirm public endpoints expose only approved aggregate data

