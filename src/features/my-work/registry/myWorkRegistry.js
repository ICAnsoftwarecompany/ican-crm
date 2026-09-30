import { MY_WORK_FOCUS } from '../constants/myWorkFocus'

/**
 * Section registry for the "My Work" page. Each domain contributes a section by registering it
 * (see ../config/registerBuiltinSections.js) — the page never hardcodes what it shows.
 *
 * @typedef {Object} MyWorkSection
 * @property {string} id - Unique, stable id.
 * @property {number} order - Lower renders first.
 * @property {string[]} focuses - Focuses it belongs to ('sales', 'service'). Shown in 'all' always.
 * @property {string} [module] - Tenant module id gating it ('sales', 'customer_service'). Undefined = core.
 * @property {'wide'|'normal'} [size] - 'wide' spans the full row on large screens.
 * @property {React.ComponentType} component - Renders the whole section (card included).
 */

const sections = new Map()

export function registerMyWorkSection(section) {
  if (!section?.id || !section.component) throw new Error('A My Work section needs an id and a component')
  if (!Array.isArray(section.focuses) || section.focuses.length === 0) {
    throw new Error(`My Work section "${section.id}" needs at least one focus`)
  }
  sections.set(section.id, { size: 'normal', order: 100, ...section })
}

export function unregisterMyWorkSection(id) {
  sections.delete(id)
}

/**
 * Module gating mirrors app navigation: while the backend does not send `user.modules`
 * (not an array), nothing is hidden — the frontend never invents a restriction.
 */
export function isSectionModuleEnabled(section, enabledModules) {
  if (!section.module) return true
  if (!Array.isArray(enabledModules)) return true
  return enabledModules.includes(section.module)
}

/** Sections to render for a focus, sorted by `order`. */
export function getMyWorkSections({ focus = MY_WORK_FOCUS.all, enabledModules } = {}) {
  return [...sections.values()]
    .filter((section) => focus === MY_WORK_FOCUS.all || section.focuses.includes(focus))
    .filter((section) => isSectionModuleEnabled(section, enabledModules))
    .sort((left, right) => left.order - right.order)
}

export function getAllMyWorkSectionIds() {
  return [...sections.keys()]
}
