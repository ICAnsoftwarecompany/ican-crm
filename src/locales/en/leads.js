export default {
  "title": "Leads",
  "newLead": "New Lead",
  "noLeads": "No leads found",
  "noLeadsDesc": "Start by adding a new lead",
  "name": "Name",
  "phone": "Phone",
  "source": "Source",
  "assignedTo": "Assigned To",
  "createdAt": "Created At",
  "tableView": "Table View",
  "kanbanView": "Kanban View",
  "created": "Lead created successfully",
  "interestDialog": {
    "bulkDescription": "Add the same interest to {{count}} selected customers",
    "followUpHint": "Link the follow-up to a product, service, plan or bundle from the catalog",
    "bulkAdded": "Interest added to {{count}} customers",
    "bulkPartial": "Added to {{saved}}, failed for {{failed}}",
    "customersCount": "{{count}} selected customers",
    "skippedNoLead": "{{count}} selected have no lead and will be skipped",
    "bulkButton": "Add interest",
    "contextAction": "Add interest (product or service)",
    "addTitle": "Add interest",
    "editTitle": "Edit interest",
    "pickDescription": "Customer: {{name}} — choose the product or service they are interested in",
    "detailsDescription": "Customer: {{name}} — set the interest details",
    "submit": "Add interest",
    "save": "Save changes",
    "added": "Interest added",
    "updated": "Interest updated",
    "addFailed": "Could not add the interest",
    "updateFailed": "Could not update the interest",
    "noLead": "This customer has no lead, so an interest cannot be added",
    "changeProduct": "Change",
    "openProduct": "Open item page",
    "backToDetails": "Back to details",
    "noTypeHint": "This item has no item type, so only the basic fields show. Give it a type on the products page to get its own fields.",
    "serialHint": "This item has serial numbers: the serial is chosen at sale or delivery, not in the interest.",
    "kinds": {
      "all": "All",
      "product": "Products",
      "service": "Services",
      "plan": "Plans & subscriptions",
      "bundle": "Bundles"
    },
    "picker": {
      "kindsLabel": "Item kind",
      "typesLabel": "Item types",
      "search": "Search by name, code or category",
      "allTypes": "All types",
      "noType": "No type",
      "noResults": "No items match this search",
      "loadFailed": "Could not load products and services",
      "retry": "Retry",
      "emptyCatalog": "No products or services yet",
      "emptyCatalogHint": "Add what you sell first, then record the customer's interest.",
      "addToCatalog": "Add a product or service"
    },
    "fields": {
      "unit": "Unit",
      "baseUnit": "Base unit",
      "quantity": "Quantity",
      "serviceQuantity": "Count (times / visits / hours)",
      "participants": "Number of people",
      "participantsRange": "From {{min}} to {{max}}",
      "preferredDate": "Preferred date",
      "level": "Interest level",
      "note": "Note",
      "notePlaceholder": "Write a note about the customer's interest"
    },
    "units": {
      "title": "Units the customer is interested in",
      "hint": "{{available}} of {{total}} available. Pick one or more, or leave empty.",
      "holdHint": "Temporary hold: {{count}} days.",
      "empty": "No units recorded for this item yet",
      "loadFailed": "Could not load the units"
    },
    "relations": {
      "included": "Comes with it",
      "optional": "Add-ons the customer may want",
      "free": "Free"
    },
    "estimate": {
      "label": "Expected value",
      "unknown": "Not set"
    },
    "facts": {
      "warranty": "{{count}}-month warranty",
      "recurrence": "Renews every {{every}} {{unit}}",
      "perCycle": "/ {{unit}}",
      "perPerson": "Priced per person",
      "installments": "Installments available",
      "creates": "A sale creates: {{value}}"
    },
    "cycle": {
      "day": "day",
      "week": "week",
      "month": "month",
      "year": "year"
    },
    "errors": {
      "chooseProduct": "Choose the product or service first",
      "quantity": "Quantity must be more than zero",
      "participants": "Number of people must be 1 or more",
      "participantsMin": "At least {{min}}",
      "participantsMax": "At most {{max}}"
    },
    "chips": {
      "quantity": "Qty: {{value}}",
      "units": "Units chosen: {{count}}",
      "date": "Date: {{value}}",
      "participants": "People: {{count}}",
      "addOns": "Add-ons: {{count}}",
      "value": "Value: {{value}}"
    }
  },
  "interestView": {
    "itemsCount": "{{count}} items",
    "levels": {
      "high": "High interest",
      "medium": "Medium interest",
      "low": "Low interest"
    },
    "perPerson": "per person",
    "productNumber": "Item #{{id}}",
    "main": "Main",
    "deal": "Deal",
    "lost": "Lost",
    "noType": "No item type",
    "notInCatalog": "Not in the catalog now",
    "noItems": "No items",
    "sources": {
      "manual": "Manual",
      "form": "Form",
      "ad": "Ad",
      "campaign": "Campaign"
    }
  }
}
