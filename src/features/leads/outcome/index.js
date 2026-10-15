// Winning / losing a lead from the Leads Center (2026-10-15). See README.md.
export { leadOutcomeApi } from './api/leadOutcomeApi'
export { useLeadOutcome } from './hooks/useLeadOutcome'
export { LeadLostDialog } from './components/LeadLostDialog'
export { LeadWonDialog } from './components/LeadWonDialog'
export { useLeadActionDialogs } from './useLeadActionDialogs'
export { DIRECT_WON_PAYMENT_TYPES, buildLostPayload, leadIdOf, linesFromInterests } from './utils/leadOutcome'
