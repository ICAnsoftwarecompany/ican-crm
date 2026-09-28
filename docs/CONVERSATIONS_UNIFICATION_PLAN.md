# Conversations Unification Plan (Step 2)

Status: **APPROVED 2026-09-28** (D1–D4 as recommended). Phase 1 DONE (see §9); Phase 2 awaiting review.
Date: 2026-09-28. Policy: [ARCHITECTURE.md](ARCHITECTURE.md).

Goal: WhatsApp, Messenger and Gmail share one normalized data model and one set of UI
building blocks under `src/features/conversations`, as the foundation for the future
Customer Service "Service Inbox". Customer Service itself is **not** built here.

Hard constraints (apply to every phase): no change to API calls, payloads, endpoints, route
URLs or React Query keys; no visual/behavior change; i18n (ar+en) for any new string; CSS
variables for any new color; old exports stay as thin re-exports while they have consumers;
one commit per phase/sub-step; lint, i18n, architecture, vitest, build must pass after each phase.

---

## 1. Verified current state (and corrections to the brief)

The brief is accurate, with these additions found during the inventory:

| # | Finding | Impact on plan |
|---|---------|----------------|
| F1 | **Two WhatsApp API modules.** Live code (workspace hooks, floating chat, integrations) uses `features/integrations/whatsapp` → `whatsappIntegrationApi`. `features/conversations/api/whatsappApi.js` (tenant-in-path endpoints) is only used by `useConversations` / `useMessages` / `useConversationMutations` in `hooks/useConversations.js`, and **those three hooks have zero consumers**. | WhatsApp adapter `api` wraps `whatsappIntegrationApi`. The legacy module + 3 hooks are left untouched (listed as future dead-code removal). |
| F2 | **Floating chats and workspaces use separate cache namespaces.** Workspace: `['integrations','whatsapp',…]`, `['messenger','conversations'…]`, `['gmail',…]`. Floating: `['whatsapp-chat',…]`, `['messenger-chat',…]` (keys built inline in the hooks). | Adapters expose **both** sets verbatim (`queryKeys.workspace`, `queryKeys.floating`). Merging namespaces would change cache sharing/invalidation → "future". |
| F3 | **Realtime hooks do not write to caches.** `use{Whatsapp,Messenger,Gmail}Realtime` resolve payloads, play sounds/add notifications, then call consumer callbacks. The `setQueryData` calls live in consumers: `ConversationsPage`, `MessengerSidebarPanel`, `WhatsappConversationsWorkspace`, `GmailConversationsWorkspace`, `useGlobalMessengerNotifications`, both floating hooks. | "Keep query keys working" = keep those consumers' keys identical. Realtime hooks are not modified beyond (optionally) exporting pure resolvers — see D3. |
| F4 | **Floating "mail" and "sms" chats are local stubs**, not Gmail/SMS-backed: `useFloatingChatDraft` fakes a send with a 450ms timeout. The customer drawer never talks to Gmail. | Moved as-is in Phase 2. Wiring the drawer mail chat to the Gmail adapter is a behavior change → "future". |
| F5 | `floating-chats/messenger/messengerChatUtils.js` contains a **copy** of `normalizeMessengerMessage` and `sortMessagesAscending` (logic identical to `utils/messengerConversations.js`, private `normalizeMessageDirection` identical too). | Straight replacement by the Messenger adapter in Phase 2 (equivalence test first). |
| F6 | **All three workspaces already share the thread UI**: `WhatsappConversationsWorkspace` and `GmailConversationsWorkspace` import `MessengerChatThread`, `MessengerConversationFilters`, `MessengerLinkCustomerDialog`. `MessengerChatThread` renders `FloatingChatMessages` + `FloatingChatComposer` from `pages/…/floating-chats/shared`. | Phase 4 is mostly *relocating/renaming* already-generic components, not merging divergent ones. The link-customer dialog is already cross-channel (not Messenger-specific as the brief assumes). |
| F7 | **Second copy of the Messenger workspace realtime/cache logic** in `components/MessengerSidebarPanel.jsx` (706 lines): its own `upsertMessageIntoCachedResponse` / `mergeInfoIntoCachedResponse` and `setQueryData` handlers, same as `ConversationsPage.jsx`. | Phase 3 extracts these into one hook used by both (only if identical; verified by diff at that time). |
| F8 | Circular page↔feature chain: `floating-chats/shared/FloatingCustomerChat` (page) → `MessengerChatThread` (feature) → `floating-chats/shared/FloatingChat{Composer,Messages}` (page). | Disappears after Phase 2 (all inside the feature). |
| F9 | Notification sounds: the two modules differ only in path, volume (0.55 vs 0.6) and log prefix, but **each owns its own `Audio` instance and 1.2 s dedupe map**. | Merge as a per-channel **factory** so state stays per-channel (a WhatsApp ping must not suppress a Messenger ping). |
| F10 | Existing i18n/theme debt in code being moved: hardcoded Arabic in utils (`'صورة'`, `'رسالة ماسنجر من …'`), in `useFloatingChatDraft` and floating chat labels (`'ميل'`), and hardcoded hex colors (`#0A7CFF`, `#1D4ED8`, `#00A8B0`, …). | **Not fixed in this step** (would change output/visuals and is out of scope). Moved code keeps it; *no new* hardcoded strings/colors are added. Listed in §8. |
| F11 | No tests exist today for any conversations/realtime code. | Phase 1 adds the first ones; fixtures are derived from the normalize functions' field fallbacks. |

