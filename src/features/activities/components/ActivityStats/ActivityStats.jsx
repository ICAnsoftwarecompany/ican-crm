import { AlertTriangle, Ban, CalendarClock, CheckCircle2, Clock3, PlayCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ActivityStatCard } from './ActivityStatCard'

export function ActivityStats({ stats }) {
  const { t } = useTranslation()
  const items = [
    { label: t('activities.derivedStates.today'), value: stats.today, icon: Clock3, tone: 'teal' },
    { label: t('activities.status.scheduled'), value: stats.scheduled, icon: CalendarClock, tone: 'blue' },
    { label: t('activities.status.in_progress'), value: stats.inProgress, icon: PlayCircle, tone: 'amber' },
    { label: t('activities.status.completed'), value: stats.completed, icon: CheckCircle2, tone: 'emerald' },
    { label: t('activities.derivedStates.overdue'), value: stats.overdue, icon: AlertTriangle, tone: 'red' },
    { label: t('activities.status.cancelled'), value: stats.cancelled, icon: Ban, tone: 'slate' },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {items.map((item) => (
        <ActivityStatCard key={item.label} {...item} />
      ))}
    </section>
  )
}
