import { toast } from 'sonner'

import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { getActivityLabel } from '../../utils/activityHelpers'
import { useActivityMutations } from '../../hooks/useActivityMutations'
import { ActivityForm } from './ActivityForm'

const FORM_ID = 'activity-form'

export function ActivityFormDialog({ isOpen, onClose, initialType = 'call', activity, onSaved }) {
  const mutations = useActivityMutations()
  const isEdit = Boolean(activity?.id)
  const isPending = mutations.create.isPending || mutations.update.isPending

  const handleSubmit = async (payload) => {
    try {
      const result = isEdit
        ? await mutations.update.mutateAsync({ activityId: activity.id, payload })
        : await mutations.create.mutateAsync(payload)

      toast.success(isEdit ? 'تم تعديل النشاط.' : 'تم إنشاء النشاط.')
      onSaved?.(result)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر حفظ النشاط'))
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `تعديل ${getActivityLabel(activity)}` : 'إنشاء نشاط جديد'}
      description="مكالمة أو اجتماع مرتبط بعميل أو Lead في مركز العملاء المحتملين."
      size="lg"
      className="max-w-3xl"
      closeOnBackdrop={false}
      footer={(
        <>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" form={FORM_ID} variant="ai" loading={isPending}>
            حفظ النشاط
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