---

## 2. Inventory

### 2.1 `src/features/conversations` (current)

| Area | Files |
|------|-------|
| api | `gmailApi.js`, `messengerApi.js`, `whatsappApi.js` (legacy, F1) |
| utils | `whatsappConversations.js` (236), `messengerConversations.js` (664), `gmailConversations.js` (205), `messengerNotificationSound.js`, `whatsappNotificationSound.js` |
| hooks | `useConversations.js` (Messenger hooks + dead legacy hooks), `useWhatsappConversations.js`, `useGmailConversations.js`, `useGlobalMessengerNotifications.js`, `useRealtimeMessageHighlight.js` |
| store / constants | `store/messengerNotificationsStore.js`, `constants/{messenger,whatsapp}SidebarEvents.js` |
| components | `WhatsappConversationsWorkspace` (582), `GmailConversationsWorkspace` (499), `MessengerChatThread` (777), `MessengerConversationFilters` (189, also exports `filterMessengerConversations`), `MessengerConversationHoverPreview`, `MessengerLinkCustomerDialog` (773), `MessengerMediaGalleryDialog`, `MessengerMessageAttachments`, `{Messenger,Whatsapp,Gmail}NavbarButton`, `{Messenger,Whatsapp,Gmail}SidebarPanel`, `GmailBusinessEmailsPanel`, `WhatsappTemplatesDialog` |
| docs | `MESSENGER_CHAT_REFERENCE_AR.md` |

### 2.2 Outside the feature

