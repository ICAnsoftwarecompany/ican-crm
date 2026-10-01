import i18n from 'i18next'
import { formatActivityDayLabel, toActivityDate } from './formatActivityDate'

function buildDayKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRelativeDayLabel(date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000)

  if (diffDays === 0) return i18n.t('customers.activityTimeline.today')
  if (diffDays === 1) return i18n.t('customers.activityTimeline.yesterday')
  return formatActivityDayLabel(date)
}

export function groupActivitiesByDate(activities = []) {
  const groupsMap = new Map()

  activities.forEach((activity) => {
    const date = toActivityDate(activity?.date)
    const key = date ? buildDayKey(date) : 'unknown-date'

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        label: date ? getRelativeDayLabel(date) : i18n.t('customers.activityTimeline.noDate'),
        sortTime: date ? date.getTime() : 0,
        items: [],
      })
    }

    groupsMap.get(key).items.push(activity)
  })

  return Array.from(groupsMap.values())
    .sort((a, b) => b.sortTime - a.sortTime)
}
