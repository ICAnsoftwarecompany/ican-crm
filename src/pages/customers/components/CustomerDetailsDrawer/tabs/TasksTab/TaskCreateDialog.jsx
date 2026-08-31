import { AppModal } from '../../../../../../shared/components/overlays/AppModal'
import { TaskCreateForm } from './TaskCreateForm'

export function TaskCreateDialog({ open, leadId, onClose, onSubmit, isSaving }) {
  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title="إنشاء مهمة"
      description="أضف مهمة مرتبطة بهذا الليد وحدد موعدها وأولويتها."
      size="lg"
      className="sm:max-w-2xl"
    >
      <TaskCreateForm
        leadId={leadId}
        onSubmit={onSubmit}
        isSaving={isSaving}
      />
    </AppModal>
  )
}
