# ICAN CRM - Current Project Map

Status: CURRENT repository snapshot, 2026-09-18. This is a frontend code inventory, not a claim that backend integrations are deployed or that every route has passed an end-to-end test. Architecture policy: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Engineering roadmap: [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md).

## Stack and platform

React 19, Vite 5, React Router 6, TanStack Query 5, Axios, Zustand, Tailwind CSS/CSS variables, i18next/react-i18next, React Hook Form/Zod, Sonner, lucide-react, Laravel Echo/Pusher, @xyflow/react and @dnd-kit. Entry: `src/main.jsx` -> `src/App.jsx`. The app has a protected layout under `src/app/router/index.jsx`, navigation configuration under `src/app/navigation`, reusable UI under `src/shared`, feature APIs/hooks under `src/features`, global stores under `src/store` and translations under `src/locales`.

Tenant API base URL is resolved by `src/services/tenantResolver.js` and `apiBaseUrl.js`; `httpClient.js` attaches bearer authorization and the existing `api_password` query parameter. The Vite dev proxy has its own tenant-host resolution. Authentication and session refresh use the auth feature/store. Access tokens are persisted on the client. `VITE_API_PASSWORD` is bundled into browser code and must not be treated as a secret; replacing this contract requires backend work. `src/realtime` contains shared Echo integration. Navigation has module/permission filtering when user entitlements are available, but the current route guard protects authentication only; backend authorization is required.

## Current routes and capabilities

| Area | Main URLs | Status | Code ownership / qualification |
| --- | --- | --- | --- |
| Authentication/dashboard | `/login`, `/` | CURRENT | `features/auth`, `pages/auth`, `pages/dashboard`, `features/analytics` API/hooks |
| Leads and customer center | `/leads`, `/LeadsCenter/*`, `/lead/:customerId`, `/leads/:customerId` | CURRENT, transitional | `features/leads`, `features/customers`, extensive `pages/customers` implementation |
| Activities, calls, meetings, reports | `/activities`, `/activities/calls`, `/activities/meetings`, `/activities/calendar`, `/LeadsCenter/activities` | CURRENT, transitional | `features/activities`, `features/call-meetings`, customer activity screens; calendar is activity-specific |
| Tasks | `/tasks` | CURRENT | `features/tasks`, route page |
| Proposals/templates | `/LeadsCenter/proposals/*`, `/templates` | CURRENT, transitional | `features/proposals` API/hooks, proposal builder and views under `pages/customers/pages/proposals` |
| Opportunities | `/opportunities` | PARTIAL | `features/opportunities`, `pages/opportunities`; do not confuse discovery center with a future full sales opportunity pipeline |
| Advertising campaigns | `/campaigns` | CURRENT | Meta/ad-related `features/campaigns`, `features/meta-integrations`; not outbound messaging |
| Outreach campaigns | `/outreach-campaigns/*` | CURRENT, transitional | `features/outreach-campaigns` and route/wizard UI; legacy `features/MessegeCampaign` supplies API/hooks through an adapter |
| Conversations / internal chat | `/conversations`, `/team-chat` | CURRENT | `features/conversations`, `features/internal-chat`, realtime; provider behavior depends on configured backend integrations |
| Products and services | `/products/*` | CURRENT | `features/products`, `pages/products` |
| Teams/users/settings/integrations | `/teams`, `/users`, `/settings/*`, `/integrations/facebook/callback` | CURRENT, partial integration | `features/teams`, `features/users`, `features/integrations`, `features/meta-integrations`, settings pages |
| Automation | `/automation` | PARTIAL | `features/workflow-engine`, `shared/components/visual-flow`; local frontend drafts exist, backend execution/persistence is not connected |
| Notifications and AI | Header/global services | PARTIAL | `features/notifications`, `features/ai-agent`; AI permission scaffold has tests, not a claim of full autonomous backend |
| Customer Service tickets/SLA/knowledge base | No route | PLANNED | Reuse Customers, Tasks, Activities and Conversations when developed |

`src/shared/components/data-table` is the canonical configurable table, with formatting, filtering, export, resizing, split layouts and related hooks. `data-table - Copy` is a LEGACY copy without detected source consumers. Do not import from it. Generic Visual Flow belongs to `shared`; CRM workflow definitions belong to `features/workflow-engine`. `features/integrations` and `features/meta-integrations` overlap and await a tested ownership migration.

## Languages, direction and appearance

Arabic and English share `src/locales/{ar,en}/common.json`; `src/App.jsx` synchronizes document language/direction for both startup and language changes. `src/store/themeStore.js` plus `app/providers/ThemeProvider.jsx` control a persisted dark class. Semantic CSS tokens live in `src/index.css`. Translation-key parity is automated, but UI string/direction/theme coverage is not complete across every domain; consult the [audit report](docs/ARCHITECTURE_REFACTOR_REPORT.md) before claiming full coverage.

## Run and validate

```bash
npm install
npm run dev
npm run build
npm run lint
npm run check:i18n
npm run check:architecture
npx vitest run
```

`npm start` binds Vite to port 3000 for local/tenant subdomain access. Configure Vite API root/proxy values for your backend; do not commit real credentials. `npm test` starts watch mode, whereas `npx vitest run` exits after tests. See the report for actual validation results and known gaps.
