# API Documentation

## Base URL

- Local API: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api/docs`

## Authentication

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `POST /api/auth/invitations`
- `POST /api/auth/invitations/accept`

Access token usage:

```http
Authorization: Bearer <access-token>
```

## Endpoint Groups

### Access Control

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`
- `GET /api/users/:id/login-history`
- `GET /api/roles`
- `PATCH /api/roles/:id/permissions`
- `GET /api/permissions`

### MSME Registry

- `GET /api/msmes`
- `GET /api/msmes/map`
- `POST /api/msmes/duplicate-check`
- `POST /api/msmes`
- `GET /api/msmes/:id`
- `PATCH /api/msmes/:id`
- `DELETE /api/msmes/:id`
- `POST /api/msmes/:id/workflow`
- `GET /api/msmes/:id/history`

### BDSP Registry

- `GET /api/bdsps`
- `GET /api/bdsps/map`
- `POST /api/bdsps`
- `GET /api/bdsps/:id`
- `PATCH /api/bdsps/:id`
- `DELETE /api/bdsps/:id`
- `POST /api/bdsps/:id/workflow`
- `POST /api/bdsps/:id/support-records`
- `GET /api/bdsps/:id/performance-summary`
- `GET /api/bdsps/:id/history`

### Products and Opportunities

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/opportunities`
- `POST /api/opportunities`
- `GET /api/opportunities/:id`
- `PATCH /api/opportunities/:id`
- `DELETE /api/opportunities/:id`
- `POST /api/opportunities/:id/matches`

### Verification, Reports, and Analytics

- `GET /api/verifications`
- `POST /api/verifications`
- `GET /api/verifications/:id`
- `PATCH /api/verifications/:id`
- `GET /api/reports`
- `POST /api/reports/generate`
- `GET /api/reports/history`
- `GET /api/reports/:id`
- `POST /api/reports/:id/export`
- `GET /api/analytics/executive`
- `GET /api/analytics/county/:countyId`
- `GET /api/analytics/data-quality`
- `GET /api/analytics/partner`

### Data Operations

- `GET /api/imports`
- `POST /api/imports/preview`
- `POST /api/imports/:id/execute`
- `POST /api/imports/:id/rollback`
- `GET /api/imports/:id/errors`
- `POST /api/exports`
- `POST /api/files/upload`
- `GET /api/files/entity/:entityType/:entityId`
- `GET /api/files/:id`
- `DELETE /api/files/:id`
- `GET /api/sync`
- `POST /api/sync/push`
- `POST /api/sync/:id/retry`

### Administration

- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`
- `GET /api/audit-logs`
- `GET /api/settings/master-data`
- `GET /api/settings/lookups/:category`
- `POST /api/settings/lookups`
- `PATCH /api/settings/lookups/:id`
- `GET /api/settings/system`
- `POST /api/settings/system`
- `PATCH /api/settings/system/:key`

### Public Read-Only

- `GET /api/public/stats`
- `GET /api/public/reports`
- `GET /api/public/bdsp-directory`

## Example Requests

### Login

```json
POST /api/auth/login
{
  "email": "admin@sba.gov.lr",
  "password": "ChangeMe123!"
}
```

### Create MSME

```json
POST /api/msmes
{
  "businessName": "Monrovia Digital Studio",
  "businessType": "Corporation",
  "msmeCategory": "Small",
  "formalityStatus": "Registered",
  "countyId": "county-id",
  "cityTownCommunity": "Sinkor",
  "sectorId": "sector-id",
  "ownerName": "Sarah Doe",
  "youthLed": true,
  "womenLed": true,
  "financingNeeds": ["Working Capital"],
  "trainingNeeds": ["Digital Skills"],
  "marketAccessNeeds": [],
  "equipmentNeeds": [],
  "dataSource": "MANUAL",
  "verificationStatus": "PENDING",
  "approvalStatus": "DRAFT",
  "owners": []
}
```

### Generate Report

```json
POST /api/reports/generate
{
  "title": "Monthly MSME Registration Report - May 2026",
  "type": "MONTHLY_MSME_REGISTRATION",
  "reportingPeriod": "2026-05",
  "countyIds": [],
  "sectorIds": [],
  "formats": ["PDF", "XLSX"]
}
```

