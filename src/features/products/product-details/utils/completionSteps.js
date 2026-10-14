/**
 * Steps of the "complete the data" guide (`/products/:id/complete`), 2026-10-15. Pure, tested.
 * One step per missing item (see productCompleteness), then — when an item type was just chosen and it has
 * capabilities — its capability fields, then the review.
 */
import { visibleCapabilities } from '../../constants/capabilityRegistry'

export function getCompletionSteps(missing = [], { chosenItemType = null } = {}) {
  const steps = [...missing]
  if (missing.includes('itemType') && visibleCapabilities(chosenItemType?.capabilities).length) {
    steps.splice(steps.indexOf('itemType') + 1, 0, 'capabilities')
  }
  return [...steps, 'review']
}

/** Error key of a step, or null when it can be left (every step except name and price is optional to fill). */
export function validateCompletionStep(step, form) {
  if (step === 'name' && !String(form.name || '').trim()) return 'nameRequired'
  if (step === 'price' && (form.price === '' || !(Number(form.price) >= 0))) return 'invalidNumber'
  return null
}
