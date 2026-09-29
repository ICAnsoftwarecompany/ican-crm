import { getCollection, registerSeed } from '../db'
import { DEFAULT_PIPELINE, buildCaseSetup } from '../seeds/caseSetupSeed'
import { buildOperationsSeed } from '../seeds/operationsSeed'

/**
 * Case configuration as the backend would compose it: editable collections
 * (case types, queues — changed from settings screens) + the pipeline and
 * static lists. Every handler reads setup through here, so a change in
 * settings is visible everywhere immediately.
 */
registerSeed('caseTypes', (manifest) =>
  buildCaseSetup(manifest).case_types.map(({ pipeline, ...type }) => ({
    ...type,
    pipeline_version_id: pipeline.version_id,
    default_queue_id: null,
    sla_policy_id: null,
    active: true,
  }))
)
registerSeed('queues', (manifest) =>
  buildCaseSetup(manifest).queues.map((queue) => ({ ...queue, assignment_strategy: 'round_robin', agent_ids: [] }))
)
registerSeed('caseStatic', (manifest) => {
  const { agents, resolution_codes: resolutionCodes, priorities, severities, channels } = buildCaseSetup(manifest)
  return [{ agents, resolution_codes: resolutionCodes, priorities, severities, channels }]
})
registerSeed('slaPolicies', (manifest) => buildOperationsSeed(manifest).slaPolicies)
registerSeed('businessCalendars', (manifest) => buildOperationsSeed(manifest).businessCalendars)
registerSeed('escalationRules', (manifest) => buildOperationsSeed(manifest).escalationRules)

export function getPipeline() {
  return DEFAULT_PIPELINE
}

export function findStatus(statusId) {
  return DEFAULT_PIPELINE.statuses.find((status) => status.id === statusId)
}

export function getCaseSetup() {
  const staticData = getCollection('caseStatic')[0]
  return {
    ...staticData,
    case_types: getCollection('caseTypes')
      .filter((type) => type.active !== false)
      .map((type) => ({ ...type, pipeline: DEFAULT_PIPELINE })),
    queues: getCollection('queues'),
  }
}
