# Customer Management Industry Templates

Updated: 2026-11-18 22:10 (Africa/Cairo).

This document describes the current frontend implementation. It is the extension guide for
`src/features/customer-management/`; the repository-level architectural policy is in
[`docs/customer-service/CUSTOMER-HUB-MODULE-RULE.md`](../../../docs/customer-service/CUSTOMER-HUB-MODULE-RULE.md).

## Ownership and files

- `industryTemplateConfig.js` is the single source for supported industry presentation settings and
  the `resolveCustomerManagementTemplate` fallback.
- `industryTemplates.js` reads the active key through `useSetupTemplates()` and returns the normalized
  template. The query is shared with the existing Service setup wizard through React Query.
- `customer-directory/shared/` owns the common customer list and table.
- Tickets use the shared case engine at `src/features/service/cases`; Customer Management supplies its
  template and industry term key.
- Reports use the shared report engine at `src/features/service/reports`; Customer Management supplies
  the allowed tabs.
- Route pages remain in `src/pages/customer-management/` and compose data + feature workspace only.

## Runtime flow

1. The Service setup wizard applies a template through `POST /settings/templates/{key}/apply`.
2. The backend or mock setup API exposes the active key as `meta.active` in
   `GET /settings/templates`.
3. `useCustomerManagementTemplate()` resolves that key. Unknown or missing keys fall back to `devices`.
4. Customer directory, ticket, and report route pages pass only their relevant config to shared views.
5. Applying a template invalidates the existing Service query family. Screens re-read the active
   template through the same query key; there is no separate local-storage selection.

## Configuration contract

Each entry in `CUSTOMER_MANAGEMENT_TEMPLATES` contains:

- `directory.columns`: IDs of existing directory table columns to show. The shared table remains
  responsible for renderers, filters, sorting, pagination, and empty/error states.
- `tickets.key`: stable industry key used for industry-specific case copy and view labels.
- `tickets.termKey`: i18n term under `service.terms.*` for the singular/plural case name.
- `reports.tabs`: allowed existing tabs from the shared reports workspace (`overview`, `feedback`,
  `quality`, `advanced`). A disallowed `?tab=` falls back to the first allowed tab.

The current keys are `devices`, `shipping`, `school`, and `tourism`. Add both Arabic and English
locale entries when introducing a new visible term. Do not use raw industry keys as user-facing text.

## Extension procedure

1. Confirm the active key is returned by the setup API and is stable across environments. Do not infer
   industry from route, account data, or the enabled-module list.
2. Add a template entry in `industryTemplateConfig.js`, using only column IDs and report tabs that the
   shared engines actually support.
3. Add industry terms and copy to both locale trees when needed; connect the `termKey` from config.
4. Add or extend resolver tests for the new key and fallback behavior.
5. Keep the common workspace when the difference is configuration (columns, labels, visible tabs).
   Create an industry-specific workspace only for a real layout, interaction, validation, or workflow
   difference. Put that implementation under the owning feature's `industries/<key>/` and register an
   explicit adapter; do not create pass-through wrappers.
6. Preserve routes, query keys, API payloads and backend values. UI templates do not grant permissions.
7. Update this guide, the feature READMEs, `docs/4-CUSTOMER-SERVICE.md`, `docs/README.md`, and
   `CLAUDE.md` in the same change.

## Current scope and known gaps

- Directory templates change the visible columns only. All industries still use the same customer
  query and backend record model; the configuration cannot create new backend fields.
- Ticket templates change supported labels and copy. Case list/board behavior, form payload, statuses,
  queues, and API remain shared. Sector-specific case fields/workflows are not implemented by this
  presentation registry.
- Report templates currently restrict the existing tab set. Industry-specific metrics, report data
  sources, and endpoints are not implemented here.
- The active template currently comes from the Service setup-template contract. There is no separate,
  verified Customer Management industry endpoint in this frontend. Treat backend activation and
  authorization as authoritative; this UI configuration is not a security boundary.

Before declaring industry behavior production-ready, verify backend template persistence, field
schemas, report contracts, module permissions, and migration behavior with the backend owner.
