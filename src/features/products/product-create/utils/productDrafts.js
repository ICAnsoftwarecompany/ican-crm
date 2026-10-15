/**
 * Drafts of the "new product / service" wizard (2026-10-15). Pure, tested; stored by `hooks/useProductDrafts.js`.
 *
 * A draft is created when the user leaves to build an item type on its own page, or clicks "save as draft", and is
 * updated while that wizard stays open. The image file cannot be stored (it is dropped); everything else is kept.
 * `{ id, kind, step, updatedAt, form, additionalRows, relations, instances }`.
 */
export const DRAFT_LIMIT = 20

export function newDraftId(now = Date.now()) {
  return `d${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Draft from the wizard state (no image, no File objects). */
export function toDraft({ id, kind, step, form, additionalRows = [], relations = [], instances = null }, now = Date.now()) {
  const { image, ...rest } = form || {}
  return { id, kind, step, updatedAt: new Date(now).toISOString(), hadImage: Boolean(image), form: rest, additionalRows, relations, instances }
}

/** Adds or replaces a draft, newest first, keeping at most DRAFT_LIMIT. */
export function upsertDraft(list = [], draft) {
  return [draft, ...list.filter((item) => item.id !== draft.id)].slice(0, DRAFT_LIMIT)
}

export function removeDraft(list = [], id) {
  return list.filter((item) => item.id !== id)
}

/** Drafts of this wizard: same kind (product, service, plan or bundle; drafts without a kind are products). */
export function draftsForKind(list = [], kind = 'product') {
  return list.filter((item) => (item.kind || 'product') === kind)
}
