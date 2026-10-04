# features/definitions — Statuses and tags

> **Documentation update:** 2026-10-04 20:04 (Africa/Cairo) — README added with the status reasons work.

**What it owns:** the API and hooks of tenant definitions (lead statuses, tags) and, since 2026-10-04, the **reasons of a
status** (each sale / lost / retarget status can carry its own reason list, offered by the lead close dialog). The Statuses
settings page itself is still in `pages/customers/pages/customization/` (legacy, don't grow it).

| Path | Owns |
|---|---|
| `api/definitionsApi.js` | `GET /definitions/status`, `POST /definitions/create/status`, `POST /definitions/update/status/{id}` (FormData), tags. |
| `hooks/useDefinitions.js` | `useStatuses`, `useTags`, `useDefinitionMutations`. |
| `constants/definitionsApiStatus.js` | `DEFINITIONS_API_STATUS` — `statusReasons: 'planned'` until the backend stores reasons; flip to `live`. |
| `utils/statusReasons.js` (tested) | `readStatusReasons`, `addReason`, `toReasonKey` (stable keys), `buildReasonsPayload`, `hasDuplicateReason`. |
| `components/StatusReasonsEditor.jsx` | Reasons editor in the status dialog (saved ones can be turned off, never deleted). Disabled with a note while planned. |
| `components/CloseKindsNotice.jsx` | Warning on the Statuses page when there is no sale or no lost status. |

**Public API** (`index.js`): everything above.

**Request when live:** create/update status sends `reasons` as a JSON string in the same FormData
(`[{ id?, key, label, active, order }]`); the status list returns `reasons[]` per status. Contract:
[docs/backend/BACKEND-REQUESTS.md §A4](../../../docs/backend/BACKEND-REQUESTS.md).

**Known gaps:** reasons are not saved until the backend ships §A4; the Statuses page still lives in `pages/customers`.
