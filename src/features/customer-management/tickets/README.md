# Customer Management Tickets

Updated: 2026-11-18 22:10 (Africa/Cairo).

The service-case workspace in `src/features/service/cases` owns the shared
list, board, forms, filters, and API behavior. Customer Management passes the
active industry config from `industryTemplateConfig.js`; industry terminology is
resolved at display time. Add a dedicated industry workspace only when the
workflow itself differs, not for simple text or field configuration.

Current industry settings change ticket wording only; statuses, queues, payloads, and case APIs
remain shared. See [`../INDUSTRY-TEMPLATES.md`](../INDUSTRY-TEMPLATES.md) for the full extension and
known-gap guide.
