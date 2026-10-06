# features/products — Catalog (products, services, item types, units, instances)

> **Documentation update:** 2026-10-06 23:35 (Africa/Cairo) — README added with the catalog rebuild on the
> Postman collection "Products & Catalog".

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
| `CatalogProductsView`, `ProductDetailsView`, `ItemTypesView`, `UnitsView`, `InstancesView`, `ProductFormDrawer` | Screens composed by `pages/products` |
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

- No backend endpoint lists capabilities with their schema; the registry is the frontend's copy.
- Response shapes are not documented in the collection (no examples); normalizers accept several shapes.
- No product delete endpoint; no hold/reserve endpoint for instances; prices have no currency.
- Instances list is capped at 200 rows per request (no pagination UI yet).
- Not tested against a real server or by eye (RTL/LTR, dark mode); smoke test `pages/products/productRoutes.test.jsx`.
