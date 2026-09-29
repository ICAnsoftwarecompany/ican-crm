import { useState } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'

import { InlineTaskCreator } from './InlineTaskCreator'
import { TaskCard } from './TaskCard'

export function TaskBoardList({ list, tasks = [], onOpenTask, onQuickComplete, onCreateTask, onDeleteTask, onMenuAction }) {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <section className="w-[320px] shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-2 shadow-sm">
      <header className="mb-2 flex items-center justify-between gap-2 px-1 pb-1">
        <div className="min-w-0">
          <h3 className="truncate text-xs font-black text-[var(--text)]">{list.name}</h3>
          <p className="text-[10px] font-bold text-[var(--text-muted)]">{tasks.length} task{tasks.length === 1 ? '' : 's'}</p>
        </div>

        <button type="button" onClick={() => onMenuAction?.(list)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--brand-accent)]">
          <MoreHorizontal size={14} />
        </button>
      </header>

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id || `${task.title}-${task.due_date || ''}`}
            task={task}
            onOpenTask={onOpenTask}
            onQuickComplete={onQuickComplete}
            onDelete={() => onDeleteTask?.(task)}
          />
        ))}

        {isCreating ? (
          <InlineTaskCreator
            onSubmit={(value) => {
              onCreateTask?.(list.id, value)
              setIsCreating(false)
            }}
            onCancel={() => setIsCreating(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[11px] font-black text-[var(--brand-accent)]"
          >
            <Plus size={12} />
            Add a task
          </button>
        )}
      </div>
    </section>
  )
}
