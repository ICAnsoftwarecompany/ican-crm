import { AppModal } from '../../../../../../shared/components/overlays/AppModal'
import { TaskCreateForm } from './TaskCreateForm'
import { useTranslation } from 'react-i18next'

export function TaskCreateDialog({ open, leadId, onClose, onSubmit, isSaving }) {
  const { t } = useTranslation()
  return (
    <AppModal
      isOpen={open}
      onClose={onClose}
      title={t('customers.tasksTab.create')}
      description={t('customers.tasksTab.createDescription')}
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
