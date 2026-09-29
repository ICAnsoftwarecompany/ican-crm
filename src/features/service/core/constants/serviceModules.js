/**
 * Registry of every Customer Service (Service Operations) sub-module.
 *
 * Single source of truth for:
 * - which frontend phase (F0–F7) owns the sub-module,
 * - where its code lives (`features/service/<folder>`),
 * - whether its API is still served by the mock layer (`backend: 'mock'`)
 *   or by the real Laravel backend (`backend: 'live'`).
 *
 * When the backend ships a module: flip `backend` to 'live' here, run the app
 * against the real API, then update docs/4-CUSTOMER-SERVICE.md (phase log).
 * No page or hook changes should be needed — see core/api/serviceHttp.js.
 *
 * @typedef {'planned' | 'in_progress' | 'done'} ServiceModuleStatus
 * @typedef {'mock' | 'live'} ServiceBackendSource
 *
 * @typedef {Object} ServiceModuleDefinition
 * @property {string} key - Stable id, also the mock registry key.
 * @property {string} folder - Folder under src/features/service/.
 * @property {number} phase - Frontend phase (0–7). See SERVICE_PHASES.
 * @property {ServiceModuleStatus} status - Frontend implementation status.
 * @property {ServiceBackendSource} backend - Where the data currently comes from.
 */

/** Frontend phases. Each maps 1:1 to the backend phase with the same number. */
export const SERVICE_PHASES = [
  { id: 0, key: 'foundation', milestone: null },
  { id: 1, key: 'caseCore', milestone: null },
  { id: 2, key: 'operations', milestone: 'mvp1' },
  { id: 3, key: 'serviceContext', milestone: null },
  { id: 4, key: 'billingScheduling', milestone: null },
  { id: 5, key: 'portal', milestone: 'mvp2' },
  { id: 6, key: 'knowledgeQuality', milestone: null },
  { id: 7, key: 'ai', milestone: null },
]

/** @type {ServiceModuleDefinition[]} */
export const SERVICE_MODULES = [
  // F0 — Foundation
  { key: 'capabilities', folder: 'core/capabilities', phase: 0, status: 'done', backend: 'mock' },

  // F1 — Case Core
  { key: 'contacts', folder: 'contacts', phase: 1, status: 'done', backend: 'mock' },
  { key: 'cases', folder: 'cases', phase: 1, status: 'done', backend: 'mock' },
  // Queues ship inside case setup (filter, assign) in F1; queue settings screens come with settings in F2.
  { key: 'queues', folder: 'cases', phase: 1, status: 'done', backend: 'mock' },
  { key: 'myWork', folder: 'my-work', phase: 1, status: 'done', backend: 'mock' },
  // Service tab in the customer drawer; reads cases + contacts, no API of its own.
  { key: 'customer360', folder: 'customer-360', phase: 1, status: 'done', backend: 'mock' },

  // F2 — Service Operations (MVP-1)
  { key: 'sla', folder: 'sla', phase: 2, status: 'done', backend: 'mock' },
  { key: 'replies', folder: 'replies', phase: 2, status: 'done', backend: 'mock' },
  { key: 'knowledge', folder: 'knowledge', phase: 2, status: 'done', backend: 'mock' },
  { key: 'feedback', folder: 'feedback', phase: 2, status: 'done', backend: 'mock' },
  { key: 'reports', folder: 'reports', phase: 2, status: 'done', backend: 'mock' },
  { key: 'settings', folder: 'settings', phase: 2, status: 'done', backend: 'mock' },
  { key: 'savedViews', folder: 'saved-views', phase: 2, status: 'done', backend: 'mock' },

  // F3 — Service Context
  { key: 'catalog', folder: 'catalog', phase: 3, status: 'done', backend: 'mock' },
  { key: 'pipelines', folder: 'pipelines', phase: 3, status: 'done', backend: 'mock' },
  { key: 'records', folder: 'records', phase: 3, status: 'done', backend: 'mock' },
  { key: 'assets', folder: 'assets', phase: 3, status: 'done', backend: 'mock' },
  { key: 'entitlements', folder: 'entitlements', phase: 3, status: 'done', backend: 'mock' },
  { key: 'contracts', folder: 'contracts', phase: 3, status: 'done', backend: 'mock' },
  { key: 'handoffs', folder: 'handoffs', phase: 3, status: 'done', backend: 'mock' },
  { key: 'setup', folder: 'setup', phase: 3, status: 'done', backend: 'mock' },

  // F4 — Billing Lite & Scheduling
  { key: 'billing', folder: 'billing', phase: 4, status: 'planned', backend: 'mock' },
  { key: 'scheduling', folder: 'scheduling', phase: 4, status: 'planned', backend: 'mock' },
  { key: 'workOrders', folder: 'work-orders', phase: 4, status: 'planned', backend: 'mock' },

  // F5 — Portal & Growth (MVP-2)
  { key: 'portal', folder: 'portal', phase: 5, status: 'planned', backend: 'mock' },
  { key: 'imports', folder: 'imports', phase: 5, status: 'planned', backend: 'mock' },
  { key: 'followUps', folder: 'follow-ups', phase: 5, status: 'planned', backend: 'mock' },
  { key: 'portfolios', folder: 'portfolios', phase: 5, status: 'planned', backend: 'mock' },

  // F6 — Knowledge & Quality
  { key: 'quality', folder: 'quality', phase: 6, status: 'planned', backend: 'mock' },
  { key: 'templates', folder: 'templates', phase: 6, status: 'planned', backend: 'mock' },

  // F7 — AI
  { key: 'ai', folder: 'ai', phase: 7, status: 'planned', backend: 'mock' },
]

export const CURRENT_SERVICE_PHASE = 2

/** @param {string} key */
export function getServiceModule(key) {
  return SERVICE_MODULES.find((module) => module.key === key) || null
}

/** @param {number} phaseId */
export function getModulesForPhase(phaseId) {
  return SERVICE_MODULES.filter((module) => module.phase === phaseId)
}
