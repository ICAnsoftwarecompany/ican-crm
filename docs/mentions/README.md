# Internal Mentions — Integration design

> Documentation update: 2026-11-03 22:48 (Africa/Cairo) — initial implementation and phased integration contract.

## Status
**PARTIAL** — Phase 1 API and React Query hooks; Phase 2 read-only Deal Workspace mention viewer. This repository is the React frontend; backend storage, authorization, broadcasting and mention behavior live in the separate Laravel backend.

## Existing backend endpoints
All paths are prefixed with `/api`, and `httpClient` adds bearer token and `api_password`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/tenant/mentions` | Create mention |
| GET | `/tenant/mentions/types` | Supported entity types |
| GET | `/tenant/mentions/mine` | Received mentions |
| GET | `/tenant/mentions/sent` | Sent mentions |
| GET | `/tenant/mentions/unseen-count` | Unseen count |
| GET | `/tenant/mentions/entity` | Mentions for entity, query: `entity_type`, `entity_id` |
| POST | `/tenant/mentions/{id}/seen` | Mark one seen |
| POST | `/tenant/mentions/seen` | Bulk/entity seen |
| DELETE | `/tenant/mentions/{id}` | Revoke mention |

Do not guess additional request fields or response structures. Verify the live contract before building the composer. The documented mention kinds are `view`, `action`, `transfer`; none implies automatic business action.

## Architecture
`src/features/mentions/api/mentionsApi.js` → existing `services/httpClient.js`.
`src/features/mentions/hooks/useMentions.js` → TanStack Query with `QUERY_KEYS.mentions`.
`src/features/mentions/index.js` is the public feature boundary. Existing notification center and Echo singleton remain the only realtime infrastructure. No `shared → features` imports.

## Scope and mapping
| Surface | Backend mention entity | Navigation rule | Implementation |
| --- | --- | --- | --- |
| Lead Center | `lead` or `customer` | Preserve `/lead/:customerId` and `/leads/:customerId`; resolve actual entity ID separately | Planned |
| Deal workspace | `deal` | Existing `/deals/:dealId/*` | Planned |
| Deal lead | `deal_lead` | Open deal + correct lead selection | Planned |
| WhatsApp | `whatsapp_conversation` | Open selected conversation, never send to customer | Planned |
| Messenger | `messenger_conversation` | Open selected conversation | Planned |
| Gmail | `gmail_conversation` | Open selected thread | Planned |
| Internal chat | `chat` | Open selected conversation; message-level @ is not in current contract | Planned |

The DealChatDock reuses existing conversation views; avoid a second implementation or duplicate mentions. Do not assume Instagram/SMS mention types until the backend catalog advertises support.

## Security and UX
- The server must enforce tenant boundaries and record-level authorization. Hiding UI is not permission enforcement.
- Mention visibility, notification read state and mention `seen` are separate concepts.
- Mark seen only after successful navigation and entity access, not when a notification is merely displayed.
- Never inject internal mention text into WhatsApp/Messenger/Gmail outgoing messages.
- Keep existing route casing, Query keys, i18n ar/en, theme tokens, RTL/LTR logical CSS, loading/empty/error UI.
- No additional WebSocket connection; validate existing `.notification.created` payload before integrating.

## Phases
1. **CURRENT:** API + React Query hooks + query keys + documentation.
2. **PLANNED:** verify live request/response shapes; normalized mention adapter; reusable dialog, recipient picker and inbox; ar/en translations.
3. **PLANNED:** integrate Lead Center and Deals using validated entity IDs.
4. **PLANNED:** integrate external conversations and internal chat; inline message @mentions only after backend contract exists.
5. **PLANNED:** notification routing, realtime invalidation, accessibility, permission and end-to-end testing.

## Validation
Required repository checks: `npm run lint`, `npm run check:i18n`, `npm run check:architecture`, `npm run check:service`, `npx vitest run`, `npm run build`. They must run before declaring implementation complete. Backend responses and visual behavior remain unverified until a test tenant is available.

## Phase 2 update — 2026-11-03 23:10 (Africa/Cairo)
Added a reusable read-only `EntityMentionsButton` and `extractMentions` adapter, first mounted in `DealWorkspaceHeader` with the actual deal ID. Uses existing `AppModal`, ar/en locale modules, semantic theme tokens, and query error/empty/loading states. Composer, inbox and other module mounts remain planned. Create payload has not been verified; no speculative request is sent.

## Implementation update — 2026-11-03 (Africa/Cairo)
- Added `MentionComposer` using existing user/team hooks, validated selection, and documented `entity_type`, `entity_id`, `user_ids`, `team_ids`, `type`, `message` request fields.
- Entity viewer now supports create and list tabs; available on Deal Workspace and Customer Details Drawer.
- Added read-only `MentionsInbox` component (received/sent). It is not yet mounted in the global header.
- Inline @mentions and external conversation surfaces remain pending; customer-facing composers were not modified.
- Verification pending: tenant API responses, authorization, build and repository checks.

## Conversation integration — 2026-11-03 (Africa/Cairo)
- Global header now displays a mentions inbox button and an unseen counter (60-second polling); inbox has received/sent tabs.
- WhatsApp, Messenger and Gmail workspace conversation headers now mount `EntityMentionsButton` with their selected conversation ID. This is a CRM-internal mention, never part of the outbound message composer.
- Internal chat conversation header mounts the same button with `chat` entity type and active chat ID. Inline @mention tokens tied to individual messages remain out of scope until chat-message backend contract is confirmed.
- Runtime verification is pending: exact backend conversation identifiers, tenant permissions, response shape, repository checks, realtime event contract and production build.

## Review fixes — 2026-11-03 (Africa/Cairo)
- Realtime: existing tenant `.notification.created` event now invalidates mentions queries, using the existing Echo channel. This is best-effort until a real mention notification payload is verified.
- Inbox: added mark-as-seen action for received mentions; routing to the correct entity remains pending verified backend identifiers and payload.
- Composer: imports users and teams via public feature boundaries; prevents submit while recipient queries load or fail.
- Customer details: does not substitute a lead ID for a customer ID; missing customer ID hides the entry point.
- Fixed escaped newline characters in `docs/README.md`.
- **Backend contract blocker:** `internalChatApi.sendMessage` only submits `body`, `reply_to_message_id`, and `attachments[]`. It has no documented `mentioned_user_ids`, message-to-mention linking, or atomic message/mention endpoint. Therefore inline @mention notifications are NOT implemented; adding plain @name text would be misleading and non-atomic. Backend must define structured user-ID tokens and message association first.
- **Conversation ID blocker:** frontend `selectedId` is the conversation workspace identifier, but backend mention entity IDs have not been validated against actual tenant records for WhatsApp, Messenger or Gmail. Do not claim verified end-to-end linking.
- **Checks:** no local dependency checkout or test tenant was available in this connector session; lint, i18n, architecture, service, vitest and build remain unexecuted. PR must stay draft until they pass.
