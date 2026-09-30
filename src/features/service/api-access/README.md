# api-access — Public API clients & outbound webhooks (F5, spec §16.4–16.5)

Settings → **API & webhooks**. The fourth kind of authentication next to API Password, staff Bearer and the portal
token: scoped keys for other systems, optionally bound to one customer (a B2B merchant key only ever sees that
customer's data). Outbound webhooks push domain events (§6.3 contract) to external URLs, HMAC-signed, with retries.

| Piece | Where |
|---|---|
| API clients: list, create/edit (scopes, bound customer, rate limit, IP allowlist), rotate, disable, delete | `components/ApiClientsPanel.jsx`, `ApiClientDialog.jsx`, `ScopeChecklist.jsx` |
| Webhooks: list + health, create/edit (URL, events, linked client), test, rotate secret, pause, delete | `components/WebhooksPanel.jsx`, `WebhookDialog.jsx`, `EventChecklist.jsx` |
| Delivery log: status, HTTP code, attempts, next retry, payload, redeliver | `components/WebhookDeliveriesDrawer.jsx` |
| Key / secret shown once | `components/OneTimeSecretDialog.jsx` |
| API + hooks | `api/apiAccessApi.js` |
| Mock | `mocks/seeds/apiAccessSeed.js`, `mocks/handlers/apiAccessHandlers.js` (+ test) |

## Security rules the UI follows

- The clear key (`ick_live_…`) and webhook secret (`whsec_…`) exist only in the create / rotate response and in the
  one-time dialog's props. They are never put in React Query caches, stores or storage; lists show prefix + last 4.
- Scopes and events are labels over backend values; the server enforces them. A key bound to a customer may only hold
  `records.*`, `cases.*`, `tracking.read` (server answers 422 `not_allowed_for_bound`).
- Only `https://` webhook URLs. Receivers must verify `X-ICAN-Signature` and dedupe on `event_id` (redelivery keeps it).

## Endpoints

| Call | Status |
|---|---|
| `CRUD /api/tenant/api-clients` — POST answers `{ data, key }` | spec §51 (response shape proposed) |
| `GET /api/tenant/api-clients/catalog` → `{ scopes, bound_scopes, events, max_attempts, signature_header }` | proposed |
| `POST /api/tenant/api-clients/{id}/rotate` → `{ data, key }` (409 `API_CLIENT_DISABLED`) | proposed |
| `CRUD /api/tenant/webhook-subscriptions` — POST answers `{ data, secret }`; list adds `deliveries_24h`, `failed_24h`, `last_delivery_at`, `consecutive_failures` | spec §51 (extras proposed) |
| `POST /api/tenant/webhook-subscriptions/{id}/rotate-secret` → `{ data, secret }` | proposed |
| `POST /api/tenant/webhook-subscriptions/{id}/test` → delivery of `service.ping` | proposed |
| `GET /api/tenant/webhook-subscriptions/{id}/deliveries?status=failed\|delivered` | proposed |
| `POST /api/tenant/webhook-deliveries/{id}/redeliver` (409 `DELIVERY_ALREADY_DELIVERED`) | proposed |

Mock behavior: endpoints on `example.org` fail (503) so retries show; a manual redelivery succeeds.

Not built: the public API itself (`/public/v1/*`, server), usage charts per key, auto-disabling a webhook after N
failures (the UI shows `consecutive_failures`), per-key audit log view (spec: Security Audit).
