import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, PhoneCall, Plus, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useTaskMutations } from '../../hooks/useTasks'
import { useCurrentUserId } from '../../hooks/useCurrentUserId'
import { TaskFormDialog } from '../TaskFormDialog'

const ACTIONS = {
  task: { type: 'follow_up', icon: Plus },
  call: { type: 'call', icon: PhoneCall },
  meeting: { type: 'meeting', icon: CalendarClock },
  follow_up: { type: 'follow_up', icon: RefreshCcw },
}

/**
 * A button that opens the task form already linked to a record (and of a given kind), then creates
 * the task. Used for quick actions in the customer drawer and the conversation header.
 *
 * @param {{ type: string, id: string|number, name?: string }} taskable - alias + id (see taskableTypes)
 * @param {'task'|'call'|'meeting'|'follow_up'} action
 * @param {object} [defaults] - extra initial form values (title, description, …)
 */
export function CreateTaskButton({ taskable, action = 'task', defaults, variant = 'outline', compact = false, onCreated }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { create } = useTaskMutations()
  const currentUserId = useCurrentUserId()
  const config = ACTIONS[action] || ACTIONS.task
  const Icon = config.icon
  const label = t(`tasks.quickActions.${action}`)

  if (!taskable?.type || !taskable?.id) return null

  const handleSubmit = async (payload) => {
    try {
      await create.mutateAsync(payload)
      toast.success(t('tasks.page.createdToast'))
      setOpen(false)
      onCreated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.page.createFailedToast')))
    }
  }

  const buttonClass = variant === 'primary'
    ? 'bg-[#007A80] text-white hover:bg-[#00656A] border-transparent'
    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className={`inline-flex items-center gap-1 rounded-lg border font-black transition-colors ${compact ? 'h-7 px-2 text-[10px]' : 'h-9 px-2.5 text-xs'} ${buttonClass}`}
      >
        <Icon size={compact ? 12 : 14} />
        {label}
      </button>

      {open && (
        <TaskFormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          isSaving={create.isPending}
          hideTaskableFields
          initialValues={{
            type: config.type,
            visibility: 'shared',
            users: currentUserId ? [currentUserId] : [],
            // "Call Ahmed" / "مكالمة مع أحمد" — editable, saves typing for the common case.
            title: taskable.name ? t(`tasks.quickActions.defaultTitle.${action}`, { name: taskable.name }) : '',
            ...defaults,
            taskable_type: taskable.type,
            taskable_id: String(taskable.id),
          }}
          title={taskable.name
            ? t('tasks.quickActions.dialogTitleFor', { action: label, name: taskable.name })
            : label}
          description={t('tasks.quickActions.dialogDescription')}
          submitLabel={t('tasks.page.createTaskSubmitLabel')}
        />
      )}
    </>
  )
}
