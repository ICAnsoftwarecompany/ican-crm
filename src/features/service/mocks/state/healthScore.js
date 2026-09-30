/**
 * Customer health / churn score (spec §45.2 "Health / Churn Score"): 0–100 from service signals. Each factor adds or
 * removes points and is returned so the UI can explain the score. Bands: healthy ≥ 70, watch 40–69, at_risk < 40.
 */
export const HEALTH_BANDS = ['healthy', 'watch', 'at_risk']
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)))

/**
 * @param {{ openCases:number, negativeSignals:number, csatAverage:number|null, lastNps:number|null,
 *   overdueLines:number, subscriptionTrouble:boolean, activity90d:number, followUpIssues:number }} input
 */
export function healthScore(input) {
  const factors = []
  const add = (key, impact, value) => {
    if (impact) factors.push({ key, impact: Math.round(impact), value })
  }
  add('open_cases', -Math.min(20, input.openCases * 6), input.openCases)
  add('negative_sentiment', -Math.min(15, input.negativeSignals * 5), input.negativeSignals)
  if (input.csatAverage != null) add('csat', (input.csatAverage - 3) * 8, input.csatAverage)
  if (input.lastNps != null) add('nps', input.lastNps >= 9 ? 10 : input.lastNps <= 6 ? -15 : 0, input.lastNps)
  add('overdue_payments', -Math.min(25, input.overdueLines * 10), input.overdueLines)
  add('subscription', input.subscriptionTrouble ? -15 : 0, input.subscriptionTrouble)
  add('activity', input.activity90d === 0 ? -10 : Math.min(8, input.activity90d * 2), input.activity90d)
  add('follow_up_issues', -Math.min(10, input.followUpIssues * 5), input.followUpIssues)
  const score = clamp(75 + factors.reduce((sum, factor) => sum + factor.impact, 0))
  const band = score >= 70 ? 'healthy' : score >= 40 ? 'watch' : 'at_risk'
  return { score, band, factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)) }
}
