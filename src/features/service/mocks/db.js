import { DEFAULT_MOCK_TEMPLATE, MOCK_TEMPLATE_KEYS, buildTemplateManifest } from './templates'

/**
 * In-memory mock database.
 *
 * - State lives in memory and resets on reload (keeps mocks predictable).
 * - Only the selected industry template is persisted (localStorage), so a
 *   developer keeps previewing the same industry across reloads.
 * - Each sub-module registers its own seed with `registerSeed` and reads its
 *   collection with `getCollection`; switching template reseeds everything.
 */
const TEMPLATE_STORAGE_KEY = 'ican-service-mock-template'

const seeds = new Map()
let state = null

function readStoredTemplate() {
  try {
    const stored = globalThis.localStorage?.getItem(TEMPLATE_STORAGE_KEY)
    return MOCK_TEMPLATE_KEYS.includes(stored) ? stored : DEFAULT_MOCK_TEMPLATE
  } catch {
    return DEFAULT_MOCK_TEMPLATE
  }
}

function buildState(templateKey) {
  const manifest = buildTemplateManifest(templateKey)
  const collections = {}
  seeds.forEach((seed, name) => {
    collections[name] = seed(manifest)
  })
  return { templateKey: manifest.template, manifest, collections }
}

function ensureState() {
  if (!state) state = buildState(readStoredTemplate())
  return state
}

/**
 * @param {string} name - Collection name, e.g. 'cases'.
 * @param {(manifest: object) => unknown[]} seed
 */
export function registerSeed(name, seed) {
  seeds.set(name, seed)
  if (state) state.collections[name] = seed(state.manifest)
}

/** @param {string} name */
export function getCollection(name) {
  const current = ensureState()
  if (!current.collections[name]) current.collections[name] = []
  return current.collections[name]
}

export function getMockManifest() {
  return ensureState().manifest
}

export function getActiveMockTemplate() {
  return ensureState().templateKey
}

/** @param {string} templateKey */
export function setActiveMockTemplate(templateKey) {
  try {
    globalThis.localStorage?.setItem(TEMPLATE_STORAGE_KEY, templateKey)
  } catch {
    // Storage unavailable (private mode): keep the choice in memory only.
  }
  state = buildState(templateKey)
  return state.templateKey
}

export function resetMockDb() {
  state = null
}
