# pages/products — Products & Services routes

> **Documentation update:** 2026-10-06 23:35 (Africa/Cairo) — README added; routes moved to `productRoutes.jsx`.
> 2026-10-15 13:43 (Africa/Cairo) — sidebar sub-pages: one per active item type (`/products/types/:id`), plans and bundles under Services.
> 2026-10-15 00:56 (Africa/Cairo) — `/products/overview` (first in the sidebar) and `/products/:productId/complete`.
> 2026-10-15 00:44 (Africa/Cairo) — `?draft=<id>` on `/products/new` (add product folder `features/products/product-create`).
> 2026-10-14 23:53 (Africa/Cairo) — item type wizard pages, `?item_type=` on `/products/new`.

Thin route pages for `/products/*`; the screens live in `features/products` ([README](../../features/products/README.md)).
`productRoutes.jsx` is spread into the MainLayout children in `app/router` (same pattern as `pages/deals`).

| Path | Page |
|---|---|
| `/products` | Products (`kind="product"`; plans and bundles moved under Services 2026-10-15 13:43 (Africa/Cairo)) |
| `/products/overview` | Overview: totals, value, top categories / item types, completeness, missing-type alerts — 2026-10-15 00:56 (Africa/Cairo) |
| `/products/new` | Create wizard (`?kind=service` for a service, `?item_type=<id>` to start with a type, `?draft=<id>` to continue a draft) — 2026-10-07 02:30, `item_type` 2026-10-14 23:53, `draft` 2026-10-15 00:44 (Africa/Cairo) |
| `/products/services` | Services (`kind="service"` only since 2026-10-15 13:43 (Africa/Cairo)) |
| `/products/services/plans` · `/products/services/bundles` | Plans and bundles, sub-pages of Services — 2026-10-15 13:43 (Africa/Cairo) |
| `/products/types/:itemTypeId` | The items of one item type; a sidebar sub-page per active type (product types under Products, service / plan / bundle types under Services), title = the type's name — 2026-10-15 13:43 (Africa/Cairo) |
| `/products/instances` | All serials / units / batches |
| `/products/categories`, `/products/service-categories` | Category trees (legacy pages in `ProductsPage/`) |
| `/products/item-types` | Item types list (+ setup guide when empty) |
| `/products/item-types/new` | Item type wizard (`?kind=`, `?returnTo=`) — 2026-10-14 23:53 (Africa/Cairo) |
| `/products/item-types/:itemTypeId` | Edit an item type in the same wizard — 2026-10-14 23:53 (Africa/Cairo) |
| `/products/units` | Units of measure |
| `/products/reports` | Reports (shared engine) |
| `/products/:productId` | Product details (`?tab=units|relations|instances`) |
| `/products/:productId/complete` | Guided completion of the missing data — 2026-10-15 00:56 (Africa/Cairo) |

Static paths rank above `:productId`. Sidebar groups: `constants/productNavigation.js` — since 2026-10-15 13:43 (Africa/Cairo) `ProductsLayout`
reads the item types and passes them in, so every active type gets a sub-page named after it (new types appear at once).
Smoke test: `productRoutes.test.jsx`.
