function toDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isSameDay(first, second) {
  if (!first || !second) return false
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}

export function getDateLabel(value, locale = 'ar-EG') {
  const date = toDate(value)
  if (!date) return ''
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) return locale.startsWith('ar') ? 'اليوم' : 'Today'
  if (isSameDay(date, yesterday)) return locale.startsWith('ar') ? 'أمس' : 'Yesterday'

  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function shouldGroupWithPrevious(previous, current, maxGapMinutes = 5) {
  if (!previous || !current) return false

  const prevSender = previous?.sender_id ?? previous?.user_id ?? previous?.raw?.sent_by?.id
  const currentSender = current?.sender_id ?? current?.user_id ?? current?.raw?.sent_by?.id
  if (String(prevSender || '') !== String(currentSender || '')) return false

  const prevDate = toDate(previous?.createdAt || previous?.raw?.created_at)
  const currentDate = toDate(current?.createdAt || current?.raw?.created_at)
  if (!prevDate || !currentDate) return false
  if (!isSameDay(prevDate, currentDate)) return false

  return (currentDate.getTime() - prevDate.getTime()) / 60000 <= maxGapMinutes
}