| File | Uses |
|------|------|
| `pages/conversations/ConversationsPage.jsx` (728) | Inline Messenger workspace (`MessengerConversationsPage`, lines ~136–663) + tabs + Gmail/WhatsApp workspaces |
| `pages/customers/components/CustomerDetailsDrawer/floating-chats/**` (11 files) | `shared/` (FloatingCustomerChat, Header, Messages, Composer, ResizeHandles, useFloatingChatDraft, utils/floatingChatLayout), `whatsapp/`, `messenger/` (+ duplicate utils F5), `mail/`, `sms/` (stubs F4) |
| `pages/customers/components/CustomerDetailsDrawer/CustomerDetailsDrawer.jsx` | imports 4 floating chats |
| `pages/customers/components/CustomerDetailsDrawer/quick-actions/{Email,Messenger,Whatsapp}QuickAction.jsx` | logo icons, messenger notifications store |
| `pages/customers/CustomersPage.jsx` | `useMessengerConversations`, `useGmailConversations`, id getters, `requestOpenMessengerSidebar` |
| `pages/customers/components/CustomersTableColumns.jsx` | Gmail/Messenger logo icons |
| `pages/templates/TemplatesPage.jsx` | `WhatsappLogoIcon`, `WhatsappTemplatesDialog` |
| `pages/outreach-campaigns/components/wizard/{channels/GmailCampaignContent, steps/CampaignChannelStep, steps/CampaignReviewStep}.jsx` | `useGmailConversations` hooks (mailboxes) only |
| `shared/components/layout/Header.jsx`, `MainLayout.jsx`, `shared/components/data/PageToolbar.jsx` | navbar buttons, sidebar panels, sidebar events, `useGlobalMessengerNotifications` (existing app-shell exceptions) |
| `realtime/hooks/useWhatsappRealtime.js`, `useTenantNotificationsRealtime.js` | `playWhatsappNotificationSound` |
| `realtime/TenantNotificationsRealtime.jsx` | `messengerConversations` utils |
| `realtime/hooks/use{Whatsapp,Messenger,Gmail}Realtime.js` | channel subscription + payload resolution |
| `features/integrations/whatsapp` | `whatsappIntegrationApi`, `WHATSAPP_INTEGRATION_QUERY_KEYS` (same key prefix as workspace) |
| `features/notifications/utils/notificationPayloads.js` | `buildWhatsappMessageNotification`, `buildGmailMessageNotification` |

---

## 3. Proposed normalized model (Phase 1, `model/`)

JSDoc typedefs only (no runtime cost). Field names follow the brief.

```js
/** @typedef {'whatsapp'|'messenger'|'gmail'} ChannelId */

/** @typedef {Object} Contact
 *  @property {string} id          @property {string} name
 *  @property {string} phone       @property {string} email
 *  @property {string} avatarUrl   @property {Object} raw   // untouched source object */

/** @typedef {Object} Attachment
 *  @property {'image'|'video'|'audio'|'file'|string} type
 *  @property {string} url  @property {string} originalUrl  @property {string} mimeType
 *  @property {string} label @property {number} size
 *  // plus every original attachment field (existing normalizers spread the source) */

/** @typedef {Object} Message
 *  @property {ChannelId} channel      @property {string} id
 *  @property {string} conversationId  @property {'incoming'|'outgoing'|string} direction
 *  @property {string} status          @property {string} text
 *  @property {string} createdAt       @property {Attachment[]} attachments
 *  @property {Array} reactions        @property {string} replyToMessageId  @property {Object|null} replyTo
 *  @property {string} [subject]       // gmail
 *  @property {Object} raw             // SEE D1 */

/** @typedef {Object} Conversation
 *  @property {ChannelId} channel   @property {string} id
 *  @property {Contact} contact     @property {string} title   @property {string} subtitle
 *  @property {Message|null} lastMessage  @property {number} unreadCount
 *  @property {string} updatedAt    @property {'open'|'closed'|string} status
 *  @property {string} linkedCustomerId  @property {string} linkedLeadId
 *  @property {{id:string,name:string}|null} assignedUser
 *  @property {Object} raw          // untouched API object */
```

Derivations (all by delegation): `title`/`subtitle`/`id`/contact via the existing
`getXConversation*` getters; `unreadCount = Number(raw.unread_count || 0)`;
`updatedAt = last_message_at || updated_at || created_at` (same precedence Messenger's list sort
uses); `linkedCustomerId = customer?.id || customer_id || customerId` and
`linkedLeadId = lead?.id || lead_id` (same checks the existing `unlinkedOnly` filters use).

---

