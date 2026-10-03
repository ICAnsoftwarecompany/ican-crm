import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, ListTodo, PhoneCall } from 'lucide-react'
import { formatDate, formatTime } from '../../../../shared/utils/dateTime'
import { getTaskDeadline, isTaskClosed } from '../../../tasks'
import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealActivities, useDealTasks } from '../../hooks/useDealLinkedWork'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'

const ICONS = { task: ListTodo, call: PhoneCall, meeting: CalendarClock }

/** Next 6 dated items of the deal (open tasks + upcoming calls/meetings), soonest first. */
export function DealUpcomingWork() {
  const { t, i18n } = useTranslation()
  const { dealId } = useDealWorkspace()
  const tasks = useDealTasks()
  const activities = useDealActivities()

  const items = useMemo(() => {
    const now = Date.now()
    const fromTasks = [...tasks.groups.deal, ...tasks.groups.lead, ...tasks.groups.contract]
      .filter((task) => !isTaskClosed(task))
      .map((task) => ({ id: `task-${task.id}`, kind: 'task', title: task.title, at: getTaskDeadline(task), page: 'tasks' }))
    const fromActivities = activities.items
      .filter((item) => item.startAt && new Date(item.startAt).getTime() >= now && !['completed', 'cancelled'].includes(String(item.status)))
      .map((item) => ({ id: `act-${item.id}`, kind: item.type === 'call' ? 'call' : 'meeting', title: item.title, at: new Date(item.startAt), page: item.type === 'call' ? 'calls' : 'meetings' }))
    return [...fromTasks, ...fromActivities]
      .filter((item) => item.at && !Number.isNaN(item.at.getTime()))
      .sort((left, right) => left.at - right.at)
      .slice(0, 6)
  }, [activities.items, tasks.groups])

  return (
    <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.overview.upcoming')}</h2>
        <Link to={getDealPagePath(dealId, 'calendar')} className="text-xs font-semibold text-[var(--brand-accent)] hover:underline">{t('dealWorkspace.overview.openCalendar')}</Link>
      </div>
      {tasks.isLoading || activities.isLoading ? (
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.common.loading')}</p>
      ) : !items.length ? (
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.overview.nothingUpcoming')}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {items.map((item) => {
            const Icon = ICONS[item.kind]
            return (
              <li key={item.id}>
                <Link to={getDealPagePath(dealId, item.page)} className="flex items-center justify-between gap-2 py-2 text-sm hover:text-[var(--brand-accent)]">
                  <span className="flex min-w-0 items-center gap-2 text-[var(--text)]"><Icon size={15} className="shrink-0 text-[var(--text-muted)]" /><span className="truncate">{item.title}</span></span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">{formatDate(item.at, i18n.language)} · {formatTime(item.at, i18n.language)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
