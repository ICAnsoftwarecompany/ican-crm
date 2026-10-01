import { useTranslation } from 'react-i18next'
import { CheckSquare } from 'lucide-react'
import { formatDate, formatTime } from '../../../shared/utils/dateTime'
import { getTaskDateTime, isTaskOverdue } from '../../tasks'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'
import { MyWorkItemList, MyWorkItemRow } from '../components/MyWorkItemRow'
import { useMyTasks } from '../hooks/useMyTasks'
import { useMyWorkPreview } from '../hooks/useMyWorkPreview'

const MAX_ROWS = 8

/** My open tasks due today or earlier. */
export function MyTasksSection() {
  const { t, i18n } = useTranslation()
  const tasks = useMyTasks()
  const { openTask, drawers } = useMyWorkPreview({ onChanged: tasks.refetch })

  return (
    <>
      <MyWorkSectionCard
        id="tasks"
        icon={CheckSquare}
        title={t('myWork.sections.tasks.title')}
        count={tasks.due.length}
        viewAllTo="/tasks"
        isLoading={tasks.isLoading}
        error={tasks.error}
        onRetry={tasks.refetch}
        empty={!tasks.due.length}
        emptyText={t('myWork.sections.tasks.empty')}
      >
        <MyWorkItemList>
          {tasks.due.slice(0, MAX_ROWS).map((task) => {
            const due = getTaskDateTime(task)
            const overdue = isTaskOverdue(task)
            return (
              <MyWorkItemRow
                key={task.id}
                icon={CheckSquare}
                title={task.title || task.name || t('myWork.kinds.task')}
                meta={overdue ? t('myWork.labels.overdue') : t('myWork.labels.dueToday')}
                time={overdue ? formatDate(due, i18n.language, { day: 'numeric', month: 'short' }) : formatTime(due, i18n.language)}
                overdue={overdue}
                onClick={() => openTask(task.id)}
              />
            )
          })}
        </MyWorkItemList>
        {tasks.due.length > MAX_ROWS && (
          <p className="px-2 pt-2 text-xs text-[var(--text-muted)]">{t('myWork.moreItems', { count: tasks.due.length - MAX_ROWS })}</p>
        )}
      </MyWorkSectionCard>
      {drawers}
    </>
  )
}
