# features/service/saved-views — Saved views (F2)

Named filter sets per list (`entity`), backed by the core endpoint `CRUD /api/tenant/saved-views`
(spec §51). Used by the cases workspace today (`entity: 'service_case'`); any list can reuse it.

| Path | Role |
|---|---|
| `api/savedViewsApi.js` | `useSavedViews(entity)`, `useSavedViewMutations(entity)` (create/remove). |
| `components/SaveViewDialog.jsx` | Name + visibility (`private` / `shared`). |

View: `{ id, entity, name, filters, visibility, owner_id }`. For cases, `filters = { view, search,
priority, queue_id, type_id }` — the same params the list endpoint accepts. The server returns only
views the user may see and enforces edit/delete rights; the UI shows "remove" to the owner only.
Cases integration: `cases/components/SavedViewTabs.jsx` + `CaseFilters.jsx`; selecting a view writes its
filters to the URL (`?saved=&view=&q=&priority=&queue=&type=`).
