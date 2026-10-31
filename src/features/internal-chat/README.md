# Internal Chat

## Workspace Integration - 2026-10-19 15:18 (Africa/Cairo)

Owns internal chat API, conversation list/thread, messages and realtime. Public exports are in `index.js`; cross-feature consumers should use them.

`InternalChatWorkspace` is the global workspace by default. Embedded consumers may pass `conversations` and `scopeKey` for local selection that never falls back to global chat. Mount with `key={scopeKey}` when switching scopes. The embedding caller handles list loading/errors/empty state; backend controls access.

`getAllChatConversations()` follows numbered list pagination and deduplicates IDs. Deals use it to discover exact `<deal name> - G<number>` groups. It never creates groups on read. Creation uses the existing `internalChatApi.createConversation` contract.

Mark-as-read runs on active ID changes, not new response objects, preventing invalidation/refetch loops. Focused tests cover scope isolation and pagination. Existing standalone chat has legacy hardcoded text; this change does not redesign or translate it.
