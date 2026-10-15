import { SalesTeamsWorkspace } from '../../../features/leads'

/**
 * /LeadsCenter/assignments — the same workspace as /LeadsCenter/teams, opened on the distribution rules tab
 * (route kept; the old name + active form was replaced 2026-10-15).
 */
export function CustomerAssignmentsPage() {
  return <SalesTeamsWorkspace initialTab="rules" />
}
