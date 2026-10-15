/**
 * i18n key of a piece of step copy (2026-10-15). Services have their own wording for every step
 * (`productSetup.service.steps.<step>.*`); products use `catalog.create.steps.<step>.{title,hint,description}` and
 * `productSetup.steps.<step>.{manual,withType,guide}`.
 */
const PRODUCT_CATALOG_PARTS = ['title', 'hint', 'description']

export function stepKey(kind, step, part) {
  if (kind === 'service') return `productSetup.service.steps.${step}.${part}`
  return PRODUCT_CATALOG_PARTS.includes(part) ? `catalog.create.steps.${step}.${part}` : `productSetup.steps.${step}.${part}`
}
