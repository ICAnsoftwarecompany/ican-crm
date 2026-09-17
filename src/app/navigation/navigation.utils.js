// Pure helpers over navigationConfig. No React, no i18n, no store access here —
// that keeps this file trivially testable and reusable from both Sidebar and
// Header (see useNavigation.js for the hook that wires stores in).

/**
 * Patterns ending in "/*" match that prefix and anything nested under it.
 * Anything else must match the pathname exactly.
 */
function matchesPattern(pathname, pattern) {
  if (!pattern) return false

  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2)
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  return pathname === pattern
}

/** @param {import('./navigation.config').NavigationItem} item */
export function getItemActivePatterns(item) {
  if (item.activePatterns?.length) return item.activePatterns
  return item.end ? [item.path] : [item.path, `${item.path}/*`]
}

/**
 * A pattern match "score" so that when two items could both match a path
 * (e.g. a section-level `/settings/*` and nothing more specific), the most
 * specific one wins. Exact matches always beat prefix matches; among prefix
 * matches, the longer base path wins.
 */
function scorePatternMatch(pathname, pattern) {
  if (!matchesPattern(pathname, pattern)) return -1
  if (!pattern.endsWith('/*')) return Number.POSITIVE_INFINITY
  return pattern.length
}

export function isNavigationItemActive(item, pathname) {
  return getItemActivePatterns(item).some((pattern) => matchesPattern(pathname, pattern))
}

/**
 * Walks every item in every section and returns the single best match for
 * the given pathname, plus the section it belongs to. Returns nulls when
 * nothing matches (e.g. a 404 page).
 */
export function resolveActiveNavigation(sections, pathname) {
  let bestItem = null
  let bestSection = null
  let bestScore = -1

  sections.forEach((section) => {
    section.items.forEach((item) => {
      const score = Math.max(...getItemActivePatterns(item).map((pattern) => scorePatternMatch(pathname, pattern)))
      if (score > bestScore) {
        bestScore = score
        bestItem = item
        bestSection = section
      }
    })
  })

  return { activeItem: bestItem, activeSection: bestSection }
}

export function findNavigationItemByPath(sections, pathname) {
  return resolveActiveNavigation(sections, pathname).activeItem
}

/**
 * Tenant module gating. `enabledModules` is `null`/`undefined` until a real
 * tenant-modules API exists — in that case nothing is hidden, since the
 * frontend must never fabricate a restriction the backend doesn't enforce.
 */
export function isModuleEnabled(moduleId, enabledModules) {
  if (!moduleId) return true
  if (!Array.isArray(enabledModules)) return true
  return enabledModules.includes(moduleId)
}

/**
 * Permission gating. `userPermissions` is `null`/`undefined` until the
 * backend exposes a permissions list on the authenticated user — in that
 * case nothing is hidden. Sidebar visibility is UX only; real access control
 * is always enforced by the backend/route layer, never here.
 */
export function hasNavigationPermission(permissionKey, userPermissions) {
  if (!permissionKey) return true
  if (!Array.isArray(userPermissions)) return true
  return userPermissions.includes(permissionKey)
}

/** No feature-flag system exists yet; this is a pass-through placeholder. */
export function isFeatureFlagEnabled(_flagKey, _flags) {
  return true
}

function isItemVisible(item, context) {
  if (item.hidden) return false
  if (!isModuleEnabled(item.module, context.enabledModules)) return false
  if (!hasNavigationPermission(item.permission, context.userPermissions)) return false
  if (!isFeatureFlagEnabled(item.featureFlag, context.featureFlags)) return false
  return true
}

/**
 * The full filtering pipeline: module -> permission -> feature flag -> drop
 * now-empty sections. Sections themselves can also carry a `module`, which
 * gates every item inside them at once.
 */
export function getVisibleNavigation(sections, context = {}) {
  return sections
    .filter((section) => isModuleEnabled(section.module, context.enabledModules))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isItemVisible(item, context)),
    }))
    .filter((section) => section.items.length > 0)
}
