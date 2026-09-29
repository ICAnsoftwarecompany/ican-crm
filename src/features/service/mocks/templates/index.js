import { featuresForModels } from './modelFeatures'

/**
 * Industry templates used by the mock backend (dev + demos).
 * Switch the active one from the Service overview page (mock mode only).
 *
 * Terminology values are either term keys (`service.terms.<key>`) or tenant
 * labels `{ ar, en }` — the same two shapes the real backend sends.
 * Add a template: copy one entry, pick models, set terminology, done.
 */
const definitions = {
  devices: {
    models: ['A', 'B', 'C', 'H'],
    terminology: { customer: 'customer', case: 'ticket', record: 'serviceContract', batch: 'visitBatch' },
  },
  tourism: {
    models: ['E'],
    terminology: { customer: 'traveler', case: 'request', record: 'booking', batch: 'tripGroup' },
  },
  school: {
    models: ['D', 'C'],
    terminology: {
      customer: 'guardian',
      case: 'request',
      record: 'enrollment',
      batch: { ar: 'فصل دراسي', en: 'Class' },
    },
  },
  shipping: {
    models: ['F', 'C'],
    terminology: { customer: 'merchant', case: 'ticket', record: 'shipment', batch: 'manifest' },
  },
}

export const MOCK_TEMPLATE_KEYS = Object.keys(definitions)
export const MOCK_TEMPLATE_DEFINITIONS = definitions
export const DEFAULT_MOCK_TEMPLATE = 'devices'

/** @param {string} key */
export function buildTemplateManifest(key) {
  const definition = definitions[key] || definitions[DEFAULT_MOCK_TEMPLATE]
  return {
    template: definitions[key] ? key : DEFAULT_MOCK_TEMPLATE,
    models: definition.models,
    features: featuresForModels(definition.models),
    terminology: definition.terminology,
    permissions: [],
  }
}
