# Security Policy

## Prototype Scope

This application is a take-home prototype for alcohol label verification. It does not include
production authentication, authorization, audit logging, or integration with COLA systems.

## Security Controls Included

- Server-side API routes keep AI Gateway credentials out of the browser.
- Uploaded images and CSV rows are processed in memory and are not persisted by the app.
- Upload limits cap batch size, per-image bytes, total image bytes, CSV size, CSV rows, and CSV cell length.
- Batch uploads reject duplicate filenames so CSV rows cannot be silently matched to the wrong file.
- Client-facing errors are sanitized to avoid leaking provider or SDK details.
- Downloaded CSV reports escape leading spreadsheet formula characters.
- Global security headers set `nosniff`, deny framing, restrict referrers, and disable camera, microphone, and geolocation permissions.

## Known Production Gaps

- Public AI-powered endpoints should be protected with authentication, rate limiting, and per-user usage budgets before real use.
- Browser-provided MIME types are not sufficient for production file validation. Add image signature and dimension validation with a safe decoder.
- Label images may contain business-sensitive names, addresses, artwork, or importer details. Confirm provider data retention and logging policies before processing regulated or confidential labels.
- Add centralized audit logs, monitoring, alerting, and incident response procedures for production.

## Reporting Issues

For this take-home repository, report issues through the repository owner. Do not include real label images, secrets, or personally identifiable information in public issue reports.
