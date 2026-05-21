# Database Schema

## Core Security and Access Tables

- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `refresh_tokens`
- `password_reset_tokens`
- `user_invitations`
- `login_history`

## Master Data Tables

- `counties`
- `districts`
- `sectors`
- `subsectors`
- `lookup_items`
- `system_settings`

## Registry Tables

- `msmes`
- `msme_owners`
- `msme_products`
- `msme_documents`
- `bdsps`
- `bdsp_services`
- `bdsp_documents`
- `bdsp_county_coverage`
- `bdsp_support_records`

## Workflow and Operational Tables

- `verification_visits`
- `workflow_actions`
- `opportunities`
- `opportunity_counties`
- `opportunity_matches`
- `field_collection_sessions`
- `offline_sync_records`

## Reporting and Import Tables

- `import_batches`
- `import_errors`
- `reports`
- `report_exports`

## Monitoring and Compliance Tables

- `notifications`
- `audit_logs`
- `data_access_logs`

## Relationship Highlights

- A `user` can have multiple roles through `user_roles`
- A `role` can have multiple permissions through `role_permissions`
- A `county` has many `districts`, `msmes`, `bdsps`, and `field_collection_sessions`
- An `msme` can have many owners, products, documents, verification visits, workflow actions, and opportunity matches
- A `bdsp` can have many services, coverage counties, support records, documents, verification visits, and opportunity matches
- A `report` can have many `report_exports`
- An `import_batch` can have many `import_errors`

## Important Indexes

- `users.email`
- `counties.name`
- `districts(county_id, name)`
- `msmes.business_name`
- `msmes.county_id`
- `msmes.sector_id`
- `msmes.approval_status`
- `msmes.verification_status`
- `bdsps.provider_name`
- `bdsps.provider_type`
- `workflow_actions(entity_type, entity_id)`
- `audit_logs(entity_type, entity_id)`
- `offline_sync_records(entity_type, local_record_id)` unique

## Soft Delete Strategy

Soft delete fields are used on sensitive or registry-heavy entities, including:

- `users.deleted_at`
- `counties.deleted_at`
- `districts.deleted_at`
- `sectors.deleted_at`
- `subsectors.deleted_at`
- `msmes.deleted_at`
- `msme_products.deleted_at`
- `msme_documents.deleted_at`
- `bdsps.deleted_at`
- `bdsp_documents.deleted_at`
- `opportunities.deleted_at`
- `reports.deleted_at`

## JSON / Flexible Fields

- `msmes.metadata`
- `msme_products.metadata`
- `bdsps.metadata`
- `verification_visits.photos`
- `verification_visits.documents`
- `workflow_actions.metadata`
- `offline_sync_records.payload`
- `offline_sync_records.conflict_data`
- `import_batches.field_mapping`
- `reports.summary_data`
- `reports.filters`
- `system_settings.value`

## Migration Artifact

The initial SQL migration is stored at:

- `apps/api/prisma/migrations/20260520_initial/migration.sql`

