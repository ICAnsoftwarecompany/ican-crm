import { getCollection, registerSeed } from '../db'
import { buildFeedbackResponses } from '../seeds/feedbackSeed'

registerSeed('feedbackResponses', buildFeedbackResponses)

/** Latest CSAT response for a case (`case.csat` in the case payload), or null. */
export function findCaseCsat(caseId) {
  const response = getCollection('feedbackResponses')
    .filter((entry) => entry.case_id === caseId)
    .sort((a, b) => String(b.responded_at).localeCompare(String(a.responded_at)))[0]
  return response ? { score: response.score, comment: response.comment, responded_at: response.responded_at } : null
}
