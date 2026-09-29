# features/service/catalog — Catalog service setup (F3)

Spec §25–26. **No second catalog:** items are the existing Products & Services. This module only edits
their *service configuration* and the tenant's item types. Product fields (name, price, image, category)
stay in `pages/products` with their existing endpoints — nothing there changed.

| Path | Role |
|---|---|
| `api/catalogApi.js` | Registry `GET /catalog/capabilities`, presets `GET /catalog/service-models`, items `GET /catalog/items`, `PATCH /catalog/items/{id} { service_config }`. |
| `utils/capabilities.js` | Pure helpers: filter by kind, toggle with `depends_on`, apply preset, locked codes. Tested. |
| `components/CapabilitiesField.jsx` | Item type editor field: preset picker + capabilities grouped (product/service/shared) with config. |
| `components/CapabilityConfigFields.jsx` | Renders a capability's `config_fields` (number, select, multiselect, switch, text). |
| `components/CatalogItemsPanel.jsx`, `CatalogItemDrawer.jsx` | Settings → Catalog → Products & services: item type, fulfillment (creates, record type, queue, case types, portal), attached services. |

Rules:
- The **capability registry is code-owned by the backend** (contract §25.5); the UI never hardcodes
  which capabilities exist — it renders `config_fields`. Labels: `service.capabilities.<code>.*`.
- **Service models (A–H) are presets only**: picking one pre-selects capabilities; code never branches on the letter.
- `creates` in `booking | enrollment | shipment | project` requires a record type (422 otherwise).
- Item types (`/catalog/item-types`) are a settings resource: `settings/resources/catalogResources.js`.

Service config shape: `{ item_type_id, capability_overrides[], fulfillment: { creates, record_type_id,
default_queue_id, allowed_case_type_ids[], portal_visible }, relations: [{ child_item_id, inclusion:
included|optional, quantity, price_override, auto_add }] }`.
