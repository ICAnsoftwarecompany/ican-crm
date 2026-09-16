# Internal Chat Workspace

## Purpose
Internal team collaboration inside ICAN CRM tenant scope. This module is isolated from external channels (WhatsApp, Messenger, Gmail).

## Implemented Architecture
- API layer: src/features/internal-chat/api/internalChatApi.js
- Hooks: src/features/internal-chat/hooks
- UI state: src/features/internal-chat/store/internalChatUiStore.js
- Utilities: src/features/internal-chat/utils
- Main page: src/pages/chat/InternalChatPage.jsx
- Quick panel: src/features/internal-chat/components/InternalChatSidebarPanel.jsx

## Routes
- Full workspace: /team-chat
- Header quick panel toggle available from top bar icon

## Existing APIs Used
- GET /api/tenant/chat
- POST /api/tenant/chat
- GET /api/tenant/chat/{conversation}/messages
- POST /api/tenant/chat/{conversation}/read
- POST /api/tenant/chat/{conversation}/members
- DELETE /api/tenant/chat/{conversation}/members/{user}
- PATCH /api/tenant/chat/{conversation}/members/{user}/role
- POST /api/tenant/chat/{conversation}/mute
- POST /api/tenant/chat/{conversation}/unmute
- POST /api/tenant/chat/send/messages/{conversation}

## Query Keys
Defined centrally in src/features/internal-chat/constants/chatConstants.js via chatKeys.

## Realtime Integration
- Reuses existing realtime singleton through useRealtimeChannel.
- Subscribes to tenant notification channel and filters internal-chat events.
- Updates affected caches and unread counts.

## Message Lifecycle
1. Load paginated messages via useChatMessages.
2. Normalize and sort oldest-to-newest.
3. Send through multipart endpoint.
4. Optimistic append temporary pending message.
5. Reconcile with server message.

## Conversation Lifecycle
1. List conversations.
2. Normalize direct/group display data without mutating raw response.
3. Select active conversation in UI store.
4. Mark as read when opened.

## Backend Enhancements Required
- unread_count reliability and last_read_message_id
- edit message endpoint consistency
- delete message endpoint consistency
- reactions endpoints validation
- search endpoint for server-side message search
- pin/saved/threads endpoints
- mentions payload and resolved ids
- archive/unarchive and leave conversation
- direct chat deduplication at backend level

## Notes
This implementation intentionally reuses:
- shared httpClient
- existing auth token flow
- existing tenant notification channel
- existing notification center infrastructure

No additional Axios instance or second realtime connection is created.
