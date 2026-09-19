import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../shared/components/overlays/AppModal'
import { TaskForm } from './TaskForm'

export function TaskFormDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSaving = false,
  title,
  description,
  submitLabel,
  hideTaskableFields = false,
}) {
  const { t } = useTranslation()

  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title={title ?? t('tasks.formDialog.createTitle')}
      description={description ?? t('tasks.formDialog.createDescription')}
      size="lg"
      className="sm:max-w-3xl"
    >
      <TaskForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        isSaving={isSaving}
        submitLabel={submitLabel}
        hideTaskableFields={hideTaskableFields}
      />
    </AppModal>
  )
}
