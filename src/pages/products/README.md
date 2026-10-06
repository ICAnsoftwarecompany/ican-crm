# pages/products — Products & Services routes

> **Documentation update:** 2026-10-06 23:35 (Africa/Cairo) — README added; routes moved to `productRoutes.jsx`.

Thin route pages for `/products/*`; the screens live in `features/products` ([README](../../features/products/README.md)).
`productRoutes.jsx` is spread into the MainLayout children in `app/router` (same pattern as `pages/deals`).

| Path | Page |
|---|---|
| `/products` | Products, plans and bundles (`CatalogProductsView kind="product"`) |
| `/products/new` | Create wizard (`?kind=service` for a service) — 2026-10-07 02:30 (Africa/Cairo) |
| `/products/services` | Services (`kind="service"`) |
| `/products/instances` | All serials / units / batches |
| `/products/categories`, `/products/service-categories` | Category trees (legacy pages in `ProductsPage/`) |
| `/products/item-types` | Item types and capabilities |
| `/products/units` | Units of measure |
| `/products/reports` | Reports (shared engine) |
| `/products/:productId` | Product details (`?tab=units|relations|instances`) |

Static paths rank above `:productId`. Sidebar groups: `constants/productNavigation.js`.
Smoke test: `productRoutes.test.jsx`.
