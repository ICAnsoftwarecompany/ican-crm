# ICAN CRM

React/Vite multi-tenant CRM frontend. The current codebase inventory is [README_About_project.md](README_About_project.md); architecture and mandatory development rules are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md).

## Start

```bash
npm install
npm run dev
```

Vite serves port 3000 by default. Configure the tenant API root/dev proxy and backend credentials for your environment. Do not put real secrets in `VITE_*`: these values are public in the browser bundle. The existing backend requires `VITE_API_PASSWORD` as an `api_password` request parameter; treat this as a compatibility value, not a secret.

## Checks

```bash
npm run build
npm run lint
npm run check:i18n
npm run check:architecture
npx vitest run
```

`npm test` runs Vitest in watch mode. The architecture report records actual check results and unresolved migration work: [docs/ARCHITECTURE_REFACTOR_REPORT.md](docs/ARCHITECTURE_REFACTOR_REPORT.md).