## 4. Adapter interface and function mapping (Phase 1, `channels/`)

```
channels/
  registry.js              getChannelAdapter(channel), CHANNELS
  whatsapp/adapter.js
  messenger/adapter.js
  gmail/adapter.js
utils/conversationHelpers.js  sortMessagesByTime, upsertMessageById, filterConversations
```

Each adapter: `{ channel, capabilities, queryKeys, api, getConversationId, getMessageId,
normalizeConversation, normalizeMessage, normalizeMessages, normalizeRealtimeEvent,
extractConversations, extractMessages, extractEntity, filterConversations }`.

| Adapter method | WhatsApp delegates to | Messenger delegates to | Gmail delegates to |
|---|---|---|---|
| `getConversationId` | `getWhatsappConversationId` | `getMessengerConversationId` | `getGmailConversationId` |
| `getMessageId` | `getWhatsappMessageId` | `getMessengerMessageId` | inline expr from `normalizeGmailMessage` (no getter exists; identical expression) |
| title / subtitle / contact | `getWhatsappConversationTitle/Subtitle/Contact`, `getWhatsappContactId` | `getMessengerConversationTitle/Subtitle`, `getMessengerContactId`, `getMessengerProfilePicture` | `getGmailConversationTitle/Subtitle/Contact`, `getGmailParticipantEmail` |
| `normalizeMessage(msg, info)` | `normalizeWhatsappMessage` + `channel`, `conversationId` | `normalizeMessengerMessage` + … | `normalizeGmailMessage` + `subject` |
| `normalizeMessages(list, info)` | map + `sortWhatsappMessagesAscending` | map + `sortMessagesAscending` | map + `sortGmailMessagesAscending` |
| `extractConversations / Messages / Entity` | `extractWhatsappList`, `extractWhatsappEntity` | `extractMessengerConversations`, `extractMessengerMessages` | `extractGmailConversations/Messages`, `extractGmailEntity` |
| `filterConversations(list, q, filters)` | `filterWhatsappConversations` | `filterMessengerConversations` (from `MessengerConversationFilters.jsx`) | `filterGmailConversations` |
| `normalizeRealtimeEvent(payload, eventName)` | `resolveWhatsappMessage/Conversation/ConversationId` (see D3) | `getMessengerRealtimeMessage/Conversation/ConversationId/Reaction/ReactionMessageId/MessagePatch`, `isMessengerReactionRemovalEvent` | `resolveGmailMessage` (see D3) |
| `queryKeys.workspace` | `WHATSAPP_CONVERSATIONS_QUERY_KEY`, `…_INFO_…`, `…_MESSAGES_…` | `MESSENGER_CONVERSATIONS_QUERY_KEY` (a constant array, not a function — kept as is), `…_INFO_…`, `…_MESSAGES_…` | `GMAIL_*_QUERY_KEY` (7 keys incl. mailboxes, business emails, customer/lead) |
| `queryKeys.floating` | `['whatsapp-chat', mode, id, 'conversation']`, `['whatsapp-chat','conversation-info',id]`, `['whatsapp-chat','conversation-messages',id]` | `['messenger-chat','lead-conversation',leadId]`, `…'conversation-info'…`, `…'conversation-messages'…` | — (no floating Gmail chat, F4) |
| `api` | `whatsappIntegrationApi` (F1) — same object reference, no wrapping of requests | `messengerApi` | `gmailApi` |

`normalizeRealtimeEvent` returns `{ channel, conversationId, message /* raw */, conversation /* raw */, reaction, isReactionRemoval, messagePatch, eventName }` — raw payload pieces, because every current consumer normalizes after merging into cache.

Capabilities (descriptive flags; nothing reads them until Phase 4, each verified against current UI in Phase 1):

