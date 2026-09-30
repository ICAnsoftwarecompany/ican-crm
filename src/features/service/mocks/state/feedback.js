import { getCollection, registerSeed } from '../db'
import { buildFeedbackResponses } from '../seeds/feedbackSeed'
import { buildSurveyResponses } from '../seeds/qualitySeed'

// CSAT per case (F2) + NPS / CES per customer (F6).
registerSeed('feedbackResponses', (manifest) => [...buildFeedbackResponses(manifest), ...buildSurveyResponses(manifest)])

/** Latest CSAT response for a case (`case.csat` in the case payload), or null. */
export function findCaseCsat(caseId) {
  const response = getCollection('feedbackResponses')
    .filter((entry) => entry.case_id === caseId && (entry.survey || 'csat') === 'csat')
    .sort((a, b) => String(b.responded_at).localeCompare(String(a.responded_at)))[0]
  return response ? { score: response.score, comment: response.comment, responded_at: response.responded_at } : null
}
