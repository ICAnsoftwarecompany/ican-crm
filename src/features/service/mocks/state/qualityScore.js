/**
 * Quality & feedback math (spec §42): weighted checklist scores, NPS and CES summaries. Pure, shared by handlers.
 */
export const MAX_CRITERION_SCORE = 5

/** Weighted percent (0–100) from { criterionKey: 0..5 }. Criteria weights must add up to 100. */
export function weightedScore(criteria = [], scores = {}) {
  const total = criteria.reduce((sum, criterion) => sum + (Number(scores[criterion.key]) / MAX_CRITERION_SCORE) * Number(criterion.weight || 0), 0)
  return Math.round(total)
}

export const weightsValid = (criteria = []) => criteria.length > 0 && criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0) === 100

/** NPS = % promoters (9–10) − % detractors (0–6). */
export function npsSummary(responses) {
  const count = responses.length
  const promoters = responses.filter((entry) => entry.score >= 9).length
  const detractors = responses.filter((entry) => entry.score <= 6).length
  return {
    count,
    score: count ? Math.round(((promoters - detractors) / count) * 100) : null,
    promoters,
    passives: count - promoters - detractors,
    detractors,
    distribution: Array.from({ length: 11 }, (_, score) => ({ score, count: responses.filter((entry) => entry.score === score).length })),
  }
}

/** CES on 1 (very hard) … 7 (very easy): average and % that found it easy (5–7). */
export function cesSummary(responses) {
  const count = responses.length
  return {
    count,
    average: count ? Math.round((responses.reduce((sum, entry) => sum + entry.score, 0) / count) * 10) / 10 : null,
    easy_percent: count ? Math.round((responses.filter((entry) => entry.score >= 5).length / count) * 100) : null,
    distribution: [1, 2, 3, 4, 5, 6, 7].map((score) => ({ score, count: responses.filter((entry) => entry.score === score).length })),
  }
}

export const SCALES = { csat: [1, 5], nps: [0, 10], ces: [1, 7] }
/** Low score = the answer that should trigger a follow-up (spec §42.1). */
export const isLowScore = (type, score) => (type === 'nps' ? score <= 6 : type === 'ces' ? score <= 3 : score <= 2)
