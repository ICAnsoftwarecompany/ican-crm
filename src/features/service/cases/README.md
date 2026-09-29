# features/service/cases — Cases (F1)

The core entity of Customer Service: a customer problem, request, inquiry or complaint.
Tenants rename it (Ticket, Request…) through terminology — always show it with `term('case')`.

## What it does

- **Workspace** (`/service/cases`): built-in views with live counts, server search, list (DataTable,
  paged on scroll) or board (grouped by status **category**), create dialog. State in the URL:
  `?view=&mode=board&q=`.
- **Detail** (`/service/cases/:caseId`): header + "Change status" menu, activity timeline (customer
  messages, replies, internal notes, system events), reply / internal-note composer, editable properties
  (assignee, queue, priority, severity), customer contacts.
- **Create** from anywhere: `CaseCreateDialog` (`defaults` pre-fill), `CreateCaseFromConversationButton`
  (thread header in `/conversations`), Service tab in the customer drawer.

## Files

| Path | Role |
|---|---|
| `api/casesApi.js` | All case endpoints (via `createServiceApi('cases')`). Response shape documented at the top. |
| `hooks/useCases.js` | `useCaseSetup`, `useCaseSummary`, `useCaseList` (infinite), `useCase`, `useCaseActivities`, `useCaseMutations`, `useCustomerLookup`. |
| `hooks/useCaseTransitionFlow.jsx` | One flow for every status change: runs directly, or opens the dialog when the transition has `required_fields`. |
| `constants/caseViews.js` | View keys, board categories, priorities, severities. |
| `utils/caseStatus.js` | Pure helpers: allowed transitions from the pipeline, tone classes. Tested. |
| `components/CasesWorkspace.jsx` | Toolbar + view tabs + table/board. |
| `components/CasesTable.jsx`, `CasesBoard.jsx` | List on DataTable (cursor mode) / board on PipelineBoard. |
| `components/CaseCreateDialog.jsx` | Customer lookup, subject, type, priority, queue, description. |
| `components/CreateCaseFromConversationButton.jsx` | Thread-header action for conversations. |
| `components/CaseTransitionDialog.jsx` | Collects transition fields (resolution code + summary). |
| `components/CaseBadges.jsx`, `CaseTypeIcon.jsx`, `CaseViewTabs.jsx` | Small UI. Type icons are an allowlist. |
| `components/detail/*` | Detail view, activity feed, composer, properties panel, transition menu. |

## Rules

- **The backend owns the pipeline.** The UI only offers transitions listed in
  `setup.case_types[].pipeline.transitions` and shows the fields they require. Never hardcode statuses:
  group by `status.category` (`open | in_progress | pending | resolved | closed | cancelled`).
- Every write sends `version`; a `409 CONFLICT_VERSION` toast refetches the case.
- Tenant labels (types, statuses, queues, resolution codes) are `{ ar, en }` → `localizeLabel()`.
- Internal notes are `visibility: 'internal'` and styled with a dashed border + lock — they must never
  appear in customer-facing surfaces (portal, messages).
- Replies go out on the case channel; the backend applies the messaging policy (WhatsApp 24h window).

## Query keys

`serviceKeys.caseSetup()`, `caseSummary()`, `caseList(params)`, `caseDetail(id)`, `caseActivities(id)`,
`customerLookup(search)`. Mutations invalidate lists, summary and My Work.

## API (contract proposed to the backend — see docs/4-CUSTOMER-SERVICE.md#api-used-by-the-frontend)

`GET cases/setup` · `GET cases/summary` · `GET cases?view=&search=&queue_id=&type_id=&priority=&customer_id=&page=&per_page=` ·
`POST cases` · `POST cases/from-conversation/{conversationId}` · `GET|PATCH cases/{id}` · `POST cases/{id}/transition` ·
`POST cases/{id}/assign` · `GET cases/{id}/activities` · `POST cases/{id}/reply` · `POST cases/{id}/notes` ·
`GET customers/lookup?search=` (all under `/api/tenant/service/`).

## Tests

`utils/caseStatus.test.js`, `../mocks/handlers/casesHandlers.test.js` (views, create, transitions, versions, notes).

## Open issues

- Board shows loaded pages only ("Load more" appends).
- DataTable column filters work on loaded rows; server-side filters beyond view/search arrive with saved views (F2).
- SLA badges, macros and saved replies arrive in F2.
