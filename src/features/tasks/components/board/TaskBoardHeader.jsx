import { useTranslation } from 'react-i18next'
import { Filter, MoreHorizontal, Plus, Search, SlidersHorizontal } from 'lucide-react'

export function TaskBoardHeader({
  boardName,
  taskCount = 0,
  search = '',
  onSearchChange,
  onAddTask,
  onOpenFilters,
  onOpenBoardMenu,
}) {
  const { t } = useTranslation()
  const resolvedBoardName = boardName ?? t('tasks.page.mainBoard')

  return (
    <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-[#D7EEF0] bg-[#F8FEFF] p-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-base font-black text-[#0F172A]">{resolvedBoardName}</h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#64748B]">{t('tasks.board.tasksCountSuffix', { count: taskCount })}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block min-w-[180px] flex-1 sm:max-w-[220px]">
          <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={t('tasks.board.searchTasksPlaceholder')}
            className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-white ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
          />
        </label>

        <button type="button" onClick={onOpenFilters} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D7EEF0] bg-white px-2.5 text-[11px] font-black text-[#007A80]">
          <SlidersHorizontal size={13} />
          {t('tasks.board.filterButton')}
        </button>

        <button type="button" onClick={onOpenFilters} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D7EEF0] bg-white px-2.5 text-[11px] font-black text-[#007A80]">
          <Filter size={13} />
          {t('tasks.board.sortButton')}
        </button>

        <button type="button" onClick={onAddTask} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#007A80] px-3 text-[11px] font-black text-white">
          <Plus size={13} />
          {t('tasks.page.newTask')}
        </button>

        <button type="button" onClick={onOpenBoardMenu} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#64748B]">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  )
}
