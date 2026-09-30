# features/portal — Customer portal domain (F5)

Spec §43–44. Used only by the portal app entry (`portal.html` → `src/portal`). Never imported by the CRM.

| Path | Role |
|---|---|
| `api/portalClient.js` | Portal HTTP: `services/portalHttpClient` (portal token, **no staff session**) + the Service mock switch (`features/service/portal-transport.js`, module `portal`). |
| `api/portalApi.js` | Sign-in (OTP, B2B password), `/me`, profile switch, generic list/detail/mutation hooks. Query keys include the active membership. |
| `store/portalSessionStore.js` | Portal token + `/me` snapshot (`ican-portal-session`), separate from the staff `authStore`. |
| `store/portalPreferencesStore.js` | Dark mode for the portal. |
| `hooks/usePortalAccess.js` | `can(object, action)` from the membership's policy — UI only; the API enforces it. |
| `constants/sections.js` | Navigation: tenant-enabled sections ∩ policy permissions. |
| `components/auth` | Sign-in (one-time code, company email + password), guest shipment tracking. |
| `components/layout` | Branded shell, profile switcher (one person, several memberships), language / theme, sign-out. |
| `components/*` | Home, My services (records + detail: fields, updates, log, documents upload), Requests (list, detail with customer-visible messages, reply, new), Request catalog (form from `form_schema`), Payments (schedules, gateway payment, COD transfers), What I have (assets, entitlements, subscriptions, contracts), Documents, Help (KB + feedback), Company users (B2B admin). |

Rules: every call is scoped by the server to the active membership (the client never sends a customer id); deny wins over
allow; internal notes, queues, agents and costs never reach the portal; OTP answers are identical for unknown accounts (no
enumeration) and rate limited. The mock keeps portal sessions in localStorage so a reload stays signed in (demo code
`123456`, company password `Portal@123`).
Not in F5: file storage (uploads send the name only in the mock), real payment gateway redirect, contract PDFs, MFA.
