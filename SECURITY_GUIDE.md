# Security Guide

## Security Assumptions

- The app is deployed behind HTTPS
- PostgreSQL credentials are managed securely
- JWT secrets are rotated and protected
- Administrative access is limited to trusted SBA or implementation staff

## Implemented Security Controls

- Argon2 password hashing
- JWT access tokens and rotating refresh tokens
- Role-based and permission-based access control
- Rate limiting on the API
- Helmet-based secure headers
- Input validation using Zod
- ORM-based SQL injection protection through Prisma
- Audit logging for key actions
- Soft deletes for sensitive registries
- Login history and account lockout support
- File metadata access control structure

## Password Policy

Recommended production policy:

- Minimum 12 characters
- Uppercase and lowercase letters
- Numbers
- Symbols
- Rotation after privileged compromise or policy interval

## Access Control Recommendations

- Keep partner and public access strictly aggregated
- Use county-scoped assignments for supervisors and field staff
- Review role-permission mappings quarterly
- Disable or suspend inactive accounts promptly

## Audit Logging Coverage

The system records:

- login success and failure
- user creation and updates
- workflow transitions
- imports and exports
- report generation
- file access events
- permission changes

## Data Protection Recommendations

- Move uploads to protected object storage with signed URLs in production
- Encrypt database backups at rest
- Restrict database network access to application hosts only
- Introduce antivirus scanning for uploaded files in production
- Consider row-level security or tenant-aware scoping if the platform expands into deeper external partner access

## Remaining Production Hardening Items

- Email delivery integration for password resets and invitations
- Optional MFA for privileged roles
- Dedicated background job worker for scheduled reports and sync retry orchestration
- Signed URL download pattern for sensitive files
- Centralized SIEM integration for audit log export
- Automated dependency and container vulnerability scanning

