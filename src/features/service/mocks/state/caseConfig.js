import { getCollection, registerSeed } from '../db'
import { DEFAULT_PIPELINE, buildCaseSetup } from '../seeds/caseSetupSeed'
import { buildRecordPipelines } from '../seeds/catalogSeed'
import { buildOperationsSeed } from '../seeds/operationsSeed'

/**
 * Case configuration as the backend would compose it: editable collections
 * (case types, queues, pipelines — changed from settings screens) + static
 * lists. Every handler reads setup through here, so a change in settings is
 * visible everywhere immediately.
 */
export const CASE_PIPELINE_ID = 'pl-case-default'

const L = (ar, en) => ({ ar, en })

registerSeed('pipelines', (manifest) => [
  {
    id: CASE_PIPELINE_ID,
    entity: 'case',
    key: 'case_default',
    label: L('مراحل الطلبات', 'Case pipeline'),
    version: 1,
    version_id: DEFAULT_PIPELINE.version_id,
    statuses: DEFAULT_PIPELINE.statuses,
    transitions: DEFAULT_PIPELINE.transitions,
  },
  ...buildRecordPipelines(manifest),
])
registerSeed('caseTypes', (manifest) =>
  buildCaseSetup(manifest).case_types.map(({ pipeline, ...type }) => ({
    ...type,
    pipeline_id: CASE_PIPELINE_ID,
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

/** Pipeline by id (default: the case pipeline). Shape: { id, version_id, statuses[], transitions[] }. */
export function getPipeline(pipelineId = CASE_PIPELINE_ID) {
  return getCollection('pipelines').find((pipeline) => pipeline.id === pipelineId) || null
}

/** Status ids are unique across pipelines. */
export function findStatus(statusId) {
  for (const pipeline of getCollection('pipelines')) {
    const found = pipeline.statuses.find((status) => status.id === statusId)
    if (found) return found
  }
  return undefined
}

export function getCaseSetup() {
  const staticData = getCollection('caseStatic')[0]
  return {
    ...staticData,
    case_types: getCollection('caseTypes')
      .filter((type) => type.active !== false)
      .map((type) => {
        const pipeline = getPipeline(type.pipeline_id) || getPipeline()
        return { ...type, pipeline_version_id: pipeline.version_id, pipeline: { version_id: pipeline.version_id, statuses: pipeline.statuses, transitions: pipeline.transitions } }
      }),
    queues: getCollection('queues'),
  }
}
