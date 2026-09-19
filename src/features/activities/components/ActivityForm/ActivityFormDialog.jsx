import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { getActivityLabel } from '../../utils/activityHelpers'
import { useActivityMutations } from '../../hooks/useActivityMutations'
import { ActivityForm } from './ActivityForm'

const FORM_ID = 'activity-form'

export function ActivityFormDialog({ isOpen, onClose, initialType = 'call', activity, onSaved }) {
  const { t } = useTranslation()
  const mutations = useActivityMutations()
  const isEdit = Boolean(activity?.id)
  const isPending = mutations.create.isPending || mutations.update.isPending

  const handleSubmit = async (payload) => {
    try {
      const result = isEdit
        ? await mutations.update.mutateAsync({ activityId: activity.id, payload })
        : await mutations.create.mutateAsync(payload)

      toast.success(isEdit ? t('activities.formDialog.updatedToast') : t('activities.formDialog.createdToast'))
      onSaved?.(result)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, t('activities.formDialog.saveFailed')))
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('activities.scheduleDialog.editPrefix', { action: getActivityLabel(activity, t) }) : t('activities.formDialog.newActivityTitle')}
      description={t('activities.formDialog.description')}
      size="lg"
      className="max-w-3xl"
      closeOnBackdrop={false}
      footer={(
        <>
          <Button variant="outline" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button type="submit" form={FORM_ID} variant="ai" loading={isPending}>
            {t('activities.formDialog.saveActivity')}
          </Button>
        </>
      )}
    >
      <ActivityForm
        formId={FORM_ID}
        activity={activity}
        initialType={initialType}
        onSubmit={handleSubmit}
      />
    </AppModal>
  )
}
