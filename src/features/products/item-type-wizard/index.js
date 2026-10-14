// Public surface of the item type wizard (folder created 2026-10-15). Everything else in this folder is internal;
// the rest of features/products and the pages import from here. Full explanation: README.md in this folder.

// Screens
export { ItemTypeWizard } from './ItemTypeWizard'
export { CatalogSetupGuide } from './components/CatalogSetupGuide'
export { QuickItemTypeDialog } from './components/QuickItemTypeDialog'

// Item type → new product defaults (used by the product create wizard)
export { applyTypeDefaults, productRelationsFromType, productUnitsFromType } from './utils/typeDefaults'

// Templates and pure helpers
export { ITEM_TYPE_TEMPLATES, getTemplate, templatesForKind } from './constants/itemTypeTemplates'
export { TYPE_STEPS, getTypeSteps, supportsUnits } from './utils/itemTypeWizard'
export { buildItemTypePayload, itemTypeToForm, validateItemTypeForm } from './utils/itemTypeForm'
