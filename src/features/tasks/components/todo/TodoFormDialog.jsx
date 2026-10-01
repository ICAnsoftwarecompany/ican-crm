import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useTaskMutations } from '../../hooks/useTasks'
import { TodoForm } from './TodoForm'

/**
 * "New To-Do" dialog: the short To-Do form, creates the task and toasts. `initialValues` can preset
 * `when` (e.g. the open tab) or a linked customer.
 */
export function TodoFormDialog({ open, onClose, initialValues, onCreated }) {
  const { t } = useTranslation()
  const { create } = useTaskMutations()

  const handleSubmit = async (payload) => {
    try {
      const result = await create.mutateAsync(payload)
      toast.success(t('tasks.todo.quickAdd.created'))
      onCreated?.(result)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.todo.quickAdd.failed')))
    }
  }

  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title={t('tasks.todo.form.createTitle')}
      description={t('tasks.todo.form.createDescription')}
      size="md"
    >
      {open && <TodoForm initialValues={initialValues} onSubmit={handleSubmit} isSaving={create.isPending} />}
    </AppModal>
  )
}
