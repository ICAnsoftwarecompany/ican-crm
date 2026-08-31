import { AppModal } from '../../../shared/components/overlays/AppModal'
import { TaskForm } from './TaskForm'

export function TaskFormDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSaving = false,
  title = 'إنشاء مهمة',
  description = 'أنشئ مهمة جديدة وحدد البيانات المطلوبة.',
  submitLabel = 'حفظ المهمة',
  hideTaskableFields = false,
}) {
  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title={title}
      description={description}
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
