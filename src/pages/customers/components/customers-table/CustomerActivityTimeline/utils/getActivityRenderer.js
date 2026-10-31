import { DefaultActivity } from '../renderers/DefaultActivity'
import { CustomerDealTimelineActivity } from '../../../../../../features/customers'
import { LeadTaskTimelineActivity } from '../../../../../../features/lead-tasks'
import { InterestedProductsActivity } from '../renderers/InterestedProductsActivity'
import { NoteActivity } from '../renderers/NoteActivity'
import { StatusChangeActivity } from '../renderers/StatusChangeActivity'

export function getActivityRenderer(activity) {
  if (activity?.task) return LeadTaskTimelineActivity
  if (activity?.customerDeal) return CustomerDealTimelineActivity
  const type = String(activity?.type || '').toLowerCase()

  if (type === 'status_change') return StatusChangeActivity
  if (type === 'note' || type === 'note-to-lead') return NoteActivity
  if (type === 'interested_products') return InterestedProductsActivity

  return DefaultActivity
}
