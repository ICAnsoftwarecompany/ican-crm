# ICAN CRM

Multi-tenant omnichannel CRM **frontend**: leads and customers, sales pipeline and deals, activities, proposals, WhatsApp/Messenger/Gmail inbox, internal chat, Meta ad campaigns, outreach messaging, social media, tasks and automation. React 19 + Vite 5; the Laravel backend is a separate repository.

## Run

```bash
npm install
cp .env.example .env   # set tenant root domain, dev proxy and backend values
npm run dev            # http://localhost:3000
```

Open the app from a tenant subdomain (or enable `VITE_API_USE_DEV_PROXY`). `VITE_*` values are bundled into the browser — never put secrets there; `VITE_API_PASSWORD` is a compatibility value, not a secret.

## Checks

```bash
npm run lint
npm run check:i18n
npm run check:architecture
npx vitest run         # npm test = watch mode
npm run build
```

## Documentation

1. [docs/1-ARCHITECTURE.md](docs/1-ARCHITECTURE.md) — structure, rules, tenant/auth, realtime, i18n, theme, shared engines, Definition of Done.
2. [docs/2-SALES.md](docs/2-SALES.md) — sales domain: leads, customers, statuses, assignment, activities, deals, opportunities, proposals.
3. [docs/3-FEATURES.md](docs/3-FEATURES.md) — conversations, chat, campaigns, outreach, social media, tasks, automation, integrations, settings.

AI coding agents: see [CLAUDE.md](CLAUDE.md).
