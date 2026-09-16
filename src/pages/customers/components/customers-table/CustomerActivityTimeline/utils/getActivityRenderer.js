import { DefaultActivity } from '../renderers/DefaultActivity'
import { InterestedProductsActivity } from '../renderers/InterestedProductsActivity'
import { NoteActivity } from '../renderers/NoteActivity'
import { StatusChangeActivity } from '../renderers/StatusChangeActivity'

export function getActivityRenderer(activity) {
  const type = String(activity?.type || '').toLowerCase()

  if (type === 'status_change') return StatusChangeActivity
  if (type === 'note' || type === 'note-to-lead') return NoteActivity
  if (type === 'interested_products') return InterestedProductsActivity

  return DefaultActivity
}
