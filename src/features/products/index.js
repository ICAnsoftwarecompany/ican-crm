// Public surface of the products feature (added 2026-10-03 for the deals workspace). Older consumers still
// import internal paths; new cross-feature code imports from here.
export { useProducts, useProductCategories } from './hooks/useProducts'
export { flattenCatalog } from './reports/productsReportModel'
