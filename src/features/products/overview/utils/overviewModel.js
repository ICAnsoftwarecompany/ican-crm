/**
 * Numbers of `/products/overview` (2026-10-15). Pure, tested. Charts use the shared reports engine shapes.
 *
 * "products" = every item that is not a service (product, plan, bundle); "services" = kind service.
 * Values: `listValue` = sum of prices (what the catalog lists); `stockValue` = Σ price × stock for stock-tracked items.
 */
import { countBy } from '../../../../shared/components/reports'
import { productCompleteness } from '../../product-details/utils/productCompleteness'

const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

function summarize(items, { categoryNames, itemTypeNames }) {
  const completeness = items.map((item) => productCompleteness(item))
  const listValue = items.reduce((sum, item) => sum + toNumber(item.price), 0)
  const stockValue = items.reduce((sum, item) => sum + (item.isStockTracked ? toNumber(item.price) * toNumber(item.stockQuantity) : 0), 0)
  const label = (names) => (row) => ({ ...row, label: names.get(row.key) || row.key, colorIndex: row.key === '__other__' ? -1 : undefined })
  return {
    count: items.length,
    active: items.filter((item) => item.status).length,
    listValue,
    stockValue,
    averagePrice: items.length ? Math.round(listValue / items.length) : 0,
    averageCompleteness: items.length ? Math.round(completeness.reduce((sum, item) => sum + item.score, 0) / items.length) : 0,
    incomplete: completeness.filter((item) => item.level !== 'complete').length,
    withoutType: items.filter((item) => !item.itemTypeId).length,
    withoutCategory: items.filter((item) => !item.categoryId).length,
    topCategories: countBy(items, (item) => item.categoryId).map(label(categoryNames)),
    topItemTypes: countBy(items, (item) => item.itemTypeId).map(label(itemTypeNames)),
    completenessLevels: ['complete', 'good', 'low'].map((level, index) => ({ key: level, value: completeness.filter((item) => item.level === level).length, colorIndex: index })),
  }
}

/**
 * `products` = normalized catalog rows; `itemTypes` = normalized item types; `categories` = flattened categories
 * (with `_pathLabel`). Special keys `__none__` / `__other__` are left for the view to translate.
 */
export function buildProductsOverview({ products = [], itemTypes = [], categories = [] } = {}) {
  const categoryNames = new Map(categories.map((category) => [String(category.id), category._pathLabel || category.name]))
  const itemTypeNames = new Map(itemTypes.map((itemType) => [String(itemType.id), itemType.name]))
  const services = products.filter((item) => item.kind === 'service')
  const goods = products.filter((item) => item.kind !== 'service')
  const product = summarize(goods, { categoryNames, itemTypeNames })
  const service = summarize(services, { categoryNames, itemTypeNames })
  const activeTypes = (kind) => itemTypes.filter((itemType) => itemType.status && (kind === 'service' ? itemType.kind === 'service' : itemType.kind !== 'service')).length
  return {
    total: { count: products.length, listValue: product.listValue + service.listValue, stockValue: product.stockValue },
    product: { ...product, itemTypes: activeTypes('product') },
    service: { ...service, itemTypes: activeTypes('service') },
    alerts: {
      noProductTypes: activeTypes('product') === 0,
      noServiceTypes: activeTypes('service') === 0,
    },
  }
}
