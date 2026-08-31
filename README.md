# ICAN CRM

Arabic-first CRM frontend built with React, Vite, Tailwind CSS, Zustand, Axios, and TanStack Query.

## Run

```bash
npm install
npm start
```

Local URL:

```text
http://localhost:3000
```

## Environment

Create `.env`:

```bash
VITE_API_URL=https://your-backend-url
VITE_API_PASSWORD=TenantSecret
VITE_TENANT=test006
VITE_WS_URL=ws://your-backend-url
```

Restart Vite after changing `.env`.

## Scripts

```bash
npm start
npm run dev
npm run build
npm run test
```

## Current Scope

- Auth and protected layout.
- Unified `httpClient` with bearer token and `api_password`.
- API modules generated from the Postman collection.
- React Query hooks for the main CRM modules.
- Operational first-pass pages for Dashboard, Customers, Leads, Teams, Products, Conversations, Campaigns, and Settings.
- AI permission scaffold and basic AI components.

Detailed planning lives in [PROJECT_DEVELOPMENT_PLAN.md](./PROJECT_DEVELOPMENT_PLAN.md).
