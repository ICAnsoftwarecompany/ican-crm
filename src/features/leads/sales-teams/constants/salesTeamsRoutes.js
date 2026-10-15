/** Routes of the sales teams area (own sub-sidebar since 2026-10-16). Base kept at /LeadsCenter/teams. */
export const SALES_TEAMS_BASE = '/LeadsCenter/teams'

export const SALES_TEAMS_ROUTES = {
  teams: SALES_TEAMS_BASE,
  rules: `${SALES_TEAMS_BASE}/rules`,
  newRule: `${SALES_TEAMS_BASE}/rules/new`,
  editRule: (ruleId) => `${SALES_TEAMS_BASE}/rules/${encodeURIComponent(ruleId)}/edit`,
  reports: `${SALES_TEAMS_BASE}/reports`,
}

/** New rule pre-filled with a team (from a team card). */
export const newRuleForTeam = (teamId) => `${SALES_TEAMS_ROUTES.newRule}?team=${encodeURIComponent(teamId)}`
