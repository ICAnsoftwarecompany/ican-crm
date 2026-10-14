import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlarmClock, CheckSquare, PhoneCall, Presentation } from 'lucide-react'
import { formatDate, formatTime } from '../../../shared/utils/dateTime'
import { getTaskDateTime, isTaskOverdue } from '../../tasks'
import { isOverdueActivity } from '../../activities'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'
import { MyWorkItemList, MyWorkItemRow } from '../components/MyWorkItemRow'
import { useMyActivities } from '../hooks/useMyActivities'
import { useMyTasks } from '../hooks/useMyTasks'
import { useMyWorkPreview } from '../hooks/useMyWorkPreview'
import { buildOverdueItems } from '../utils/myWorkItems'

const KIND_ICONS = { call: PhoneCall, meeting: Presentation, task: CheckSquare }
const MAX_ROWS = 8

/** Everything past its time, across calls, meetings and tasks — oldest first. */
export function OverdueSection() {
  const { t, i18n } = useTranslation()
  const activities = useMyActivities()
  const tasks = useMyTasks()
  const refetch = () => {
    activities.refetch()
    tasks.refetch()
  }
  const { openActivity, openTask, drawers } = useMyWorkPreview({ onChanged: refetch })

  const items = useMemo(() => buildOverdueItems({
    activities: activities.mine,
    tasks: tasks.mine,
    isActivityOverdue: isOverdueActivity,
    isTaskLate: (task) => isTaskOverdue(task),
    getTaskDue: getTaskDateTime,
  }), [activities.mine, tasks.mine])

  return (
    <>
      <MyWorkSectionCard
        id="overdue"
        icon={AlarmClock}
        tone="danger"
        title={t('myWork.sections.overdue.title')}
        count={items.length}
        isLoading={activities.isLoading || tasks.isLoading}
        error={activities.error && tasks.error ? activities.error : null}
        onRetry={refetch}
        empty={!items.length}
        emptyText={t('myWork.sections.overdue.empty')}
      >
        <MyWorkItemList>
          {items.slice(0, MAX_ROWS).map((item) => (
            <MyWorkItemRow
              key={item.key}
              icon={KIND_ICONS[item.kind]}
              title={item.title || t(`myWork.kinds.${item.kind}`)}
              meta={t(`myWork.kinds.${item.kind}`)}
              time={`${formatDate(item.dueAt, i18n.language, { day: 'numeric', month: 'short' })} ${formatTime(item.dueAt, i18n.language)}`}
              overdue
              onClick={() => (item.kind === 'task' ? openTask(item.id) : openActivity(item.source))}
            />
          ))}
        </MyWorkItemList>
        {items.length > MAX_ROWS && (
          <p className="px-2 pt-2 text-xs text-[var(--text-muted)]">{t('myWork.moreItems', { count: items.length - MAX_ROWS })}</p>
        )}
      </MyWorkSectionCard>
      {drawers}
    </>
  )
}
