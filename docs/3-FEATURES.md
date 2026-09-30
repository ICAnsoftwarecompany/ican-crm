# ICAN CRM — Features

All modules outside the sales domain: communication, growth, work management, automation, platform and settings.
Rules and shared engines: [1-ARCHITECTURE.md](1-ARCHITECTURE.md). Sales domain: [2-SALES.md](2-SALES.md).
Describes the **current code**; if code and this file disagree, the code wins — update this file in the same change.

Every module section uses: **Status · What it does · Key files · API · Used by · Known issues**. All endpoints go through `services/httpClient` (bearer token + `api_password` added automatically) unless noted.

## Contents

- [My Work](#my-work) (`/my-work`, شغلي)
- [Communication hub](#communication-hub) (Conversations, Calls, Meetings, Team chat)
- [Conversations](#conversations)
- [Internal chat](#internal-chat)
- [Ad campaigns and Meta integrations](#ad-campaigns-and-meta-integrations)
- [Outreach campaigns](#outreach-campaigns)
- [Social media](#social-media)
- [Tasks](#tasks)
- [Workflow engine and automation](#workflow-engine-and-automation)
- [Integrations](#integrations)
- [Notifications](#notifications)
- [Operational alerts](#operational-alerts)
- [AI agent](#ai-agent)
- [Products and services](#products-and-services)
- [Settings and appearance](#settings-and-appearance)
- [Customer Hub (Customer Service)](#customer-hub-customer-service)

---

## My Work

> **Documentation update:** 2026-10-01 00:55 (Africa/Cairo) — section added.

**Status:** PARTIAL (live on real APIs; "mine" filtering client-side; focus chosen by the viewer until the backend sends roles)

- **What it does:** `/my-work` (Overview → **شغلي / My work**) — one page per user with everything waiting now, across Sales, Customer Hub and Communication: summary tiles (overdue, today's calls & meetings, tasks due, unread) and registered sections: Overdue, Today's calls & meetings, My tasks due, Newest leads assigned to me (Sales), Customer service work (Customer Hub preview of `/service/my-work`), Messages (WhatsApp, Messenger, Gmail, team chat). A focus switch (All / Sales / Customer service) filters sections; `module` gating is inert until the backend sends `user.modules`.
- **Key files:** `features/my-work/` — registry (`registerMyWorkSection`), rules (`utils/myWorkItems.js`, tested), hooks (`useMyActivities`, `useMyTasks`, `useMyWorkFocus`, `useMyWorkPreview`), sections, `MyWorkBoard`/`MyWorkSummary`; page `pages/my-work/MyWorkPage.jsx`; locale `myWork.js`. Full reference: [features/my-work/README.md](../src/features/my-work/README.md).
- **API:** none of its own — activities (`/api/tenant/meetings`), tasks, `sales/dashboard/my-leads`, `/api/tenant/my-work` (Customer Hub), conversation lists, internal chat conversations. Same list params as the calendar/inbox, so caches are shared.
- **Added public exports:** `features/tasks/index.js`, `features/calendar/index.js`, `features/analytics/index.js`, `useConversationUnreadSummary` in `features/conversations`.
- **Known issues:** "mine" is computed from the latest 200 activities/tasks; undated tasks are not shown; leads link to the Leads Center when the response lacks a customer id; not visually verified with real data.

## Communication hub

> **Documentation update:** 2026-10-01 00:25 (Africa/Cairo) — section added.

**Status:** PARTIAL (navigation, layouts, view/create/reports/calendar/automation/AI pages live; customization and module settings are planned content)

- **What it does:** main-sidebar section **Communication** (`nav.sections.communication`) with four modules used by **both** Sales and Customer Hub: Conversations (`/conversations`), Calls (`/calls`), Meetings — customer and internal — (`/meetings`), Team chat (`/team-chat`). Each module has the same shared sub-sidebar: **Work** (View, Create) · **Insights** (Reports, Calendar) · **Setup** (Automation, Customization, AI setup) · footer **Settings**.
- **Key files:** `features/communication/` (registry `constants/communicationModules.js`, `navigation/communicationNavigation.js`, `CommunicationModuleLayout`, `CommunicationCalendar`, `CommunicationAutomation`, `ActivityReports` + `utils/activityReport.js`) — [README](../src/features/communication/README.md); route pages `pages/communication/` ([README](../src/pages/communication/README.md)); settings sections `pages/settings/registry/settingsSections.jsx` + `pages/settings/pages/communication/`; shared shells `shared/components/{sub-sidebar,module-pages,ai-setup}`; locale `communication.js`.
- **Reuses:** `ActivitiesPage` (`lockedType`), `ScheduleActivityDialog` (`presentation="inline"`), `ConversationsPage`, `InternalChatPage`, the Calendar engine + `features/calendar` sources, the Workflow Engine builder (`context: { module: 'calls' | 'meetings' | 'conversations' | 'team-chat' }`), `AiSetupPage`, `ModuleSettingsPage`.
- **Settings:** a module's `/…/settings` page shows the sections listed in its `settingsSectionIds` (e.g. calls → `communication.calls` + `users`); the same sections appear in `/settings/communication/:moduleId`.
- **API:** none of its own. Calls/meetings use `/api/tenant/meetings`; conversations and team chat use their features' APIs.
- **Known issues:** customization and module settings have no backend API (planned lists shown); calls/meetings reports aggregate the latest 200 records client-side; conversations/team chat have no calendar source and no create contract yet; no workflow definitions registered for the four modules; AI setup is a per-browser draft until `features/ai` exists; `/activities` is still reachable (no nav item).

## Conversations

**Status:** CURRENT

**What it does:** omnichannel inbox for WhatsApp, Messenger and Gmail at `/conversations` (`?channel=whatsapp|gmail`, Messenger default; since 2026-10-01 00:25 (Africa/Cairo) it is the "View" page of the [Communication hub](#communication-hub) Conversations module, with sub-pages under `/conversations/*`), quick sidebar panels and navbar buttons in the app shell, and floating chat windows inside the customer drawer. One normalized data model and one set of chat UI building blocks serve all three channels.

**Structure (`src/features/conversations`)**
- `model/conversationModel.js` — JSDoc typedefs: `Conversation` (`channel, id, contact, title, subtitle, lastMessage, unreadCount, updatedAt, status, linkedCustomerId, linkedLeadId, assignedUser, raw`), `Message` (`channel, id, conversationId, direction, status, text, createdAt, attachments, reactions, replyToMessageId, replyTo, subject?, raw, source`), `Attachment`, `Contact`, `RealtimeEvent`, `ChannelCapabilities`. `Message.raw` keeps the legacy enriched shape the UI reads (WhatsApp swaps `raw.id` to the Meta message id); `Message.source` and `Conversation.raw` hold the untouched API payload.
- `channels/registry.js` → `getChannelAdapter(channel)`, `hasChannelAdapter`, `CONVERSATION_CHANNELS`. Adapters `channels/{whatsapp,messenger,gmail}/adapter.js` share one interface: `normalizeConversation`, `normalizeMessage(s)`, `normalizeRealtimeEvent`, `getConversationId`, `getMessageId`, `extractConversations|Messages|Entity`, `filterConversations`, `queryKeys.workspace` + `queryKeys.floating`, `api`, `capabilities`. They delegate to `utils/{whatsapp,messenger,gmail}Conversations.js`, which own the request/response contracts and query keys. `channels/{whatsapp,gmail}/realtimeEvents.js` hold the pure realtime payload resolvers.
- Shared helpers: `utils/conversationHelpers.js` (`sortMessagesByTime`, `upsertMessageById`, `filterConversations`), `utils/notificationSound.js` (`createNotificationSound`, one Audio + 1.2 s dedupe per channel), `utils/messengerCachedResponses.js`, `utils/formatConversationTime.js`.
- UI: workspaces `components/{Whatsapp,Messenger,Gmail}ConversationsWorkspace.jsx` (Messenger list split into `MessengerConversationListPanel`/`ListItem`), composed by `pages/conversations/ConversationsPage.jsx` (header, channel tabs, unread badges). Channel-neutral chat UI in `components/shared/`: `ConversationThread`, `ConversationMessages`, `ConversationComposer`, `MessageAttachments`, `MediaGalleryDialog`, `InitialsAvatar`, `LastMessageStatus`, `threadCapabilities.js`. Drawer floating chats in `components/floating-chat/{shared,whatsapp,messenger,mail,sms}`. Channel-specific UI stays separate: `WhatsappTemplatesDialog`, `GmailBusinessEmailsPanel`, sidebar panels, navbar buttons.
- Public surface for other features: `features/conversations/index.js` (exports `ConversationThread`).
- Extension slot: the three workspaces accept `threadHeaderActions`; `ConversationThread.headerActions` may be a function of the thread `contactDetails`. Used by `pages/conversations` to add Customer Service's **Create case** without conversations importing Service.

**Capabilities** (drive `supportsAttachments/Reply/Reactions` via `getThreadCapabilityProps`)

| | WhatsApp | Messenger | Gmail |
|---|---|---|---|
| attachments | yes | yes | yes |
| reactions / remove reaction | yes / no | yes / yes | no |
| replies | yes | yes | no |
| templates | yes | no | no |
| email subject, mailboxes | no | no | yes |
| link customer, close/reopen | yes | yes | yes |
| assign (UI) | no | no (API exists) | no |
| messaging window (policy note, not enforced) | 24 h | 24 h | — |

**Realtime:** `realtime/hooks/useWhatsappRealtime` (`whatsapp.conversation.{id}`, many `.whatsapp.message.*` events), `useMessengerRealtime` (`messenger.conversation.{id}` + tenant notifications channel as fallback), `useGmailRealtime` (`gmail.conversation.{id}`, `.gmail.message.received`). The hooks play sounds / add notifications and call consumer callbacks; the workspaces, `MessengerSidebarPanel`, `useGlobalMessengerNotifications` and the floating-chat hooks update caches (Messenger workspace + sidebar share `hooks/useMessengerRealtimeMessageHandler.js`).

**Query keys:** workspace — `['integrations','whatsapp','conversations',…]`, `['messenger','conversations'|'conversation-info'|'conversation-messages',…]`, `['gmail',…]`; drawer floating chats — `['whatsapp-chat',…]`, `['messenger-chat',…]`. Keep them stable.

**API**
- WhatsApp (`features/integrations/whatsapp/api/whatsappIntegrationApi.js`, base `/api/tenant/whatsapp`): `POST send`, conversations list/info/messages, `POST conversations/{id}/close|reopen|link`, `GET customers/{id}/conversation`, `GET leads/{id}/conversation`, `POST reaction`, templates (`GET templats`, `POST|PUT create/templat/{integrationId}`, `POST templat/{id}/sync-status`, `PATCH templat/{id}/toggle-active`, `DELETE templat/{id}`, spelling as in backend).
- Messenger (`api/messengerApi.js`): conversations list/info/messages, `POST .../{id}/messages` (FormData), reactions add/remove, `POST .../{id}/assign|close|reopen`, lead/customer conversation lookup, contact link, `POST /api/messenger/test-send`.
- Gmail (`api/gmailApi.js`): Google OAuth redirect and token refresh, `POST .../send/messages` (FormData with attachments), conversations list/info/messages, link/close/reopen, customer/lead conversation, `GET my-mailboxes`, business emails list/save.

**Used by:** `/conversations`, app shell (`Header`, `MainLayout` sidebar panels), customer drawer, Leads Center columns, `/templates` (WhatsApp templates), outreach wizard (Gmail mailboxes), `internal-chat` (thread UI).

**Known issues**
- Drawer floating chats and workspaces use separate cache namespaces, so a message sent from the drawer does not update the inbox (and vice versa).
- Four per-channel cache updaters remain (`upsertWhatsappMessageIntoCache`, `upsertGmailMessageIntoCache`, WhatsApp floating `upsertMessageIntoCachedResponse`, Messenger floating infinite-query updaters); a shared, tested reducer driven by `normalizeRealtimeEvent` is the next step.
- Workspaces still render raw API fields; `normalizeConversation` is not yet used for rendering (the future Service Inbox should be the first consumer).
- Differing local variants kept on purpose: WhatsApp `LastMessageStatus` (treats `sent` as outgoing), Messenger sidebar time format/avatar; three different list-row layouts need a design decision before merging.
- `MessengerConversationFilters` and `MessengerLinkCustomerDialog` are cross-channel but Messenger-named; `filterMessengerConversations` lives in a component file.
- Oversized: `ConversationThread` (≈780 lines), `MessengerLinkCustomerDialog` (≈770), `ConversationMessages` (≈600), `MessengerSidebarPanel`, WhatsApp/Gmail workspaces.
- Dead code: `api/whatsappApi.js` and `useConversations`/`useMessages`/`useConversationMutations` in `hooks/useConversations.js` have no consumers.
- Drawer Mail/SMS chats are local stubs (`useFloatingChatDraft`), not Gmail/SMS-backed.
- Hardcoded Arabic strings and hex colors in moved code; `formatConversationTime` uses a fixed `ar-EG` locale; messaging-window policy not enforced in the composer.

## Internal chat

**Status:** CURRENT

- **What it does:** team chat inside the tenant (direct and group conversations), isolated from external channels. Full workspace at `/team-chat` (`pages/chat/InternalChatPage.jsx`, the "View" page of the [Communication hub](#communication-hub) Team chat module since 2026-10-01 00:25 (Africa/Cairo); sub-pages under `/team-chat/*`) and a header quick panel.
- **Key files:** `features/internal-chat/api/internalChatApi.js`; hooks `useChatConversations`, `useChatMessages`, `useChatMembers`, `useChatRealtime`, `useChatUnreadCount`, `useChatSearch`, `useTypingIndicator`, `useChatPermissions`; `store/internalChatUiStore.js`; `constants/chatConstants.js` (`chatKeys`); `utils/` (`conversationHelpers`, `messageCacheHelpers`, `messageGrouping`); components `InternalChatWorkspace`, `InternalChatSidebarPanel`, `InternalChatNavbarButton`. Renders messages with `ConversationThread` from `features/conversations`.
- **Message lifecycle:** paginated load → normalize and sort oldest-first → send multipart → optimistic pending message → reconcile with the server message. Opening a conversation marks it read.
- **API (`/api/tenant/chat`):** `GET` / `POST` conversations, `GET {id}/messages`, `POST send/messages/{id}`, `POST {id}/read`, `POST {id}/members`, `DELETE {id}/members/{user}`, `PATCH {id}/members/{user}/role`, `POST {id}/mute|unmute`, `PATCH messages/{messageId}`, `DELETE messages/{messageId}`, `POST messages/{messageId}/reactions`, `DELETE messages/{messageId}/reactions/{emoji}`.
- **Realtime:** reuses the tenant notifications channel via `useRealtimeChannel` and filters internal-chat events; updates caches and unread counts. No second connection.
- **Used by:** `/team-chat`, header.
- **Known issues:** backend gaps — reliable `unread_count`/`last_read_message_id`, consistent edit/delete, server-side search, pin/saved/threads, mention ids, archive/leave, direct-chat de-duplication. UI translation not audited.

## Ad campaigns and Meta integrations

**Status:** PARTIAL (Meta only; other platforms registered but not configured)

- **What it does:** Campaign Center at `/campaigns` for **paid** advertising (campaigns, ad sets, ads, lead forms, insights). Not the same as [Outreach campaigns](#outreach-campaigns). Routes: `/campaigns` (redirects to the last platform, stored as `ican-campaign-center-platform`), `/campaigns/:platform`, `/create`, `/list`, `/analytics`, `/billing`, `/:campaignId`. Unavailable or unconfigured platforms show "feature not included" / "not configured" states.
- **Layers:** `pages/campaigns` (route composition, sub-sidebar, header, list table, details) → `features/campaigns` (`config/platformRegistry.js` + `campaignCapabilities.js`, `context/CampaignCenterContext.jsx`, `hooks/useCampaigns.js`) → `providers/` (`campaignProvider.js` default adapter; `meta/metaCampaignProvider.js` wires the real functions) → `facebook-campaign/` (API contracts, hooks, cache keys) → `services/httpClient`.
- **Platform registry:** each platform has `id`, `labelKey`, `icon`, `moduleKeys`, `capabilities`, `provider` (Meta, Google, TikTok, Snapchat registered; only Meta configured). Sub-sidebar = capability ∩ permission. Visibility order: module/package → platform capability → user permission → page. No `if (platform === 'meta')` in pages. Tested in `platformRegistry.test.js`.
- **Create wizard** (`pages/campaigns/pages/CampaignCreatePage/`): steps Objective (ODAX) → Campaign Setup → Ad Sets (conditional fields: `pixel_id`/`custom_event_type` for website, `whatsapp_phone_number` for WhatsApp; ad-set budget only when budget level is ad set) → Ads (`NotConfiguredStep`, no create-ad contract) → Review. State via `state/` reducer + local draft autosave. Publish is sequential: create campaign → take `campaign_id` → create each ad set.
- **Details page:** campaign data, ad sets, ads and insights (actions, cost, video).
- **Cache keys:** `campaign-center / tenant / meta / account / resource / filters`; mutations invalidate only the tenant+Meta prefix.
- **API** — `facebook-campaign/api/facebookCampaignApi.js` (`/api/tenant/facebook`): `GET campaigns/get`, `GET campaigns/sync`, `POST campaigns/create`, `GET /api/tenant/campaigns/{campaign}/adsets`, `POST adset/create`, `GET adset/get`, `GET adset/sync`, `GET campaigns/adsets/{adSetId}/ads`, `GET campaigns/ads/{adId}/insights`, `GET campaigns/pages/{pageId}/posts`, `GET campaigns/posts/{postId}/engagement|comments`; sub-login invites: `POST login/invite`, `GET login/invite/my`, and on `VITE_MAIN_SERVER_URL`: `POST /api/tenant/facebook/login/invite/create`, `GET .../invite/revoke/{id}`, `GET /api/facebook/sub-login/{tenant}/{token}`. Older CRUD modules: `api/campaignsApi.js`, `campaignAdsApi.js`, `adsFormsApi.js` (`/api/tenant/{campaigns|ads|ads-forms}/save|edite|active|inactive|details`), `api/facebookApi.js` (`/api/facebook/campaign|adset|ad/create`, `lead-form/create/{tenant}`, connect/pages/refresh-token/assets).
- **Meta integrations (`features/meta-integrations`):** `facebookMetaApi.js` (`GET /api/tenant/channel/facebook/connect-link`, `GET /api/tenant/facebook/pages/{tenant}`, `GET /api/tenant/facebook/get/intgrations`, refresh token, assets), `hooks/useFacebookIntegrations.js` (connection state, ad accounts, pages — the hook everyone uses), `utils/metaConnectUrl.js`.
- **Used by:** `/campaigns`, social media, outreach wizard, workflow data sources, `/settings/integrations` (Meta tab), `/integrations/facebook/callback`.
- **Known issues:** the Ads step is not connected; last commit notes an open error in ad-set creation (Unverified: exact failure); Meta analytics/billing/pause/edit/duplicate endpoints missing; Google/TikTok/Snapchat providers not built; creatives, CRM-attributed leads/conversions and sync log missing on details. `messengerMetaApi.js` is fully commented out, so importing `metaIntegrationsApi`/the `meta-integrations` barrel would break the build (only `useFacebookIntegrations` is safe to import). `facebookApi.js` and `meta-integrations/facebookAdsApi.js` duplicate the same create endpoints; `whatsappMetaApi.js` duplicates legacy tenant-in-path WhatsApp endpoints. Ownership overlap with `features/integrations` unresolved.

## Outreach campaigns

**Status:** CURRENT (backend features limited)

- **What it does:** bulk **messages** to existing CRM contacts over WhatsApp, Gmail and Messenger (`Audience → Campaign → Channel → Message → Schedule → Send`). Channels are adapters in one channel registry used by one wizard. Routes under `/outreach-campaigns` (own layout + sidebar): overview (index), `live`, `all`, `create`, `channels/messenger|whatsapp|gmail`, `calendar`, `workflow`, `:campaignId`.
- **Key files:** `features/outreach-campaigns/` — `api/messegeCampaignApi.js`, `whatsappTemplateImagesApi.js`, `hooks/useMessegeCampaign.js`, `useOutreachCampaigns.js`, `config/campaignChannels.js` (channel registry), `constants/campaignStatus.js`, `campaignObjectives.js`, `utils/normalizeCampaign.js` (backend → domain), `buildCampaignPayload.js` (form → backend), `campaignAudience.js` (per-channel eligibility), `campaignCalendar.js`, `schemas/` (Zod per channel), `workflow/outreachWorkflowDefinition.js`, components (`OutreachSidebar`, `CampaignStageNavigation`, overview/list/create/calendar/workflow content); wizard UI in `pages/outreach-campaigns/components/wizard/`. `features/MessegeCampaign/index.js` is an unused re-export kept for compatibility.
- **API (`/api/tenant/campaigns`):** `POST create`, `POST {id}/edite`, `GET show/{id}`, `GET {id}/destroy`, `GET {id}/cancel`, `GET scheduled`, `GET my`, `GET my/scheduled`, `POST {id}/add|remove/images`, `POST {id}/add|remove/customers`, `POST {id}/add|remove/users`. WhatsApp template images (`/api/tenant/whatsapp`): `POST create/template/images`, `GET template/images`, `GET template/{id}/images`, `POST change/template/{id}/image/status`. Channel data reuses WhatsApp templates, Gmail sending/mailboxes and `useFacebookIntegrations`.
- **Used by:** sidebar Growth → Outreach Campaigns; workflow engine (embedded builder in campaign details).
- **Known issues:** no documented list/detail response shape; Bearer requirement unconfirmed on `edite` and add/remove customers/users; meaning of `external_id` for Messenger unconfirmed. Not built (backend): campaign members, segments/saved audiences, sequences, delivery/read/reply/click tracking, stop conditions, suppression/consent/unsubscribe, rate limiting, analytics endpoint, opportunity signals, "campaigns of this customer". The misspelled `messege*` names are kept to match the backend. UI translation not re-audited.

## Social media

**Status:** PARTIAL (Facebook read-only)

- **What it does:** **organic** social presence — connected profiles/pages, published content, engagement and comments — at `/social-media` (overview index, `profiles`, `content`, `planner`, `analytics`, `facebook`, `facebook/:pageId`, `instagram`, `tiktok`, `snapchat`). Separate UI domain from paid Campaigns even though both use Meta.
- **Key files:** `features/social-media/config/socialPlatformsRegistry.js` (single source of truth; Facebook `available: true` with adapter; Instagram/TikTok/Snapchat `available: false`), `socialCapabilities.js` (`profiles`, `contentRead`, `engagementRead`, `commentsRead` true for Facebook; create/schedule/publish/insights false everywhere), `adapters/socialAdapterContract.js` + `adapters/facebook/`, `api/facebookSocialApi.js` (thin re-export of `facebookCampaignApi.getPagePosts|getPostEngagement|getPostComments`), hooks `useSocialProfiles` (uses `useFacebookIntegrations`), `useSocialContent`, `useSocialEngagement`, `useSocialComments`, `socialKeys.js`; components (profile cards/header, metrics, content, details); `pages/social-media/`; locale `socialMedia.js`.
- **Three independent states:** supported by ICAN (`available`), included in the tenant package (`moduleKeys` vs `user.modules`), connected (runtime data). Never collapse them into one boolean. UI checks capabilities, never platform names.
- **API:** `GET /api/tenant/facebook/campaigns/pages/{pageId}/posts`, `GET .../posts/{postId}/engagement`, `GET .../posts/{postId}/comments` (shared with Campaign Center).
- **Used by:** sidebar Growth → Social Media (`permission: 'social.view'`).
- **Extend:** new platform = registry entry + adapter implementing the contract + capabilities; no new routes beyond its platform page.
- **Known issues:** no publishing, scheduling, planner backend or insights for any platform; Instagram/TikTok/Snapchat have no adapters.

## Tasks

**Status:** CURRENT (board persistence PARTIAL)

- **What it does:** task workspace at `/tasks` with board/list UX, smart views (All, Due Today, Overdue, In Progress, …), Kanban and calendar views, task drawer, reusable task form, header button and quick sidebar panel. Board/list placement is organizational and separate from task **status** (`pending`, `in_progress`, `completed`, `cancelled`).
- **Key files:** `features/tasks/api/tasksApi.js`, `hooks/useTasks.js`, `components/` (`TaskDrawer`, `TaskForm`, `TaskFormDialog`, `TaskKanbanView`, `TaskCalendarView`, `TasksNavbarButton`, `TasksSidebarPanel`, `board/`, `workspace/`), `repositories/taskBoardRepository.js` (static board and list definitions), `utils/taskMeta.js`, `workflow/taskWorkflowDefinition.js`; `pages/tasks/TasksPage.jsx`; locale `tasks.js`.
- **API (`/api/tenant/tasks`):** `GET` list, `POST` create, `GET|PUT|DELETE {id}`, `PATCH {id}/status`, `PATCH {id}/read`, `POST {id}/assign-users`, `DELETE {id}/users/{userId}`, `POST {id}/assign-teams`, `DELETE {id}/teams/{teamId}`, `POST {id}/notes`, `PUT|DELETE {id}/notes/{noteId}`, `POST {id}/attachments`, `DELETE {id}/attachments/{attachmentId}`.
- **Used by:** `/tasks`, header, calendar (`taskEventAdapter`), workflow engine, customer drawer (separate mini Tasks tab).
- **Known issues (backend gaps):** boards, board lists, ordering and membership are not persisted (static definitions); missing endpoints for task activity log, board item movement, reminders scheduler, bulk actions, subtasks/checklists, recurring tasks, server-side filtering (`status, priority, due_date, assignee…`), and realtime `task.*` / `task_board*` events. `TaskCalendarView` is not on the shared calendar engine.

## Workflow engine and automation

**Status:** PARTIAL (builder CURRENT, execution PLANNED)

- **What it does:** one central automation engine. Each module registers its triggers, conditions, actions and variables; the same builder adapts to the module that opens it and supports cross-module actions. Full page `/automation` (`pages/automation/AutomationCenterPage.jsx`, workflow list via `VisualFlowSidebar` + builder); embeddable anywhere via `WorkflowLauncher`, `useWorkflowBuilder` + `WorkflowBuilder mode="context"`, or `WorkflowBuilder … embedded` (e.g. outreach campaign details).
- **Key files:** `features/workflow-engine/registry/workflowRegistry.js` (`registerWorkflowModule`, `getModules`, `getTriggers|Conditions|Actions(ForContext)`, data sources), `config/registerBuiltinModules.js` (imports module definitions; also registers a `notifications` module whose actions are `backendSupport: false`), `config/registerDataSources.js`, `hooks/useDataSourceOptions.js`, `core/` (node types, domain model), `components/` (`WorkflowBuilder`, `WorkflowLauncher`, `WorkflowVisualCanvas` on Visual Flow, node library/properties, `WorkflowLocalStorageNotice`), `hooks/useWorkflowStore.js` (Zustand `persist`, key `ican-workflow-drafts`), `templates/`; module definitions in `features/{leads,opportunities,outreach-campaigns,tasks}/workflow/*WorkflowDefinition.js`; locale `workflow.js`.
- **Node concepts:** trigger (`entity.event`), conditions, actions (`backendSupport: true|false` per action), branch, wait, wait-for-event, variables (`{{key}}`), context (`module`, `entity`, `entityId`).
- **API:** none — workflows are local browser drafts; the UI never claims a workflow is running. Suggested backend surface: `GET|POST /workflows`, `GET|PUT|DELETE /workflows/{id}`, `POST /workflows/{id}/activate|pause|duplicate`, `GET /workflows/{id}/executions`, `GET /workflow-executions/{id}`, `GET /workflow-executions/{id}/logs`, plus event bus, action executors, scheduler/queue, variable resolution, versioning, retry, idempotency, loop protection, permissions and tenant capabilities.
- **Used by:** `/automation`, deals workspace, outreach campaign details, any module via `WorkflowLauncher`, and as a full page via **`WorkflowModuleWorkspace({ context })`** (notice + embedded builder; added 2026-10-01 01:20 (Africa/Cairo)) in `/LeadsCenter/automation` and the Communication hub `/<module>/automation`.
- **Extend:** new module = `features/<module>/workflow/<module>WorkflowDefinition.js` calling `registerWorkflowModule({...})` + one import line in `registerBuiltinModules.js` + labels in `locales/{ar,en}/workflow.js`. New action field data source = a `case` in `useDataSourceOptions.js` registered in `registerDataSources.js`. Never build a second automation engine.
- **Known issues:** no persistence or execution backend; drafts are per browser; many actions `backendSupport: false` (e.g. send notification).

## Integrations

**Status:** PARTIAL

- **What it does:** tenant integration settings and provider connections. `/settings/integrations` has two tabs: **Meta** (default — connect Meta account, refresh connection, list connected Facebook pages) and **Other integrations** (generic list). OAuth return lands on `/integrations/facebook/callback` (`pages/integrations/FacebookCallbackPage.jsx`), which reads `status`, `pages_saved`, `messenger_saved`, `whatsapp_saved`, strips the `#_=_` artifact, toasts the result and redirects to `/settings/integrations` after ~2.5 s.
- **Key files:** `features/integrations/api/integrationsApi.js`, `hooks/useIntegrations.js`; `features/integrations/whatsapp/` (WhatsApp messaging + templates API and hooks, `WHATSAPP_INTEGRATION_QUERY_KEYS`); `features/meta-integrations/` (see [Ad campaigns and Meta integrations](#ad-campaigns-and-meta-integrations)); `pages/settings/pages/integrations/` (`MetaIntegrationTab`, `OtherIntegrationsTab`). The Meta connect link is resolved by `utils/metaConnectUrl.js` (absolute URLs kept, relative ones built as `{scheme}://{tenant}.{VITE_API_ROOT_DOMAIN}/{link}`).
- **API:** `GET /api/tenant/integrations/get`, `POST .../save/intgration`, `POST .../edite/intgration/{id}` (backend spelling); Meta connect/pages/refresh; WhatsApp endpoints listed under [Conversations](#conversations).
- **Used by:** settings, conversations (WhatsApp), `/templates` (WhatsApp template management via `WhatsappTemplatesDialog`), campaigns, outreach, social media.
- **Known issues:** `integrations` vs `meta-integrations` ownership overlap; WhatsApp code lives under `integrations` while Messenger/Gmail live under `conversations`.

## Notifications

**Status:** CURRENT (persistent API center + realtime cache updates)

> **Documentation update:** 2026-09-30 01:00 (Africa/Cairo)

- **What it does:** responsive notification center in the header with an unread badge, All/Unread views, translated type filter, backend-driven colored icons, severity and Lead/Customer Management badges, time grouping, relative timestamps, optimistic single/bulk read actions and safe navigation to registered CRM routes. Unknown backend types and icons use safe fallbacks.
- **Architecture:** the persistent source of truth is React Query (`QUERY_KEYS.notifications.unread|history`). `normalizeNotification` and `notificationRegistry` isolate payload differences from UI; `notificationCache` deduplicates by ID and merges API/realtime races. `useTenantNotificationsRealtime` uses the existing Echo subscription, upserts `.notification.created` events into the caches and plays `/notifications/NewNotification.mp3` once per notification ID. The Zustand store remains only for panel open state and legacy temporary conversation notifications; those items are not mixed into API history.
- **Key files:** `features/notifications/api/notificationsApi.js`, `hooks/useNotifications.js`, `components/{NotificationCenterButton,NotificationCenterPanel,NotificationList,NotificationItem}.jsx`, `utils/{normalizeNotification,notificationRegistry,notificationCache,notificationTime}.js`; `realtime/hooks/useTenantNotificationsRealtime.js`; locale `notifications.js`.
- **API:** `GET /api/tenant/notifications/center/unread`, `GET .../history`, `GET .../read/{id}`, `POST .../read/many` with `{ ids }`; realtime channel `tenant.{tenantId}.notifications.{userId}`, event `.notification.created`.
- **Used by:** `Header`, tenant notification realtime; conversation-specific temporary badges continue using their compatibility store.
- **Known issues:** backend exposes no pagination, delete/archive/preferences/read-all endpoints. There is no full `/notifications` page yet; the list/item components are ready for reuse when one is added. The legacy localStorage notification list remains until all channel badges move to their own server-backed unread sources.

## Operational alerts

> **Documentation update:** 2026-09-30 01:14 (Africa/Cairo)

**Status:** CURRENT

- **What it does:** compact centered card stack for SLA and operational risks, oldest-to-newest overlap with a direction-aware desktop fan interaction, independent warning indicator in Header, progressive disclosure after four alerts, full active-alert Drawer, severity summary, entity navigation and optimistic Acknowledge.
- **Architecture:** `features/alerts` owns its API, React Query cache, stable normalization model, registry, priority sorting and session-only new-ID sound detection. Alerts use `open/acknowledged/resolved`, never notification `read/unread` state.
- **API:** `GET /api/tenant/alerts`; `POST /api/tenant/alerts/{id}/acknowledge`. No Resolve/history endpoints are assumed.
- **Sound:** `/Alerts/NewAlert.mp3` plays only when a new ID appears after initial load. Existing Alerts returned on refresh are silent. No alert realtime contract currently exists.
- **Used by:** `MainLayout` (`AlertsStack`) and `Header` (`AlertsIndicator`). Full documentation: `src/features/alerts/Alerts_README_AR.md`.
- **Known issues:** active API has no documented pagination; no realtime event; no Resolve action or user sound preferences.

## AI agent

**Status:** PARTIAL (UI scaffold)

- **What it does:** assistant UI components and an AI permission model.
- **Key files:** `features/ai-agent/components/AgentChat.jsx` (chat box; answers only through an `onAsk` prop), `AgentSuggestions.jsx`, `AIThinkingIndicator.jsx`, `AutomationLog.jsx`; `services/agentPermissions.js` (`getAiPermission`, `AI_PERMISSION_LEVELS`, tested). Styling uses `--ai-*` tokens.
- **API:** none.
- **Used by:** `AgentChat` in the deals workspace drawer (rendered without `onAsk`).
- **Known issues:** no AI backend contract, so the chat never answers; `AgentSuggestions` and `AutomationLog` have no consumers; hardcoded Arabic copy in `AgentChat`.
- **AI setup pages** *(added 2026-10-01 00:25 (Africa/Cairo))*: any module's "AI setup" page uses the shared `shared/components/ai-setup` (`AiSetupPage`, presentation only, per-browser draft without `onSave`) — first used by the Communication hub (`/calls/ai`, `/meetings/ai`, `/conversations/ai`, `/team-chat/ai`). A dedicated, larger **`features/ai`** domain is planned (models/providers, prompts, knowledge, quotas, settings API, agents); it will plug into `AiSetupPage` through `initialValues`/`onSave`, and `features/ai-agent` + `features/service/ai` should align with it.

## Products and services

**Status:** CURRENT

- **What it does:** products, product categories (tree), services and service categories under `/products` (own layout and sidebar: `categories`, `services`, `service-categories`). Services reuse `ProductsPage` with `productType="service"`.
- **Key files:** `features/products/api/productsApi.js`, `categoriesApi.js`, `linkProductsApi.js`, `hooks/useProducts.js` (`useProducts`, `useProductCategories`, `useProductMutations`); `pages/products/ProductsPage/` (`ProductsPage`, `ProductFormDrawer`, `ProductCategoriesPage`, `CategoryFormDrawer`, `categoryTree.js`, `AdditionalDataFields`), `pages/products/ServicesPage/`, `layout/`; locale `products.js`.
- **API:** `GET /api/tenant/product/data`, `GET .../info/{id}`, `POST .../create`, `POST .../update/{id}`; categories `GET /api/tenant/category/data`, `GET .../info/{id}`, `POST .../create`, `POST .../update/{id}`; link products `POST /api/tenant/link-products/save`, `POST .../update-status`.
- **Used by:** `/products`, lead interests and follow-up dialogs, customer products dialog, proposal builder/pricing, Messenger link-customer dialog.
- **Known issues:** Unverified: delete endpoints for products/categories (none in the API files).

## Settings and appearance

**Status:** CURRENT (brand persistence local only)

- **What it does:** `/settings` has its own layout on the shared sub-sidebar (`SettingsLayout` → `SubSidebarLayout`, `constants/settingsNavigation.js` → `getSettingsSidebarConfig(t)`, labels now i18n `settings.*`; collapse state in `settings-sidebar-collapsed`). Pages: `/settings` → definitions, `/settings/definitions`, `/settings/users`, `/settings/integrations`, `/settings/appearance`, and the **Communication** group `/settings/communication/:moduleId` (conversations, calls, meetings, team-chat). *(Updated 2026-10-01 00:25 (Africa/Cairo).)*
- **Settings sections registry** *(added 2026-10-01 00:25 (Africa/Cairo))*: `pages/settings/registry/settingsSections.jsx` is the single source of settings sections ([README](../src/pages/settings/registry/README.md)). `getSettingsSections(ids, t)` feeds a module's own settings page (shared `ModuleSettingsPage`), so a section renders identically in `/settings` and inside the module.
- **Appearance:** tenant admins pick **brand primary** and **brand accent**; `features/branding/utils/deriveBrandTokens.js` (pure) derives `--brand-primary-l` (+12 lightness), `--brand-accent-soft` (92 % light / 15 % dark lightness), `--ai-color` (= accent), `--ai-bg` (= accent soft), `--ai-border` (70 % lightness). `themeStore.setBrandPrimary/Accent` apply tokens live on `document.documentElement`; `saveBrandTokens` persists via `features/branding/api/brandingApi.js` to localStorage (`ican-crm:brand-tokens`); `resetBrandTokens` restores `src/index.css` defaults. Drafts are excluded from zustand persist. `ThemeProvider` re-applies tokens on mount and on theme/brand change. Font family, semantic tokens, spacing and density are deliberately not exposed.
- **Key files:** `pages/settings/` (layout, `pages/definitions|users|integrations|appearance`), `features/branding/` (`api/brandingApi.js`, `utils/deriveBrandTokens.js`, `hooks/useAppearanceSettings.js`, `index.js`), `store/themeStore.js`; locale `branding.js`.
- **API:** definitions, users and integrations APIs (see [2-SALES.md → Statuses, tags and pipeline](2-SALES.md#statuses-tags-and-pipeline), [2-SALES.md → Teams and users](2-SALES.md#teams-and-users), [Integrations](#integrations)); branding has no backend yet. Proposed: `GET /api/tenant/branding` → `{ brandPrimary, brandAccent }`, `PUT /api/tenant/branding` (6-digit hex, tenant-scoped); only `brandingApi.js` should change.
- **Known issues:** brand colors do not sync across devices/users; only `Button` and the shared sub-sidebar read brand tokens — screens with hardcoded brand hex do not follow the picked colors.

## Customer Hub (Customer Service)

**Status:** FRONTEND DONE ON MOCK DATA — F0–F7 built (F2 = MVP-1, F5 = MVP-2); field service, inventory and supplier portal deferred to a later phase. User-facing name **Customer Hub / إدارة العملاء**; code name stays `service`. Full domain doc: [4-CUSTOMER-SERVICE.md](4-CUSTOMER-SERVICE.md).

**What it does:** Service Operations after the sale — cases/tickets, SLA, service records (bookings, shipments, enrollments, projects), assets and warranty, entitlements, contracts, installments, scheduling, work orders, follow-ups and a customer portal. Works with Sales (contract → handoff) or standalone. Industries are configuration: screens render from the tenant capabilities manifest.

**Code:** `features/service` (public surface `index.js`), `pages/service` (lazy routes in `serviceRoutes.js`), `locales/{ar,en}/service*`.

**Feature inventory** (source of truth: `features/service/core/constants/serviceModules.js`)

| Feature | Phase | Status | Data |
|---|---|---|---|
| Capabilities manifest, terminology, industry templates (demo) | F0 | CURRENT | mock |
| Service overview `/service` (roadmap, template switcher) | F0 | CURRENT | mock |
| Operations Center `/service` (counters incl. SLA at risk / breached, My Work preview) | F1–F2 | CURRENT | mock |
| Cases `/service/cases` (views, list, board, create) and case detail (timeline, reply, internal note, status, properties) | F1 | CURRENT | mock |
| Queues (filter + assign) | F1 | CURRENT | mock |
| My Work `/service/my-work` | F1 | CURRENT | mock |
| Contacts & relationships (case detail, drawer) | F1 | CURRENT | mock |
| Conversation → Case (thread header in `/conversations`) | F1 | CURRENT | mock |
| Customer drawer **Services** tab | F1 | CURRENT | mock |
| Operations settings `/service/settings/*` (case types, queues, SLA policies, business hours, escalation, saved replies, macros, KB categories) | F2 | CURRENT | mock |
| SLA on cases (badge, panel, views, escalation timeline) | F2 | CURRENT | mock |
| Saved replies in the composer, macros on the case | F2 | CURRENT | mock |
| Knowledge base `/service/knowledge` + suggested articles on cases | F2 | CURRENT | mock |
| CSAT on cases + feedback list | F2 | CURRENT | mock |
| Reports `/service/reports` (KPIs, trend, breakdowns, agents) | F2 | CURRENT | mock |
| Case filters + saved views (private / shared) | F2 | CURRENT | mock |
| Setup wizard (industry templates) | F3 | CURRENT | mock |
| Catalog service setup: capabilities, item types, record types, pipelines (editor), catalog items' fulfillment & attached services | F3 | CURRENT | mock |
| Services hub `/service/records…`: service records (participants, components, entries, documents, timeline, customer updates) and batches | F3 | CURRENT | mock |
| Assets & warranty, entitlements with ledger, case coverage | F3 | CURRENT | mock |
| Contracts (versions, signatures, amendments) and Sales → Service handoffs | F3 | CURRENT | mock |
| Payment plans & installments, collections, subscriptions, scheduling, work orders, courier dispatch + COD | F4 | CURRENT | mock |
| Portal administration (accounts, memberships, policies, request catalog, branding) | F5 | CURRENT | mock |
| Customer portal app (`portal.html`, `/portal/*`: self / guardian / B2B / guest tracking) | F5 | CURRENT | mock |
| Imports (CSV, mapping, dry run, error file) | F5 | CURRENT | mock |
| Follow-up programs + Follow-ups workspace, portfolios | F5 | CURRENT | mock |
| API clients + outbound webhooks (delivery log) | F5 | CURRENT | mock |
| KB versions + review workflow, stats & content gaps, portal help + public help center, deflection | F6 | CURRENT | mock |
| Quality checklists, sampling, reviews (RCA/CAPA); NPS/CES surveys | F6 | CURRENT | mock |
| Workflow Engine registration, case-type form builder, template versioning, global search, major incidents | F6 | CURRENT | mock |
| AI signals, triage, summaries, draft replies, duplicates, assignment suggestions, AI settings | F7 | CURRENT | mock |
| Portal AI agent (handoff), health score, at-risk list, advanced analytics, subscription proration | F7 | CURRENT | mock |
| Field service, inventory, supplier portal | F8 | DEFERRED | — |

**Reuses (never duplicates):** `features/customers` (identity), `features/conversations` (channels via `getChannelAdapter` / `index.js`), `features/tasks` (subtasks, follow-up steps), `features/workflow-engine` (automation), `features/teams`/`users`, `features/notifications` + realtime, `shared/components/data-table`, `pipeline-board`, `calendar`.

**API:** all calls go through `createServiceApi(moduleKey)`; while a module is `backend: 'mock'` the request is served by `features/service/mocks` with the real URL and error shape. Contract: [customer-service/SERVICE-MASTER-SPEC.md](customer-service/SERVICE-MASTER-SPEC.md) §51–52.

**Navigation:** section Customer Hub (`module: 'customer_service'`): Operations Center, Cases, Services (hub with tabs), My Work, Knowledge Base, Reports, Operations Settings.

**Known issues:** Customer Hub workflow triggers/actions are `backendSupport: false` until the server ships them; AI is simulated by the mock (no model calls); document builder/PDF for contracts not built yet; portal uploads have no file storage yet and online payment has no real gateway; service config lives in the Customer Hub, not in the Products form; SLA in the mock uses wall-clock time (the backend owns business-time SLA); the board shows loaded pages only; Conversation → Case and the drawer Service tab were not visually verified against the real backend.
