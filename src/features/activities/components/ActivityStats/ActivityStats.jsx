import { AlertTriangle, Ban, CalendarClock, CheckCircle2, Clock3, PlayCircle } from 'lucide-react'
import { ActivityStatCard } from './ActivityStatCard'

export function ActivityStats({ stats }) {
  const items = [
    { label: 'اليوم', value: stats.today, icon: Clock3, tone: 'teal' },
    { label: 'مجدول', value: stats.scheduled, icon: CalendarClock, tone: 'blue' },
    { label: 'قيد التنفيذ', value: stats.inProgress, icon: PlayCircle, tone: 'amber' },
    { label: 'مكتمل', value: stats.completed, icon: CheckCircle2, tone: 'emerald' },
    { label: 'متأخر', value: stats.overdue, icon: AlertTriangle, tone: 'red' },
    { label: 'ملغي', value: stats.cancelled, icon: Ban, tone: 'slate' },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {items.map((item) => (
        <ActivityStatCard key={item.label} {...item} />
      ))}
    </section>
  )
}
