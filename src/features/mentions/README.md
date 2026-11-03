# Mentions feature

> Documentation update: 2026-11-03 22:48 (Africa/Cairo) — phase 1 API and React Query integration.

## Ownership
Owns the internal mentions API integration and query hooks. The Laravel backend remains responsible for tenant isolation, recipient permissions, mention creation, read receipts and notifications. No new WebSocket client or authentication flow is introduced.

## Public API
Import from `features/mentions`:
- `mentionsApi`: getTypes, getMine, getSent, getUnseenCount, getEntity, create, markSeen, markManySeen, remove.
- Query hooks: `useMentionTypes`, `useMyMentions`, `useSentMentions`, `useUnseenMentionCount`, `useEntityMentions`.
- Mutations: `useCreateMention`, `useMarkMentionSeen`, `useMarkManyMentionsSeen`, `useRemoveMention`.

All calls use `services/httpClient`; React Query keys are under `QUERY_KEYS.mentions`. Mutations invalidate the mentions key prefix. API responses are intentionally preserved unchanged until verified against a live backend.

## Integration plan
1. Lead Center: customer/lead IDs must be distinguished (customer record ID is not necessarily lead ID).
2. Deals: distinguish `deal` from `deal_lead` and use the backend's actual identifier.
3. External conversations: `whatsapp_conversation`, `messenger_conversation`, `gmail_conversation` only when backend type catalog and IDs match. Mentions remain internal and must never be submitted through a customer-message composer.
4. Internal chat: `chat` refers to the conversation. Inline @mentions tied to individual messages require a separate backend contract.
5. Notifications: reuse existing tenant notification realtime infrastructure only after confirming the event payload and routing.

## Known gaps
- Phase 1 is API/query infrastructure only; no buttons, dialogs, inbox route, or module integration yet.
- Response shapes, create payload schema, pagination and realtime mention event payload must be verified on the running tenant backend.
- The backend must authorize access to the referenced entity for both sender and recipient; frontend checks are not security boundaries.
- Do not treat mention type `action` or `transfer` as execution of an approval or ownership transfer.
- No database migrations are appropriate in this frontend repository.

See [integration design](../../../docs/mentions/README.md).

## Phase 2 — entity viewer (2026-11-03 23:10 Africa/Cairo)
- Reusable `EntityMentionsButton` displays an on-demand modal with loading, empty, error and retry states; first consumer is the Deal Workspace header.
- `extractMentions` supports array and common paginated response wrappers. It does not claim an authoritative backend response contract.
- Viewer is read-only until the create request schema and recipient permission semantics are verified.

## Implementation update — 2026-11-03 (Africa/Cairo)
- Added `MentionComposer` using existing user/team hooks, validated selection, and documented `entity_type`, `entity_id`, `user_ids`, `team_ids`, `type`, `message` request fields.
- Entity viewer now supports create and list tabs; available on Deal Workspace and Customer Details Drawer.
- Added read-only `MentionsInbox` component (received/sent). It is not yet mounted in the global header.
- Inline @mentions and external conversation surfaces remain pending; customer-facing composers were not modified.
- Verification pending: tenant API responses, authorization, build and repository checks.
