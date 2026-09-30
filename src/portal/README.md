# src/portal — Customer portal app shell (F5)

Second Vite entry: `portal.html` → `main.jsx` → `PortalApp.jsx` (QueryClient, i18n + document direction, dark mode,
tenant branding) → `router.jsx` (basename `VITE_PORTAL_BASENAME`, default `/portal`).
Shares only `shared/`, `locales/` (`portal.*`) and `services/` with the CRM — no staff auth, router, realtime or layout.
Dev: `npm run dev` then open `/portal` (a dev middleware serves `portal.html` for `/portal/*`).
Build: `npm run build` emits `dist/portal.html` + its own chunks; deploy it on the portal subdomain (or `/portal`) with an
SPA fallback to `portal.html`. Domain code lives in `features/portal`.
