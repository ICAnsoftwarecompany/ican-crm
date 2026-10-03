/**
 * Enum values the deal backend accepts (docs/deals/DEALS-WORKSPACE-SPEC.md §2). Labels live in
 * `dealWorkspace.options.<group>.<value>` — never translate the value itself.
 */
export const DEAL_TYPES = ['sales', 'campaign', 'project']
export const DEAL_STATUSES = ['draft', 'active', 'paused', 'completed', 'cancelled']
export const DEAL_LEAD_STATUSES = ['open', 'won', 'lost']
export const TEAM_ROLES = ['manager', 'sales_rep', 'viewer']
export const LOST_REASONS = ['price', 'competitor', 'no_budget', 'no_response', 'not_interested', 'timing', 'other']
export const PAYMENT_TYPES = ['cash', 'installment', 'installment_no_interest', 'custom_staged']
export const INSTALLMENT_FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'yearly']
export const CONTRACT_STATUSES = ['active', 'completed', 'cancelled', 'draft']
export const INSTALLMENT_STATUSES = ['pending', 'paid', 'partial', 'overdue', 'cancelled']

/** A deal lead with no activity for this many days is "stale" (overview alerts, assistant hints). */
export const STALE_LEAD_DAYS = 7

/** Months added per frequency, used only for the client-side installment PREVIEW. */
export const FREQUENCY_MONTHS = { monthly: 1, quarterly: 3, yearly: 12 }
