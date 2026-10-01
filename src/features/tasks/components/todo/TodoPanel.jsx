import { useState } from 'react'
import { useTodoList } from '../../hooks/useTodoList'
import { TodoPanelView } from './TodoPanelView'

/** Self-contained To-Do list (owns its view). Used by the Tasks page "My to-do list" smart view. */
export function TodoPanel({ initialView = 'today', onOpenTask, maxRows }) {
  const [view, setView] = useState(initialView)
  const todo = useTodoList(view)
  return <TodoPanelView todo={todo} view={view} onViewChange={setView} onOpenTask={onOpenTask} maxRows={maxRows} />
}
