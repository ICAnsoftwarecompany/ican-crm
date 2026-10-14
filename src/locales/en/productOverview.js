// Products & Services overview page /products/overview (added 2026-10-15).
export default {
  title: 'Overview',
  description: 'Your products and services at a glance: how many, what they are worth, where they are and how complete their data is.',
  loadFailed: 'Could not load the overview.',
  none: 'Not set',
  empty: { title: 'Nothing in the catalog yet', description: 'Add item types, then your first products and services.' },
  alerts: {
    noTypes: {
      product: 'There are no product item types yet, so products are added without capabilities, units or pieces.',
      service: 'There are no service types yet, so services are added without booking, visits or participants.',
    },
    addType: { product: 'Add a product type', service: 'Add a service type' },
  },
  total: {
    count: 'Products and services',
    listValue: 'Catalog value',
    listValueHint: 'Sum of prices',
    products: 'Products',
    services: 'Services',
  },
  section: {
    title: { product: 'Products', service: 'Services' },
    openList: { product: 'Open products', service: 'Open services' },
    count: { product: 'Products (incl. plans and bundles)', service: 'Services' },
    activeHint: '{{count}} active',
    listValue: 'Value (sum of prices)',
    averagePrice: 'Average price {{value}}',
    stockValue: 'Stock value',
    itemTypesHint: '{{count}} product type(s)',
    itemTypes: 'Service types',
    withoutType: '{{count}} without a type',
    completeness: 'Average completeness',
    incomplete: '{{count}} need data',
  },
  charts: {
    topCategories: 'Categories with the most items',
    topItemTypes: 'Item types with the most items',
    completeness: 'Data completeness',
    itemsLabel: { product: 'Products', service: 'Services' },
    empty: 'No data yet.',
  },
  levels: { complete: 'Complete', good: 'Almost complete', low: 'Needs data' },
}