| | whatsapp | messenger | gmail |
|---|---|---|---|
| attachments | ✓ | ✓ | ✓ |
| reactions | ✓ | ✓ (+ remove) | ✗ |
| replies | ✓ | ✓ | ✗ |
| templates | ✓ | ✗ | ✗ |
| emailSubject / mailboxes | ✗ | ✗ | ✓ |
| messagingWindowHours | 24 | 24 | null |
| linkCustomer / close / reopen | ✓ | ✓ | ✓ |
| assign | per current UI | ✓ | per current UI |

`messagingWindowHours` documents Meta policy only; **no code enforces it today** and Phase 4 will not start enforcing it.

Shared helpers (`utils/conversationHelpers.js`) are written to be **byte-for-byte equivalent** to the per-channel versions, with the differences parameterized:
- `sortMessagesByTime(messages, rawTimeFields)` — WhatsApp/Messenger fall back to `raw.sent_at, raw.created_at`; Gmail to `raw.received_at, raw.created_at`.
- `upsertMessageById(messages, message, getId)` — WhatsApp/Messenger versions differ only in the id getter.
- `filterConversations(list, query, filters, getSearchText, isClosed?, isLinked?)` — the unread/unlinked/closed/assigned flags are shared; the search haystack differs per channel (Messenger even differs in which fields it searches), so each adapter passes its own `getSearchText`.

In Phase 1 the existing per-channel utils are **not** rewired to these helpers (additive only); equivalence tests prove sameness. Rewiring the old functions to one-line delegations is done in Phase 4.

---

## 5. Decisions needing your approval

