import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { taskBoardRepository } from '../../repositories/taskBoardRepository'
import { TaskBoardHeader } from './TaskBoardHeader'
import { TaskBoardList } from './TaskBoardList'

export function TaskBoard({
  boardId = 'main',
  tasks = [],
  onOpenTask,
  onCreateTask,
  onQuickComplete,
  onDeleteTask,
  onAddList,
}) {
  const [boardSearch, setBoardSearch] = useState('')
  const [boardLists, setBoardLists] = useState([])

  useMemo(() => {
    const nextLists = taskBoardRepository.buildBoardListsForTasks(boardId, tasks, {})
    setBoardLists(nextLists)
  }, [boardId, tasks])

  const filteredLists = useMemo(() => {
    const query = boardSearch.trim().toLowerCase()
    if (!query) return boardLists

    return boardLists.map((list) => ({
      ...list,
      tasks: list.tasks.filter((task) => [task.title, task.description, task.type, task.status].join(' ').toLowerCase().includes(query)),
    }))
  }, [boardLists, boardSearch])

  return (
    <div className="space-y-3">
      <TaskBoardHeader
        boardName={boardId === 'main' ? 'Main Board' : boardId === 'sales' ? 'Sales Team' : 'Follow-ups'}
        taskCount={tasks.length}
        search={boardSearch}
        onSearchChange={setBoardSearch}
        onAddTask={() => onCreateTask?.(boardId, 'New task')}
      />

      <div className="scrollbar-elegant -mx-1 overflow-x-auto pb-2">
        <div className="flex min-h-[420px] items-start gap-3 px-1">
          {filteredLists.map((list) => (
            <TaskBoardList
              key={list.id}
              list={list}
              tasks={list.tasks}
              onOpenTask={onOpenTask}
              onQuickComplete={onQuickComplete}
              onCreateTask={(targetListId, title) => onCreateTask?.(targetListId, title, boardId)}
              onDeleteTask={onDeleteTask}
            />
          ))}

          <button
            type="button"
            onClick={() => onAddList?.()}
            className="inline-flex h-[120px] w-[300px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-[#CFECEF] bg-[#F8FEFF] text-sm font-black text-[#007A80]"
          >
            <Plus size={16} />
            Add new list
          </button>
        </div>
      </div>
    </div>
  )
}
