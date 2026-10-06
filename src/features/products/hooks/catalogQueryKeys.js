/** React Query keys of the catalog. Everything lives under `['products']`, so invalidating that root refreshes all. */
export const catalogKeys = {
  root: ['products'],
  catalog: (params = {}) => ['products', 'catalog', params],
  info: (id) => ['products', 'info', String(id)],
  itemTypes: (params = {}) => ['products', 'item-types', params],
  units: (params = {}) => ['products', 'units', params],
  productUnits: (productId) => ['products', 'product-units', String(productId)],
  relations: (productId) => ['products', 'relations', String(productId)],
  instances: (params = {}) => ['products', 'instances', params],
}
