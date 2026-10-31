import { ExternalLink, PanelRightOpen } from 'lucide-react'
import { buildCustomerRowContextActions } from '../../customers'

export const dealLeadPath = (dealId, dealLeadId) => `/deals/${encodeURIComponent(dealId)}/leads/${encodeURIComponent(dealLeadId)}`

export function dealDrawerActionOverrides(lead, actions, t) {
  const keys = { 'customers-row-add-task': 'task', 'customers-row-mark-won': 'won', 'customers-row-mark-lost': 'lost', 'customers-row-add-meeting': 'meeting', 'customers-row-add-call': 'call', 'customers-row-add-follow-up': 'follow-up', 'customers-row-add-interest': 'interest' }
  return Object.fromEntries([
    ['status', null],
    ...buildDealLeadActions(lead, actions, t).filter((item) => keys[item.id]).map((item) => [keys[item.id], {
      icon: item.icon, label: item.shortLabel || item.label, onClick: item.onClick, disabled: item.disabled,
      accentClassName: item.variant === 'success' ? 'text-emerald-700' : item.variant === 'danger' ? 'text-red-700' : undefined,
    }]),
  ])
}

/** CRM actions receive CRM IDs; deal outcome handlers keep the deal-lead identity. */
export function dealLeadCustomer(lead) {
  return { ...lead.customer, id: lead.customerId, customer_id: lead.customerId, lead_id: lead.leadId,
    name: lead.name, phone: lead.phone, email: lead.email, agent_id: lead.ownerId,
    lead: { ...lead.lead, id: lead.leadId, name: lead.name, phone: lead.phone, email: lead.email } }
}

export function buildDealLeadActions(lead, actions, t, { selection = false } = {}) {
  const items = buildCustomerRowContextActions({ row: lead, t,
    onSchedule: actions.onSchedule, onAddFollowUp: actions.onFollowUp, onAddInterest: actions.onInterest,
    onMarkWon: actions.onWon, onMarkLost: actions.onLost,
    onAddTask: actions.onAddTask,
  }).filter((item) => selection || item.id !== 'customers-row-toggle-selection')
    .map((item) => ({ ...item, disabled: ['customers-row-mark-won', 'customers-row-mark-lost'].includes(item.id) ? lead.status !== 'open' : item.id !== 'customers-row-toggle-selection' && !lead.leadId }))
  return [...items, ...[
    { id: 'deal-lead-drawer', label: t('dealWorkspace.leads.actions.open'), icon: PanelRightOpen, onClick: () => actions.onOpen(lead) },
    { id: 'deal-lead-page', label: t('dealWorkspace.leads.drawer.openRecord'), icon: ExternalLink, onClick: () => actions.onOpenPage(lead) },
  ].map((item) => ({ ...item, shortLabel: item.label, tab: 'actions', layout: 'tiles', contextTitle: lead.name }))]
}
