# features/products — Catalog (products, services, item types, units, instances)

> **Documentation update:** 2026-10-06 23:35 (Africa/Cairo) — README added with the catalog rebuild on the
> Postman collection "Products & Catalog".
> 2026-10-15 00:56 (Africa/Cairo) — overview page (`overview/`), details + quick drawer + completeness + guided completion (`product-details/`), list shows every field; both folders have Arabic READMEs.
> 2026-10-15 00:44 (Africa/Cairo) — add product / service moved to `product-create/` (own Arabic README): steps follow the item type, guide, quick add + side list, quick type / category, drafts, category path.
> 2026-10-07 02:30 (Africa/Cairo) — create wizard `/products/new` (the collection's full create flow), `GET item-types/{id}` used.
> 2026-10-15 00:08 (Africa/Cairo) — everything for adding an item type moved to `item-type-wizard/` (own README in Arabic).
> 2026-10-14 23:53 (Africa/Cairo) — item type wizard page, templates, setup guide, type default units / attached items copied into new products.

Owns everything under `/products`: products and services, their alternative units, attached items (relations),
instances (serials, real-estate units, batches with expiry), item types with capabilities, units of measure.
Categories still use the old category API and the pages in `pages/products/ProductsPage`.
Backend contract: the Postman collection "Products & Catalog" (2026-10-06); spec background in
`docs/customer-service/SERVICE-MASTER-SPEC.md` §25 (catalog, capabilities).

## Public API (`index.js`)

| Export | What |
|---|---|
| `useCatalogProducts(params)`, `useProductInfo(id)`, `useCatalogProductMutations()` | Normalized products (`normalizeCatalogProduct`), filters `kind`, `item_type_id`, `category_id`, `status`, `search` |
| `useItemTypes`, `useItemTypeMutations`, `useUnits`, `useUnitMutations` | Item types / units of measure |
| `useProductUnits`, `useProductRelations`, `useProductInstances` (+ `…Mutations`) | Per-product resources |
| `useProducts`, `useProductCategories`, `useProductMutations` | **Legacy** raw hooks still used by leads, proposals, deals and categories |
| `CatalogProductsView`, `ProductDetailsView`, `ItemTypesView`, `ItemTypeWizard`, `UnitsView`, `InstancesView`, `ProductFormDrawer` | Screens composed by `pages/products` |
| `CatalogSetupGuide` | "Add item types first" card, shown while no active type of a kind exists |
| `getProductKind`, `flattenCatalogResponse`, category tree helpers, `CAPABILITY_REGISTRY` | Pure helpers |

## Endpoints (exactly as the collection)

| Resource | Calls |
|---|---|
| Products | `GET /api/tenant/product/data`, `GET …/info/{id}`, `POST …/create` (multipart `products[i][field]`, units `products[i][units][j][field]`), `POST …/update/{id}` (multipart, flat) |
| Item types | `GET/POST …/product/item-types`, `GET/PUT/DELETE …/item-types/{id}` |
| Units | `GET/POST …/product/units`, `PUT/DELETE …/units/{id}` |
| Product units | `GET/POST …/products/{id}/units`, `PUT/DELETE …/product-units/{id}` |
| Relations | `GET/POST …/products/{id}/relations`, `PUT/DELETE …/product-relations/{id}` |
| Instances | `GET …/product-instances`, `POST …/products/{id}/instances` (`{ instances: [...] }`), `PUT …/product-instances/{id}`, `POST …/{id}/void`, `POST …/{id}/restore` |

Request builders: `utils/catalogPayloads.js` (multipart, booleans as 1/0, JSON fields as strings, blanks never sent)
and `utils/catalogForms.js` (form ⇄ body, validation). Both tested.

## Overview, details and completeness

*2026-10-15 00:56 (Africa/Cairo)*:
- [`overview/`](overview/README.md): `/products/overview` (first in the sub-sidebar). Totals and value, a block for products
  and one for services (count, value, stock value, top categories, top item types, completeness), and an alert when
  there is no item type. The stat tiles were removed from the lists.
- [`product-details/`](product-details/README.md): the details page (bigger image, back to the list), the quick drawer
  (icon next to the name, DataTable `onOpenRowDrawer`), completeness (6 checks), and the guided completion
  `/products/:id/complete`.
- The products and services lists show every field as a column, plus completeness and what is missing.

## Create wizard (`/products/new`, `?kind=service`)

*2026-10-15 00:44 (Africa/Cairo)*: everything now lives in [`product-create/`](product-create/README.md) (full guide in Arabic): steps follow
the item type (all steps without one), tutorial panel, quick add mode with a side list, quick item type / category
dialogs, drafts (`?draft=`), category path details. The paragraph below is the original 2026-10-07 description.

Added 2026-10-07. Steps: basic data & item type → stock & units → capabilities (+ additional data) → attached items
→ pieces → review. Saving runs `POST /product/create` (with alternative units) → `POST /products/{id}/relations` per
attached item → `POST /products/{id}/instances`. What succeeded is remembered, so a retry continues from the failed
request and never creates the product twice. Units (`UnitFormDialog`) can be created inside the wizard; "new item
type" opens the item type wizard page, which returns with `?item_type=<id>` (see below). The selected item type is read with `GET /item-types/{id}`
(the list may not carry capability configs). Services send no stock; serial / unit types send no stock quantity
(stock = available pieces, backend D3). Logic: `utils/productCreateWizard.js` (tested); UI: `components/create/`.
Edit stays in `ProductFormDrawer`.

## Item type wizard (`/products/item-types/new`, `/products/item-types/:id`)

*2026-10-14 23:53 (Africa/Cairo)* — replaces `ItemTypeFormDrawer` / `CapabilitiesEditor` (removed). A full page in stages:
what you sell (product / service; plan / bundle under "other") + **templates** → basic data → capabilities (grouped:
tracking, after-sales, billing, delivery; conflicts such as serial + unique unit are blocked) → **units** (only when
the type is sold in units: product / service without `unique_unit`) → **attached items** → review. Each stage is
validated before moving forward.

- **Tutorial mode** (on by default, toggle in the header, remembered per browser): side panel with what the stage is
  for and the explanation of the field under the pointer / focus (`HelpScope` + `HelpField` in `components/common/HelpTip.jsx`).
  Every field also has an ⓘ tip.
- **Templates** (`constants/itemTypeTemplates.js`, 25): appliances, equipment, medicines, groceries, retail, clothing,
  spare parts, real estate, vehicles, digital; maintenance visit, installation, cleaning, consultation, clinic, tour,
  shipping, course, school year, software project; SaaS, maintenance contract, membership, extended warranty; bundle.
  Picking one fills capabilities, service model, "a sale creates" and suggested units (matched by unit `code`; missing
  ones can be created from the units stage). The gallery can be hidden (remembered). "Start manually" = blank type.
- **Default units** are saved as capability `units` `{ alternatives: [{ unit_id, factor, is_default }] }`, **default
  attached items** as `fulfillment_config.default_relations` (same fields as `POST /products/{id}/relations`); other
  `fulfillment_config` keys are kept. Backend acceptance pending: `docs/backend/BACKEND-REQUESTS.md` **D11**.
  The internal `units` capability is hidden wherever capabilities are listed (`visibleCapabilities`).
- An attached service can be created on the spot (`QuickServiceDialog`: name + price, `POST /product/create`).
- `?kind=` presets the kind, `?returnTo=` (in-app path only) sends the user back with `?item_type=<id>`; otherwise a
  success panel offers "add a product of this type" (`/products/new?item_type=<id>`).
- *2026-10-15 00:08 (Africa/Cairo)*: all of it lives in [`item-type-wizard/`](item-type-wizard/README.md) (page, steps, templates, tutorial,
  setup guide, `itemTypeForm` / `itemTypeWizard` / `typeDefaults` utils, tests) with a full Arabic guide; the rest of
  the feature imports only from `item-type-wizard/index.js`. Copy: `locales/*/catalogSetup.js`.

**Product wizard + type defaults:** `/products/new?item_type=<id>` starts with that type. When a type is chosen, its
default units and attached items fill the product (`applyTypeDefaults`): only empty rows or rows still as filled from
the previous type are replaced, edited rows never are; a notice says what was filled.

**Setup guide:** `CatalogSetupGuide` on the products and services lists (dismissible), the product wizard and the item
types page while there is no active type of that kind: types → units → products, with a button to the wizard.

## Rules

- `kind` replaced `type` (`product | service | plan | bundle`); readers fall back to `type`. `kind` and the base unit
  never change after creation (the update body never sends `kind`).
- The description field is `description` (old `desc` is still read).
- Alternative units are sent with the create request only; afterwards they are managed in the product's Units tab.
- Capabilities come from the item type. A product overrides values with `capability_values` (blank = inherit).
- Instance forms follow the item type: `serial_tracking` → serials (checked against its `pattern`), `unique_unit`
  → building / floor / unit, `batch_lot` / `expiry` → batch + expiry date.
- Item type delete is refused while products use it → the list offers deactivate (`status: false`).
- `/product/data` may still return the old category tree; `flattenCatalogResponse` reads both shapes.

## Extend

- New capability with settings: add it to `constants/capabilityRegistry.js` (fields + `instance` mode if it holds
  instances) and its labels under `catalog.capabilities.<code>` in both locales.
- New screen: component in `components/<area>/`, export it from `index.js`, thin page in `pages/products`, route in
  `pages/products/productRoutes.jsx`, item in `pages/products/constants/productNavigation.js`.

## Known gaps

- Type default units / attached items rely on the backend storing capability `units` and
  `fulfillment_config.default_relations` as sent (D11); until confirmed they may be dropped on save.
- Templates and their labels are frontend constants; there is no template endpoint.

- No backend endpoint lists capabilities with their schema; the registry is the frontend's copy.
- Response shapes are not documented in the collection (no examples); normalizers accept several shapes.
- No product delete endpoint; no hold/reserve endpoint for instances; prices have no currency.
- Instances list is capped at 200 rows per request (no pagination UI yet).
- Not tested against a real server or by eye (RTL/LTR, dark mode); smoke test `pages/products/productRoutes.test.jsx`.
