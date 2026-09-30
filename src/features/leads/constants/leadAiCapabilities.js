/**
 * What AI may do in the Leads Center (added 2026-10-01). Ids only; labels live at
 * `customers.ai.capabilities.<id>.label|description`. Consumed by the shared AiSetupPage on
 * /LeadsCenter/ai. Running these capabilities belongs to the future features/ai domain.
 */
export const LEAD_AI_CAPABILITIES = [
  'scoreLeads',
  'summarizeLead',
  'suggestNextAction',
  'smartAssignment',
  'draftFollowUp',
  'detectDuplicates',
]
