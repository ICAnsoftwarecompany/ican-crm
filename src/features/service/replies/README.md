# features/service/replies — Saved replies & macros (F2)

| Path | Role |
|---|---|
| `components/SavedReplyPicker.jsx` | Composer button: replies that apply to the case (type + channel, empty = all), inserted with variables filled. |
| `components/MacroMenu.jsx` | Case header menu: `POST /service/cases/{id}/apply-macro { macro_id, version, language }` → updated case. |
| `utils/renderTemplate.js` | Preview-only variable filling (`{{customer.name}}`, `{{case.number}}`, `{{agent.name}}`); unknown variables stay as-is. `repliesForCase()`. |

Settings screens (CRUD) are resource definitions in `../settings/resources/communicationResources.js`
(`/service/settings/saved-replies`, `/service/settings/macros`).

Contracts:

```js
saved_reply: { id, title: {ar,en}, body: {ar,en}, case_type_ids[], channels[], owner_type, active }
macro:       { id, name: {ar,en}, description: {ar,en}, active,
               actions: [ { type: 'reply', body: {ar,en} } | { type: 'set_status', status_id }
                        | { type: 'set_priority', priority } | { type: 'add_note', body: {ar,en} } ] }
```

The server applies a macro **atomically** (status change validated against the pipeline first; 409/422
means nothing changed), renders variables, writes a `macro_applied` timeline activity, and checks
`version` (409 `CONFLICT_VERSION`). The macro form edits a flat shape and converts with
`fromItem`/`toPayload` in the resource definition.
