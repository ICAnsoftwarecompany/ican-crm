// Public surface of the products feature (catalog rebuilt on the Products & Catalog API, 2026-10-06).
// Pages and other features import from here, never from internal paths.

// Data
export { useProducts, useProductCategories, useProductMutations } from './hooks/useProducts'
export { useCatalogProducts, useProductInfo, useCatalogProductMutations } from './hooks/useCatalogProducts'
export { useItemTypes, useItemTypeMutations, useUnits, useUnitMutations } from './hooks/useCatalogSetup'
export {
  useProductUnits,
  useProductUnitMutations,
  useProductRelations,
  useProductRelationMutations,
  useProductInstances,
  useProductInstanceMutations,
} from './hooks/useProductResources'
export { catalogKeys } from './hooks/catalogQueryKeys'
export { flattenCatalog } from './reports/productsReportModel'

// Pure helpers
export { getProductKind, normalizeCatalogProduct, normalizeItemType, flattenCatalogResponse } from './utils/catalogNormalize'
export {
  countActiveCategoriesTree,
  countCategoriesTree,
  filterCategoryTreeByType,
  flattenCategoryTree,
  getCategoryChildren,
  getCategoryLabel,
} from './utils/categoryTree'
export { PRODUCT_KINDS } from './constants/catalogOptions'
export { CAPABILITY_REGISTRY, instanceModesFor } from './constants/capabilityRegistry'

// Screens (composed by pages/products)
export { CatalogProductsView } from './components/products/CatalogProductsView'
export { ProductFormDrawer } from './components/products/ProductFormDrawer'
export { ProductDetailsView } from './components/details/ProductDetailsView'
export { ItemTypesView } from './components/item-types/ItemTypesView'
export { UnitsView } from './components/units/UnitsView'
export { InstancesView } from './components/instances/InstancesView'

// Shared pieces still used by the category pages
export {
  AdditionalDataFields,
  createEmptyAdditionalRow,
  getAdditionalFieldNames,
  parseAdditionalData,
  serializeAdditionalData,
} from './components/common/AdditionalDataFields'
