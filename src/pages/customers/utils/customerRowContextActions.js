/**
 * Right-click menu of a Leads Center table row (moved out of CustomersPage 2026-10-15, when "Add interest" was
 * added; won / lost added the same day). Pure: returns the DataTable `getRowContextActions` items; the page passes the handlers.
 */
export function buildCustomerRowContextActions({ row, t, showTrash, onCustomizeTable, onSchedule, onAddFollowUp, onAddInterest, onMarkWon, onMarkLost }) {
  if (!row || showTrash) return []

  const customerName = row?.lead?.name || row?.name || row?.email || row?.phone || `#${row?.id || row?.customer_id || ''}`
  const customerSection = t('customers.page.actions.customerActionsSection')
  const action = (id, label, onClick) => ({ id, label, section: customerSection, tab: 'actions', onClick })

  return [
    {
      id: 'customers-page-table-customization',
      label: t('customers.page.actions.customizeTable'),
      section: t('customers.page.actions.additionalSettingsSection'),
      tab: 'format',
      onClick: () => onCustomizeTable(),
    },
    action('customers-row-add-meeting', t('customers.page.actions.addMeeting'), () => onSchedule(row, 'meeting')),
    action('customers-row-add-call', t('customers.page.actions.addCall'), () => onSchedule(row, 'call')),
    action('customers-row-add-follow-up', t('customers.page.actions.addFollowUp'), () => onAddFollowUp(row)),
    action('customers-row-add-interest', t('leads.interestDialog.contextAction'), () => onAddInterest(row)),
    ...(onMarkWon ? [action('customers-row-mark-won', t('customers.leadOutcome.contextWon'), () => onMarkWon(row))] : []),
    ...(onMarkLost ? [action('customers-row-mark-lost', t('customers.leadOutcome.contextLost'), () => onMarkLost(row))] : []),
    action('customers-row-toggle-selection', t('customers.page.actions.selectCustomer', { name: customerName }), (_targetRow, context) => {
      context?.toggleSelection?.()
    }),
  ]
}
