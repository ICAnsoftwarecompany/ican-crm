import { CalendarPlus, HeartHandshake, MessageSquarePlus, PhoneCall, SquareMousePointer, ThumbsDown, Trophy, ListTodo, UserRound } from 'lucide-react'

/**
 * Right-click menu of a Leads Center table row (moved out of CustomersPage 2026-10-15, when "Add interest" was
 * added; won / lost added the same day). Pure: returns the DataTable `getRowContextActions` items; the page passes the handlers.
 */
export function buildCustomerRowContextActions({ row, t, showTrash, onCustomizeTable, onSchedule, onAddFollowUp, onAddInterest, onAssignOwner, onMarkWon, onMarkLost, onAddTask }) {
  if (!row || showTrash) return []

  const customerName = row?.lead?.name || row?.name || row?.email || row?.phone || `#${row?.id || row?.customer_id || ''}`
  const customerSection = t('customers.page.actions.customerActionsSection')
  const action = (id, label, onClick, icon, shortLabel, variant) => ({ id, label, section: customerSection, tab: 'actions', onClick, icon, shortLabel, variant, layout: 'tiles', contextTitle: customerName })

  return [
    ...(onCustomizeTable ? [{
      id: 'customers-page-table-customization',
      label: t('customers.page.actions.customizeTable'),
      section: t('customers.page.actions.additionalSettingsSection'),
      tab: 'format',
      onClick: () => onCustomizeTable(),
    }] : []),
    ...(onMarkWon ? [action('customers-row-mark-won', t('customers.leadOutcome.contextWon'), () => onMarkWon(row), Trophy, t('customers.leadOutcome.won.action'), 'success')] : []),
    ...(onMarkLost ? [action('customers-row-mark-lost', t('customers.leadOutcome.contextLost'), () => onMarkLost(row), ThumbsDown, t('customers.leadOutcome.lost.action'), 'danger')] : []),
    ...(onAddTask ? [action('customers-row-add-task', t('customers.leadTasks.add'), () => onAddTask(row), ListTodo, t('customers.leadTasks.add'))] : []),
    action('customers-row-add-meeting', t('customers.page.actions.addMeeting'), () => onSchedule(row, 'meeting'), CalendarPlus, t('customers.contextTiles.meeting')),
    action('customers-row-add-call', t('customers.page.actions.addCall'), () => onSchedule(row, 'call'), PhoneCall, t('customers.contextTiles.call')),
    action('customers-row-add-follow-up', t('customers.page.actions.addFollowUp'), () => onAddFollowUp(row), MessageSquarePlus, t('customers.contextTiles.followUp')),
    action('customers-row-add-interest', t('leads.interestDialog.contextAction'), () => onAddInterest(row), HeartHandshake, t('customers.contextTiles.interest')),
    ...(onAssignOwner ? [action('customers-row-assign-owner', t('customers.page.actions.assignOwner'), () => onAssignOwner(row), UserRound, t('customers.page.actions.assignOwner'))] : []),
    action('customers-row-toggle-selection', t('customers.page.actions.selectCustomer', { name: customerName }), (_targetRow, context) => {
      context?.toggleSelection?.()
    }, SquareMousePointer, t('customers.contextTiles.select')),
  ]
}
