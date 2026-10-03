/** Request body of pipeline template create / "update + sync" (Postman): stages ordered 1..n, existing ones keep their id. */
export function buildTemplatePayload({ name, type, status, stages = [] }) {
  return {
    name: String(name || '').trim(),
    type: type || 'sales',
    status: status !== false,
    stages: stages.filter((stage) => String(stage.name || '').trim()).map((stage, index) => ({
      ...(stage.id ? { id: stage.id } : {}),
      name: String(stage.name).trim(),
      order: index + 1,
      is_won_stage: Boolean(stage.is_won_stage),
      is_lost_stage: Boolean(stage.is_lost_stage),
      color: stage.color || '#3B82F6',
    })),
  }
}

/** Problems with a stage list (i18n keys under `dealWorkspace.pipelines.errors.*`). */
export function validateStages(stages = []) {
  const named = stages.filter((stage) => String(stage.name || '').trim())
  const errors = []
  if (!named.length) errors.push('noStages')
  if (named.length && named.every((stage) => stage.is_won_stage || stage.is_lost_stage)) errors.push('noOpenStage')
  if (named.filter((stage) => stage.is_won_stage).length > 1) errors.push('manyWon')
  if (named.filter((stage) => stage.is_lost_stage).length > 1) errors.push('manyLost')
  const names = named.map((stage) => String(stage.name).trim().toLowerCase())
  if (new Set(names).size !== names.length) errors.push('duplicateNames')
  return errors
}
