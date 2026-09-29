import { serviceEndpoints } from '../../core/api/endpoints'
import { getMockManifest, setActiveMockTemplate } from '../db'
import { MockHttpError } from '../errors'
import { MOCK_TEMPLATE_DEFINITIONS, MOCK_TEMPLATE_KEYS, buildTemplateManifest } from '../templates'
import { featuresForModels } from '../templates/modelFeatures'
import { buildCaseSetup } from '../seeds/caseSetupSeed'
import { buildItemTypes, buildRecordTypes } from '../seeds/catalogSeed'
import { buildOperationsSeed } from '../seeds/operationsSeed'

const MODELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/** What applying a template creates (the dry run the wizard previews). */
function preview(key) {
  const manifest = buildTemplateManifest(key)
  return {
    case_types: buildCaseSetup(manifest).case_types.map((type) => type.label),
    queues: buildCaseSetup(manifest).queues.map((queue) => queue.label),
    record_types: buildRecordTypes(manifest).map((type) => type.label),
    item_types: buildItemTypes(manifest).map((type) => type.name),
    sla_policies: buildOperationsSeed(manifest).slaPolicies.map((policy) => policy.name),
  }
}

/** @type {import('../router').MockRoute[]} */
export const setupHandlers = [
  {
    method: 'GET',
    path: serviceEndpoints.setupTemplates,
    handler: () => ({
      data: MOCK_TEMPLATE_KEYS.map((key) => ({ key, models: MOCK_TEMPLATE_DEFINITIONS[key].models, terminology: MOCK_TEMPLATE_DEFINITIONS[key].terminology, preview: preview(key) })),
      meta: { active: getMockManifest().template },
    }),
  },
  {
    method: 'POST',
    path: `${serviceEndpoints.setupTemplates}/:key/apply`,
    handler: ({ params, body = {} }) => {
      if (!MOCK_TEMPLATE_KEYS.includes(params.key)) throw new MockHttpError(404, 'NOT_FOUND', 'Unknown template')
      const models = (body.models || MOCK_TEMPLATE_DEFINITIONS[params.key].models).filter((model) => MODELS.includes(model))
      if (!models.length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { models: ['required'] })
      const result = { template: params.key, models, features: featuresForModels(models), creates: preview(params.key), dry_run: Boolean(body.dry_run) }
      if (body.dry_run) return { data: result }
      // Real backend: seeds tenant configuration idempotently (existing data is kept). Mock: reseed + override.
      setActiveMockTemplate(params.key)
      const manifest = getMockManifest()
      Object.assign(manifest, { models, features: featuresForModels(models), terminology: { ...manifest.terminology, ...(body.terminology || {}) } })
      return { data: result }
    },
  },
]