- **D1 — meaning of `Message.raw`.** Existing normalizers put an *enriched* object in `raw` (WhatsApp swaps `raw.id` to the Meta message id and adds `database_id`, `contact_name`, `contact_phone`; Gmail adds `contact_name`, `body`, `sent_at`), and UI (`FloatingChatMessages`, reply/reaction code) reads those fields. Changing `raw` to the untouched payload would break behavior. **Proposal:** `Message.raw` keeps the current semantics; add `Message.source` = untouched API object. `Conversation.raw` is untouched (no legacy shape exists).
- **D2 — `direction` values.** Messenger's normalizer passes unknown directions through (e.g. `'sent'`), others map to `incoming/outgoing`. **Proposal:** keep each channel's current output (typedef documents `'incoming'|'outgoing'|string`); do not coerce.
- **D3 — WhatsApp/Gmail realtime resolvers are private** (`resolveWhatsappMessage`, etc. inside `realtime/hooks/*.js`). **Proposal:** in Phase 1, move those pure functions into `channels/{whatsapp,gmail}/realtimeEvents.js` and make the realtime hooks import them (logic moved verbatim; the hooks' behavior and exports unchanged). Alternative: only add `export` in the realtime files and import from there (pulls hook + notifications store into adapter imports). I recommend the move.
- **D4 — dead legacy code (F1).** Leave `api/whatsappApi.js` and `useConversations/useMessages/useConversationMutations` untouched in this step; propose deletion as a separate cleanup.

---

## 6. Consumer migration by phase

| Phase | Created | Moved | Consumers changed | Shims |
|---|---|---|---|---|
| **1** Model + adapters (additive) | `model/conversationModel.js`, `channels/{registry,whatsapp/adapter,messenger/adapter,gmail/adapter}.js`, `channels/{whatsapp,gmail}/realtimeEvents.js` (D3), `utils/conversationHelpers.js`, tests | — | only `realtime/hooks/use{Whatsapp,Gmail}Realtime.js` import the moved resolvers (D3) | — |
| **2** Floating chats → feature | — | `pages/…/floating-chats/**` → `features/conversations/components/floating-chat/**` (same internal structure) | `CustomerDetailsDrawer.jsx` (4 imports), `MessengerChatThread.jsx` (2 imports → removes feature→page dep); `useWhatsappFloatingChat` / `useMessengerFloatingChat` use adapter `queryKeys.floating`, `extract*`, `normalizeMessages`, `getConversationId`; `messengerChatUtils.js` duplicate normalize/sort replaced by adapter (F5) | None: nothing outside `src` imports the old paths. Old folder deleted. Two docs (`CUSTOMER_DETAILS_DRAWER_ARCHITECTURE_AR.md`, `MESSENGER_CHAT_REFERENCE_AR.md`) get path updates. |
| **3** Messenger workspace out of the page | `components/MessengerConversationsWorkspace.jsx`; if F7 duplicates are identical, `hooks/useMessengerConversationCache.js` (upsert/merge cache helpers) | `MessengerConversationsPage` + its local helpers from `ConversationsPage.jsx` | `ConversationsPage.jsx` → header, tabs, unread badges, selected workspace (~130 lines); `MessengerSidebarPanel.jsx` uses the shared cache helpers if identical | — |
| **4** Shared UI building blocks | `components/shared/` + `utils/notificationSound.js` (factory, F9) | Generic components currently named Messenger* (F6) where they are already channel-agnostic | Workspaces, floating chat, `realtime/hooks/useWhatsappRealtime.js`, `useTenantNotificationsRealtime.js` | `messengerNotificationSound.js`, `whatsappNotificationSound.js` and any renamed `Messenger*` component keep their old export names as one-line re-exports until all consumers are migrated. |

Phase 4 candidates, merged **only** if the markup/logic diff is empty or purely parametric:
- Notification sound → `createNotificationSound({ path, volume, logLabel })`; both old modules become re-exports (per-channel state preserved).
- `upsertMessageIntoCachedResponse` / `mergeInfoIntoCachedResponse` (3 copies: page/Messenger workspace, `MessengerSidebarPanel`, `useWhatsappFloatingChat`) → one helper if the response-shape branches match.
- Message bubble + composer: `FloatingChatMessages` / `FloatingChatComposer` are already the single implementation (F6); move under `components/shared/` with capability-driven props where the current props already equal a capability (e.g. reactions on/off).
- Conversation list item: merge **only** if the three list rows are markup-identical; otherwise → future.
- Channel-specific stays channel-specific: `WhatsappTemplatesDialog`, `GmailBusinessEmailsPanel` / mailboxes, Messenger reaction-removal and message-patch handling.

---

## 7. Risks and test plan

| Risk | Mitigation / test |
|---|---|
| Adapter output drifts from legacy normalizers | Equivalence tests: `adapter.normalizeMessage(fixture)` deep-equals `normalizeXMessage(fixture)` (plus added fields only); same for title/subtitle/id/filter/sort/upsert over fixture sets covering every fallback branch (contact name vs first/last name vs phone; `direction` from field vs `from_id`; media URL absolute vs relative; missing ids). |
| Query keys change silently | Tests assert `adapter.queryKeys.*(args)` deep-equal the legacy constants and the literal floating keys. |
| Tests break without `.env` (Step 1 issue) | Adapter tests `vi.mock` `services/httpClient`; media-URL tests stub hostname/env explicitly. Run vitest with and without `.env` (`VITE_API_USE_DEV_PROXY=false VITE_API_PASSWORD=`). |
| Moving floating chats breaks relative imports | Mechanical path rewrite + `npm run build` + grep for `floating-chats` = 0 hits. |
| Phase 3 extraction changes behavior (URL params, realtime subscriptions, selection) | Pure cut/paste of `MessengerConversationsPage` and helpers; diff review that the moved block is byte-identical apart from imports; smoke test. |
| Sound merge makes channels suppress each other | Factory keeps one `Audio` + dedupe map per channel; unit test that two channels with the same key both play. |
| Architecture check regressions | `npm run check:architecture` after every phase; new code under `features/`, nothing new in `shared/` importing features. |
| RTL/LTR, light/dark | No markup/styling changes in Phases 1–3. Phase 4 moves components without touching class names. Manual check in both directions and themes where login is possible. |

Verification per phase: `npm run lint`, `npm run check:i18n`, `npm run check:architecture`, `npx vitest run` (with and without `.env`), `npm run build`; then the dev-server smoke test: `/conversations` switching WhatsApp / Messenger / Gmail, open a conversation, open a customer drawer floating chat. If login against a tenant is not possible locally, the report states exactly what was not verified.

---

## 8. Future (explicitly out of scope for Step 2)

- Unify floating-chat and workspace cache namespaces (F2) so a message sent from the drawer updates the inbox cache.
- Wire the drawer "mail" chat to the Gmail adapter; decide what "sms" is (F4).
- Delete dead `api/whatsappApi.js` + legacy `useConversations/useMessages/useConversationMutations` (F1/D4).
- Move hardcoded Arabic strings in utils/floating chats to i18n, and hardcoded hex colors to CSS variables (F10).
- `normalizeRealtimeEvent` → cache update reducer shared by all consumers (today each consumer owns its `setQueryData` logic).
- Enforce the 24h messaging window in the composer using `capabilities.messagingWindowHours`.
- Move the Messenger/WhatsApp/Gmail navbar buttons and sidebar panels used by `shared/components/layout` into `src/app` (existing app-shell exception).

---

## 9. Progress log

### Phase 1 — done (2026-09-28)

Created (all under `src/features/conversations`):
- `model/conversationModel.js` — JSDoc typedefs: Conversation, Message, Attachment, Contact, RealtimeEvent, ChannelCapabilities.
- `channels/{whatsapp,messenger,gmail}/adapter.js`, `channels/registry.js` (`getChannelAdapter`, `hasChannelAdapter`, `CONVERSATION_CHANNELS`).
- `channels/conversationFields.js` — shared pickers for unreadCount / updatedAt / status / linked ids / assignedUser.
- `channels/{whatsapp,gmail}/realtimeEvents.js` — D3: resolvers moved verbatim from the realtime hooks.
- `utils/conversationHelpers.js` — `sortMessagesByTime`, `upsertMessageById`, `filterConversations`.
- Tests: 3 adapter suites, registry, helper equivalence (`channels/__fixtures__/conversationFixtures.js`).

Changed: `realtime/hooks/useWhatsappRealtime.js` and `useGmailRealtime.js` now import the moved resolvers (no logic change). No other consumer changed; adapters are not yet used by the app.

Deviations from §4, decided while implementing:
- WhatsApp: `isNewIncomingWhatsappMessage` was moved with the resolvers too (pure, needed for `normalizeRealtimeEvent.isNewIncomingMessage`).
- Gmail: the conversation-id expression inside `useGmailRealtime` became `resolveGmailConversationId(payload, fallback)` (same expression). `getMessageId` returns `normalizeGmailMessage(message).id` instead of copying the expression.
- Messenger: no `extractMessengerEntity` exists in the feature; `extractEntity` uses the same expression as `messengerChatUtils.getConversationInfoFromResponse` (which moves in Phase 2). `queryKeys.workspace.conversations` is a function returning the legacy constant array for a uniform interface.
- `Contact.name` = the channel title for WhatsApp/Messenger (contact-first fallbacks); for Gmail it is `participant_name || customer.name || lead.name`. `Conversation.status` defaults to `'open'` when the API sends none (the UI already treats anything but `closed` as open).
- Capabilities verified against the current UI: only Messenger removes reactions; no channel assigns users in the UI (`messengerApi.assignUser` has no caller), so `assign: false` everywhere; Gmail supports attachments, not replies/reactions.
- Found while testing helpers: WhatsApp trims `status` before comparing to `closed`, Gmail/Messenger do not. `filterConversations` takes `isClosed` so each channel keeps its behavior when rewired in Phase 4.
- The adapter filter for Messenger comes from `components/MessengerConversationFilters.jsx`; moving that pure function to `utils/` is a Phase 4 candidate.
