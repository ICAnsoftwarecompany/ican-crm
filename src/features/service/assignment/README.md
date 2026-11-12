# Assignment & distribution shared engine — API adapter

Updated: 2026-11-13 00:19 (Africa/Cairo).

**Owner:** shared Customer Hub assignment infrastructure, usable by support tickets, shipping and subscriptions when the backend accepts the corresponding `entity_type`. It is not shipping-only.

## Public API

`api/assignmentApi.js` exports `assignmentApi`:

- `rules.list/create/update/remove` — GET/POST/POST /{id}/DELETE /{id} on `/tenant/service/assignment-rules`.
- `distribution.list/create/remove` — GET/POST/DELETE /{id} on `/tenant/service/distribution-settings`.
- `owners.list(customerId)/create/remove` — GET customer owners, POST/DELETE account owners. DELETE body is **unconfirmed**; verify before exposing destructive UI.
- `assign(payload)` — POST generic `entity_type/entity_id/team_id/user_id` assignment.
- `logs()` — GET assignment audit log.

Transport: shared `httpClient` for tenant authentication and API password. Do not hardcode Postman credentials. Postman contains no sample responses, so pagination/envelopes and DELETE owner payload need backend verification. `entity_type: ticket` is confirmed as an example; shipping/subscription types must not be guessed. This adapter does not replace existing mocked Service settings or implement permission enforcement.

## UI

`components/AssignmentSettingsPanel.jsx` shows live assignment rules, distribution settings and audit logs read-only until response schemas are confirmed. No fabricated data or destructive controls.
