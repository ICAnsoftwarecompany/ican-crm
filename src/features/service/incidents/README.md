# features/service/incidents — Major incidents (F6)

One outage → many requests. An incident groups the linked cases, tracks status updates, and can post
public updates to the portal and to every linked request.

| Path | Role |
|---|---|
| `api/incidentsApi.js` | `GET/POST /service/incidents`, `GET /service/incidents/{id}`, `POST …/{id}/updates { status, message, public, notify_linked }`, `POST …/{id}/link { case_numbers[] }`. Query keys `serviceKeys.incidents(params)` / `incident(id)`. |
| `components/IncidentsWorkspace.jsx` | List (active / resolved) + create dialog. Route `/service/incidents/:incidentId?`. |
| `components/IncidentDetailView.jsx` | Timeline of updates, add an update, link cases by case number, linked cases list. |
| `components/ActiveIncidentsBanner.jsx` | Banner in the Operations Center, and on a case's detail when you pass `caseId` (only the incident linked to that case). |
| `components/IncidentBadges.jsx` | Severity / status chips. |

- **Statuses:** `investigating → identified → monitoring → resolved`.
- **Severities:** `minor`, `major`, `critical`.
- A resolved incident rejects new updates (`409 INCIDENT_RESOLVED`).
- **Portal:** `GET /api/portal/incidents/active` returns only incidents that have at least one **public**
  update. `PortalIncidentBanner` in `features/portal` shows them.
- With `notify_linked`, a public update is added as a customer-visible reply on each linked case. The real
  server must send it through the messaging policy and consent rules.
