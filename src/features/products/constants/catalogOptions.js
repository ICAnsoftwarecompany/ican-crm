/**
 * Enumerations of the catalog (2026-10-06). Values are backend values; labels come from
 * `catalog.options.<group>.<value>` in the locales (unknown backend values fall back to the raw value).
 */

/** Item kind (spec §25.3). `kind` cannot change after a product is created. */
export const PRODUCT_KINDS = ['product', 'service', 'plan', 'bundle']

/** Service model presets (spec §26). The code reads capabilities, never the letter. */
export const SERVICE_MODELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/** What fulfilling a sale creates (spec §25.9 `fulfillment_config.creates`). */
export const FULFILLMENT_CREATES = ['none', 'asset', 'subscription', 'booking', 'enrollment', 'shipment', 'project', 'order', 'work_order']

/** Unit-of-measure types (the collection uses `count`). */
export const UNIT_TYPES = ['count', 'weight', 'volume', 'length', 'area', 'time']

export const RELATION_INCLUSIONS = ['included', 'optional']

/** Instance availability (spec §25.12 / §29.8). */
export const AVAILABILITY_STATUSES = ['available', 'reserved', 'sold']

export const EXPIRING_WITHIN_DAYS = [7, 30, 60, 90]

/** Category type used to filter the category tree for a kind (plans and bundles share product categories). */
export function categoryTypeForKind(kind) {
  return kind === 'service' ? 'service' : 'product'
}
