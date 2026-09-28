# pages/service

Route composition only — pages assemble components from `features/service` (imported via its
`index.js`) and set the page header. No API calls, business rules or large UI here.

| File | Route | Phase |
|---|---|---|
| `serviceRoutes.js` | Declares every `/service/*` route (lazy). The app router spreads it once. | F0 |
| `ServiceLayout.jsx` | Shell for `/service/*` (internal sidebar arrives in F1). | F0 |
| `ServiceOverviewPage.jsx` | `/service` — capabilities, mock template switcher, roadmap. | F0 |

Add a page: create `<Name>Page.jsx`, add a lazy child route in `serviceRoutes.js`, list it in the
routes table of [docs/4-CUSTOMER-SERVICE.md](../../../docs/4-CUSTOMER-SERVICE.md#routes-and-navigation).
