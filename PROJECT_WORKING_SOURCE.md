# ICAN CRM — Working Source Reference

Updated: 2026-10-31 (Africa/Cairo).

This is a living project reference, not a completed source-code audit.

## Repository
`ICAnsoftwarecompany/ican-crm` (default branch: `master`) is a multi-tenant omnichannel CRM frontend. Its Laravel backend is in a separate repository.

## Technology
React 19, Vite 5, React Router 6, TanStack Query 5, Axios, Zustand, Tailwind CSS, i18next (Arabic and English), React Hook Form, Zod, Laravel Echo/Pusher, Recharts and Vitest.

## Structure
- `src/app`: router, navigation and providers.
- `src/pages`: route composition.
- `src/features`: domain logic, API modules, hooks and components.
- `src/shared`: domain-independent reusable UI and utilities.
- `src/services`: HTTP and tenant handling.
- `src/realtime`: realtime integration.
- `src/store`: app-wide state.
- `src/locales/ar`, `src/locales/en`: translations.

## Functional domains
Leads, customers, assignment, deals, opportunities, proposals, activities, calls, meetings, WhatsApp/Messenger/Gmail conversations, team chat, Meta ads, outreach, social media, tasks, workflow automation, reports, customer service, alerts, integrations and settings.

## Rules for future work
Follow `CLAUDE.md` and the relevant docs. Preserve API contracts, route URLs and realtime query keys unless explicitly requested. Tenant resolution must remain dynamic; backend controls authorization. Translate UI text into ar/en, support RTL/LTR and semantic theme tokens, reuse shared engines, and update docs with changes. If docs disagree with code, code wins.

## References
`README.md`, `CLAUDE.md`, `docs/README.md`, `docs/1-ARCHITECTURE.md`, `docs/2-SALES.md`, `docs/3-FEATURES.md`, `docs/4-CUSTOMER-SERVICE.md`.

## Checks
`npm run lint`, `npm run check:i18n`, `npm run check:architecture`, `npm run check:service`, `npx vitest run`, `npm run build`.

## Review status
Repository tree inventoried (3,041 entries including directories). README, CLAUDE guide, package manifest and initial domain documentation reviewed. Individual review of all source files, runtime verification and backend review are not yet complete.
