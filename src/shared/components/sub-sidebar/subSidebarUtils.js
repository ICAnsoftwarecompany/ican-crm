/**
 * Pure helpers for sub-sidebar configs. No React, no i18n — trivially testable.
 *
 * @typedef {Object} SubSidebarItem
 * @property {string} [id] - Stable key. Falls back to `to`.
 * @property {string} to - Route the item links to. Must be an existing route.
 * @property {string} label - Already-translated label (callers pass `t('...')`).
 * @property {React.ComponentType} icon - lucide-react icon.
 * @property {boolean} [end] - Exact-match active state (NavLink `end`).
 * @property {boolean} [disabled] - Rendered but not clickable (e.g. "coming soon").
 * @property {string} [badge] - Short translated badge text ("Soon", a count, ...).
 * @property {boolean} [hidden] - Dropped by getVisibleSubSidebarGroups (permission/plan gating done by the caller).
 *
 * @typedef {Object} SubSidebarGroup
 * @property {string} id
 * @property {string} [label] - Translated group heading. Omit for an unlabeled group.
 * @property {string} [note] - Small translated helper text under the group.
 * @property {boolean} [divider] - Draw a top border above the group.
 * @property {SubSidebarItem[]} items
 */

export function getSubSidebarItemKey(item) {
  return item.id || item.to
}

/** Removes hidden items, then groups left with no items. */
export function getVisibleSubSidebarGroups(groups = []) {
  return groups
    .map((group) => ({ ...group, items: (group.items || []).filter((item) => item && !item.hidden) }))
    .filter((group) => group.items.length > 0)
}

/** Flat list of every visible item — handy for tests and "find current page" logic. */
export function flattenSubSidebarItems(groups = []) {
  return getVisibleSubSidebarGroups(groups).flatMap((group) => group.items)
}
