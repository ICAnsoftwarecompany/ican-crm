# pages/service

Route composition only — pages assemble components from `features/service` (imported via its
`index.js`) and set the page header. No API calls, business rules or large UI here.

| File | Route | Phase |
|---|---|---|
| `serviceRoutes.js` | Declares every `/service/*` route (lazy). The app router spreads it once. | F0 |
| `ServiceLayout.jsx` | Shell for `/service/*`. | F0 |
| `ServiceCenterPage.jsx` | `/service` — Operations Center: counters, My Work preview, new case, demo banner. | F1 |
| `ServiceCasesPage.jsx` | `/service/cases` — cases workspace. | F1 |
| `ServiceCaseDetailPage.jsx` | `/service/cases/:caseId` — case detail. | F1 |
| `ServiceMyWorkPage.jsx` | `/service/my-work` — full My Work list. | F1 |
| `ServiceKnowledgePage.jsx` | `/service/knowledge` — knowledge base list. | F2 |
| `ServiceKnowledgeArticlePage.jsx` | `/service/knowledge/:articleId` — article editor (`new` creates). | F2 |
| `ServiceReportsPage.jsx` | `/service/reports` — overview dashboard + feedback tab. | F2 |
| `ServiceSettingsPage.jsx` | `/service/settings/:section?` — operations settings (internal nav). | F2 |
| `ServiceOverviewPage.jsx` | `/service/overview` — capabilities, mock template switcher, roadmap. | F0 |

Add a page: create `<Name>Page.jsx`, add a lazy child route in `serviceRoutes.js`, list it in the
routes table of [docs/4-CUSTOMER-SERVICE.md](../../../docs/4-CUSTOMER-SERVICE.md#routes-and-navigation).
