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


## Settings navigation split (2026-11-13)

The settings registry now renders the existing `AssignmentSettingsPanel` with `sectionKey='rules'` or `sectionKey='distribution'` on separate URLs. Only the requested API is fetched per page; no combined logs section. This remains read-only until edit contracts are verified.


## Assignment rules CRUD (2026-11-13)

The assignment rules page now has tabs for each entity_type returned by the GET API (fallback ticket when no records exist). It supports POST create and POST update by ID using the existing assignmentApi, with JSON-object conditions, optional team/user/timeout numeric fields, active flag, and priority. The distribution page stays read-only. Types not returned by the API cannot be discovered; users can type a new type when creating a rule. No delete endpoint was confirmed. Mutation invalidates the rules and overview caches. This UI does not claim to validate backend-specific assignment methods or condition keys.


## Tab-local create action (2026-11-13)

The Add rule action lives inside the selected entity-type tab and uses the selected type in the POST payload; the form displays the type read-only to prevent accidental cross-tab creation. Add and Save use theme surface/text tokens and visible borders instead of white text on an undefined primary background. A fallback ticket tab is used only when the API returns no types.


## Distribution create/delete and drawers (2026-11-13)

Distribution uses live GET/POST/DELETE `/api/tenant/service/distribution-settings[/{id}]`, separate tabs per discovered entity_type, and a tab-scoped Add action. Create uses the documented `scope`, `strategy`, `fallback_strategy`, and entity type; strategy choices are the six values supplied in the API contract. Delete requires confirmation in a shared `AppDrawer`. Assignment rule create/edit also use `AppDrawer` rather than inline forms. **Distribution update is intentionally not enabled**: the provided contract does not specify an update HTTP method, so no unsupported endpoint/method was guessed. Types with no records cannot be discovered until a types API is supplied.
