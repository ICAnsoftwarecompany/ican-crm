import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckSquare } from 'lucide-react'
import { TodoPanelView, useTodoList } from '../../tasks'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'
import { useMyWorkPreview } from '../hooks/useMyWorkPreview'

const MAX_ROWS = 6

/**
 * "My to-do list": the tasks feature's To-Do list (today / week / month / overdue, quick add,
 * tick to complete) for the signed-in user. Rows open the task drawer in place.
 */
export function MyTasksSection() {
  const { t } = useTranslation()
  const [view, setView] = useState('today')
  const todo = useTodoList(view)
  const { openTask, drawers } = useMyWorkPreview({ onChanged: todo.refetch })

  return (
    <>
      <MyWorkSectionCard
        id="tasks"
        icon={CheckSquare}
        title={t('myWork.sections.tasks.title')}
        count={todo.counts[view] || 0}
        viewAllTo="/tasks?smart=todo"
        isLoading={false}
        error={null}
        empty={false}
      >
        <TodoPanelView todo={todo} view={view} onViewChange={setView} onOpenTask={openTask} maxRows={MAX_ROWS} />
      </MyWorkSectionCard>
      {drawers}
    </>
  )
}
