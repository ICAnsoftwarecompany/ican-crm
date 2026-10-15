# features/definitions — Statuses and tags

> **Documentation update:** 2026-10-15 17:40 (Africa/Cairo) — lead **lost reasons** (`/definitions/lost-reasons`) with their manager on the lost status.
> 2026-10-04 20:04 (Africa/Cairo) — README added with the status reasons work.

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
| `api/lostReasonsApi.js`, `hooks/useLostReasons.js`, `utils/lostReasons.js` (tested) | Lead lost reasons (2026-10-15 17:40 (Africa/Cairo)): `GET/POST /definitions/lost-reasons`, `GET/PUT/DELETE …/{id}`, JSON `{ name, code, description, is_active, sort_order }`; `useLostReasons({ activeOnly })`, `useLostReasonMutations`; code suggested from the name. |
| `components/LostReasonsManager.jsx` (tested) | Add / rename / turn off / delete lost reasons, saved at once. Shown in the status dialog when the kind is "lost" (instead of the planned per-status editor) and from the "Lost reasons (N)" button on a lost status card. Used by `features/leads/outcome` (lost dialog) and the status close dialog. |

**Public API** (`index.js`): everything above.

**Request when live:** create/update status sends `reasons` as a JSON string in the same FormData
(`[{ id?, key, label, active, order }]`); the status list returns `reasons[]` per status. Contract:
[docs/backend/BACKEND-REQUESTS.md §A4](../../../docs/backend/BACKEND-REQUESTS.md).

**Known gaps:** reasons are not saved until the backend ships §A4; the Statuses page still lives in `pages/customers`.
