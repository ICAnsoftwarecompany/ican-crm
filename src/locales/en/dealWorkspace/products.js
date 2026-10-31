export default {
  "products": {
    singleSummary: { title: 'Deal product or service', product: 'Single-product deal', service: 'Single-service deal', productImages: 'Product / service images', dealImages: 'Deal images' },
    explorer: {
      moreDetails: 'Additional details', product: 'Product', service: 'Service',
      shortcut: 'Products & services', back: 'All products', interested: 'Interested customers',
      noInterested: 'No recorded interests or negotiation products for this product.',
      partial: 'Could not load data for {{count}} customers. This list is incomplete.',
      empty: 'No matching products', yes: 'Yes', no: 'No',
      fields: { id: 'Product ID', code: 'Code', description: 'Description', kind: 'Type', price: 'Deal price', catalogPrice: 'Catalog price', details: 'Product details in this deal', linkId: 'Association ID', dealId: 'Deal ID', status: 'Active', stock_quantity: 'Stock quantity', is_stock_tracked: 'Stock tracked', category_id: 'Category ID', item_type_id: 'Item type', base_unit_id: 'Base unit', data: 'Additional data', capability_values: 'Capabilities', fulfillment_config: 'Fulfillment settings', created_at: 'Created at', updated_at: 'Updated at' },
    },
    details: { quantity: 'Quantity', unit_price: 'Unit price', discount: 'Discount', package: 'Package', notes: 'Notes' },
    editDetails: 'View and edit deal product', updated: 'Deal product updated', updateFailed: 'Could not update deal product', notFound: 'Deal product not found', invalidDetails: 'Quantity, unit price and discount must be nonnegative numbers',
    "description": "Products and services this deal sells.",
    "attachTitle": "Add products",
    "attachSubmit": "Add {{count}}",
    "attached": "{{count}} products added.",
    "attachFailed": "Could not add the products.",
    "search": "Search products",
    "noCatalog": "No products to add.",
    "remove": "Remove product",
    "removed": "Product removed from the deal.",
    "removeFailed": "Could not remove the product.",
    "removeTitle": "Remove product",
    "removeMessage": "Remove {{name}} from this deal?",
    "emptyTitle": "No products yet",
    "emptyDescription": "Add the products this deal sells; they will be offered first when a lead is won."
  }
}
