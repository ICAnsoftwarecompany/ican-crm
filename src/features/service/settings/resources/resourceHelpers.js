import { localizeLabel } from '../../core/utils/localizeLabel'

/** Option builders shared by resource definitions. */
export const labelOptions = (items = [], language, titleField = 'label') =>
  items.map((item) => ({ value: item.id, label: localizeLabel(item[titleField], language, item.key || item.id) }))

export const listOf = (ctx, key) => ctx.lists[key]?.data || []

export const priorityOptions = (ctx) =>
  ['low', 'normal', 'high', 'urgent'].map((value) => ({ value, label: ctx.t(`service.cases.priority.${value}`) }))

export const statusOptions = (ctx) =>
  (ctx.setup?.case_types?.[0]?.pipeline?.statuses || []).map((status) => ({
    value: status.id,
    label: localizeLabel(status.label, ctx.language, status.key),
  }))

export const agentOptions = (ctx) => (ctx.setup?.agents || []).map((agent) => ({ value: agent.id, label: agent.name }))

/** "2h 30m" / "٢ س ٣٠ د" from minutes. */
export function formatMinutes(minutes, t) {
  const total = Number(minutes) || 0
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (!hours) return t('service.settings.duration.minutes', { count: rest })
  if (!rest) return t('service.settings.duration.hours', { count: hours })
  return t('service.settings.duration.hoursMinutes', { hours, minutes: rest })
}

export const namesOf = (ids = [], options = []) =>
  ids.map((id) => options.find((option) => String(option.value) === String(id))?.label).filter(Boolean)

/** Locale-aware "a, b and c" (Arabic comma in ar) without literal punctuation. */
export const listText = (items = [], language = 'en') =>
  items.length ? new Intl.ListFormat(language, { style: 'narrow', type: 'unit' }).format(items) : ''
