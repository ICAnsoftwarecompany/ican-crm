/** Quality vocabulary (spec §42.2). Labels in `service.quality.*`. */
export const ROOT_CAUSES = ['training', 'process', 'product', 'communication', 'system', 'customer']
export const REVIEW_SUBJECTS = ['case', 'follow_up', 'call']
export const SCORE_STEPS = [0, 1, 2, 3, 4, 5]
export const SURVEY_TYPES = ['csat', 'nps', 'ces']
export const SURVEY_EVENTS = ['case.resolved', 'record.completed', 'follow_up.completed', 'periodic']
export const SURVEY_CHANNELS = ['whatsapp', 'portal', 'email']

/** Weighted percent — the server computes the stored total; the drawer previews it live. */
export const previewScore = (criteria = [], scores = {}) => Math.round(criteria.reduce((sum, criterion) => sum + ((Number(scores[criterion.key]) || 0) / 5) * Number(criterion.weight || 0), 0))
export const weightsTotal = (criteria = []) => criteria.reduce((sum, criterion) => sum + (Number(criterion.weight) || 0), 0)
