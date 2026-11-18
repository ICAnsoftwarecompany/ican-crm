# pages/service

Route composition only — pages assemble components from `features/service` (imported via its
`index.js`) and set the page header. No API calls, business rules or large UI here.

| File | Route | Phase |
|---|---|---|
| `serviceRoutes.js` | Declares every `/customer-management/service/*` route (lazy). It is nested under `customerManagementRoutes`. | F0 |
| `ServiceLayout.jsx` | Shell for `/customer-management/service/*`. | F0 |
| `ServiceCenterPage.jsx` | `/customer-management/service` — Operations Center: counters, My Work preview, new case, demo banner. | F1 |
| `../ticket-module/ServiceCasesPage.jsx` | `/customer-management/service/cases` and `/customer-management/tickets` — cases workspace. | F1 |
| `../ticket-module/ServiceCaseDetailPage.jsx` | `/customer-management/service/cases/:caseId` and `/customer-management/tickets/:caseId` — case detail. | F1 |
| `../my-work/ServiceMyWorkPage.jsx` | `/customer-management/service/my-work` and `/customer-management/tickets/my-work` — full My Work list. | F1 |
| `../knowledge-base/ServiceKnowledgePage.jsx` | `/customer-management/service/knowledge` and `/customer-management/tickets/knowledge` — knowledge base list. | F2 |
| `../knowledge-base/ServiceKnowledgeArticlePage.jsx` | `/customer-management/service/knowledge/:articleId` and `/customer-management/tickets/knowledge/:articleId` — article editor (`new` creates). | F2 |
| `../reports/ServiceReportsPage.jsx` | `/customer-management/service/reports` and `/customer-management/tickets/reports` — overview dashboard + feedback tab. | F2 |
| `../operations-settings/ServiceSettingsPage.jsx` | `/customer-management/service/settings/:section?` — canonical operations settings route; the base path opens `health`. `/customer-management/tickets/settings/:section?` remains available. | F2 |
| `ServicesHubLayout.jsx` | Services hub shell (tabs from `ServicesHubNav`) for the F3 routes below. | F3 |
| `ServiceRecordsPage.jsx`, `ServiceRecordDetailPage.jsx` | `/customer-management/service/records/:recordType?`, `/customer-management/service/records/:recordType/:recordId`. | F3 |
| `ServiceBatchesPage.jsx` | `/customer-management/service/batches/:recordType?/:batchId?`. | F3 |
| `ServiceAssetsPage.jsx`, `ServiceEntitlementsPage.jsx` | `/customer-management/service/assets/:assetId?`, `/customer-management/service/entitlements`. | F3 |
| `ServiceContractsPage.jsx`, `ServiceHandoffsPage.jsx` | `/customer-management/service/contracts/:contractId?`, `/customer-management/service/handoffs/:handoffId?`. | F3 |
| `ServiceOverviewPage.jsx` | `/customer-management/service/overview` — capabilities, mock template switcher, roadmap. | F0 |

Add a page: create `<Name>Page.jsx`, add a lazy child route in `serviceRoutes.js`, list it in the
routes table of [docs/4-CUSTOMER-SERVICE.md](../../../docs/4-CUSTOMER-SERVICE.md#routes-and-navigation).


## Shipping-first navigation pilot

Updated: 2026-11-13 00:19 (Africa/Cairo).

The main sidebar now gives Support & Tickets a separate section pointing to the existing case, knowledge and SLA routes. Customer Hub keeps its operations pages and adds a shipping entry that opens `/shipping` with its own shared sub-sidebar, plus a subscription link to the existing service route. This is a frontend navigation pilot, not an implementation of tenant module entitlements.
