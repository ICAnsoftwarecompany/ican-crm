import { ListTodo } from 'lucide-react'

import { cn } from '../../../shared/utils/cn'
import { useTasks } from '../hooks/useTasks'
import { getTaskSummaryMetrics } from '../utils/taskMeta'

export function TasksNavbarButton({ active = false, onClick }) {
  const tasksQuery = useTasks({ per_page: 40 })
  const tasks = Array.isArray(tasksQuery.data) ? tasksQuery.data : []
  const unreadCount = getTaskSummaryMetrics(tasks).unread

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[#00C2CB] bg-[#E8F9FA]'
          : 'border-[#E5E7EB] bg-white hover:bg-[#E8F9FA]'
      )}
      aria-label="المهام"
      title="فتح لوحة المهام السريعة"
    >
      <ListTodo size={16} className="text-[#0F172A]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
