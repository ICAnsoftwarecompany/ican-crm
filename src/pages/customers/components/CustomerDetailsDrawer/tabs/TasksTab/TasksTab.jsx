import { useMemo, useState } from 'react'
import { ListTodo, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { useTaskMutations, useTasks } from '../../../../../../features/tasks/hooks/useTasks'
import { extractMessage } from '../../../../../../shared/utils/apiResponse'
import { TaskCreateDialog } from './TaskCreateDialog'
import { TaskList } from './TaskList'
import { getLeadTaskableId, LEAD_TASKABLE_TYPE, taskBelongsToLead } from './taskUtils'

export function TasksTab({ customer, layoutMode = 'compact' }) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const leadId = getLeadTaskableId(customer)
  const taskParams = useMemo(() => ({
    taskable_type: LEAD_TASKABLE_TYPE,
    taskable_id: leadId,
  }), [leadId])
  const tasksQuery = useTasks(taskParams, {
    enabled: Boolean(leadId),
  })
  const mutations = useTaskMutations()

  const tasks = useMemo(() => {
    const list = Array.isArray(tasksQuery.data) ? tasksQuery.data : []
    return list.filter((task) => taskBelongsToLead(task, leadId))
  }, [leadId, tasksQuery.data])

  const handleCreateTask = async (form) => {
    try {
      await mutations.create.mutateAsync({
        ...form,
        taskable_type: LEAD_TASKABLE_TYPE,
        taskable_id: leadId,
      })
      toast.success('تم إنشاء المهمة')
      setIsCreateDialogOpen(false)
      tasksQuery.refetch()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر إنشاء المهمة'))
    }
  }

  if (!leadId) {
    return (
      <div className="my-4 rounded-xl border border-dashed border-[#BEEFF2] bg-[#F8FEFF] p-6 text-center text-sm text-[var(--text-muted)]">
        لا يمكن عرض المهام قبل تحديد الليد المرتبط بهذا العميل.
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-3 py-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#BEEFF2] bg-[#F8FEFF] p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
            <ListTodo size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-[var(--text)]">مهام العميل</h3>
            <p className="text-xs text-[var(--text-muted)]">{tasks.length} مهمة مرتبطة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => tasksQuery.refetch()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
            title="تحديث المهام"
            aria-label="تحديث المهام"
          >
            <RefreshCw size={15} className={tasksQuery.isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#007A80] px-3 text-xs font-black text-white transition-colors hover:bg-[#00656A]"
          >
            <Plus size={15} />
            إنشاء مهمة
          </button>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        isLoading={tasksQuery.isLoading}
        isError={tasksQuery.isError}
        onRetry={tasksQuery.refetch}
        layoutMode={layoutMode}
      />

      <TaskCreateDialog
        open={isCreateDialogOpen}
        leadId={leadId}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        isSaving={mutations.create.isPending}
      />
    </div>
  )
}
