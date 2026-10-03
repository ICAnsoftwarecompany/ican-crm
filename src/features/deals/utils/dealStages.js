/**
 * Stage helpers. A deal copies its pipeline template's stages when it is created; afterwards the deal's
 * stages are independent. Shape (Postman): `{ id, name, order, color, is_won_stage, is_lost_stage }`.
 */

const sameId = (left, right) => left !== undefined && left !== null && String(left) === String(right)

export function isWonStage(stage) {
  return Boolean(stage?.is_won_stage || stage?.is_terminal_won)
}

export function isLostStage(stage) {
  return Boolean(stage?.is_lost_stage || stage?.is_terminal_lost)
}

export function isTerminalStage(stage) {
  return isWonStage(stage) || isLostStage(stage)
}

/**
 * The deal's own stages first (`deal.stages`), then the embedded template, then the template from the
 * templates list. Sorted by `order`; each stage gets a `label` for the shared PipelineBoard.
 */
export function resolveDealStages(deal, templates = []) {
  const template = deal?.pipeline_template
    || deal?.pipelineTemplate
    || (Array.isArray(templates) ? templates.find((item) => sameId(item?.id, deal?.pipeline_template_id)) : null)
  const source = [deal?.stages, deal?.deal_stages, template?.stages].find((list) => Array.isArray(list) && list.length) || []
  return source
    .slice()
    .sort((left, right) => Number(left?.order ?? 0) - Number(right?.order ?? 0))
    .map((stage) => ({ ...stage, label: stage.label || stage.name || '' }))
}

export function buildStageMap(stages = []) {
  return new Map(stages.map((stage) => [String(stage.id), stage]))
}

export function findWonStage(stages = []) {
  return stages.find(isWonStage) || null
}

export function findLostStage(stages = []) {
  return stages.find(isLostStage) || null
}

/** Stages a lead can be dragged between freely (no won/lost stages). */
export function getOpenStages(stages = []) {
  return stages.filter((stage) => !isTerminalStage(stage))
}
