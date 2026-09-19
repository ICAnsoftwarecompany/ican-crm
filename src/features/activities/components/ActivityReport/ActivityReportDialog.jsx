import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useActivityMutations } from '../../hooks/useActivityMutations'
import { getActivityReportSchema } from '../../schemas/activityReportSchema'
import { formatDateTimeForApi, toDateTimeLocalValue } from '../../utils/activityDateHelpers'
import { getNextActionConfig } from '../../utils/activityNextActions'
import { getOutcomeOptions } from '../../utils/activityOutcomes'
import { CallReportFields } from './CallReportFields'
import { MeetingReportFields } from './MeetingReportFields'
import { NextActionFields } from './NextActionFields'

const FORM_ID = 'activity-report-form'
const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'
const textareaClassName = 'min-h-24 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

export function ActivityReportDialog({ isOpen, onClose, activity, onSaved }) {
  const { t } = useTranslation()
  const mutations = useActivityMutations()
  const outcomes = useMemo(() => getOutcomeOptions(activity?.type, t), [activity?.type, t])
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getActivityReportSchema(t)),
    defaultValues: {
      outcome: outcomes[0]?.value || '',
      summary: '',
      rating: '',
      next_action: 'none',
      next_action_at: '',
      notes: '',
      duration: '',
      attendees_count: '',
    },
  })

  const isPending = mutations.createReport.isPending || mutations.complete.isPending || mutations.create.isPending

  useEffect(() => {
    reset({
      outcome: outcomes[0]?.value || '',
      summary: '',
      rating: '',
      next_action: 'none',
      next_action_at: '',
      notes: '',
      duration: '',
      attendees_count: '',
    })
  }, [activity?.id, outcomes, reset])

  const submit = async (values) => {
    if (!activity?.id) return

    try {
      const payload = {
        outcome: values.outcome,
        summary: values.summary,
        rating: values.rating || '',
        next_action: values.next_action,
        next_action_at: values.next_action_at ? formatDateTimeForApi(values.next_action_at) : '',
        notes: values.notes || values.summary,
        data: {
          duration: values.duration || undefined,
          attendees_count: values.attendees_count || undefined,
        },
      }

      await mutations.createReport.mutateAsync({ activityId: activity.id, payload })

      const nextActionConfig = getNextActionConfig(values.next_action, t)
      if (['call', 'meeting'].includes(nextActionConfig.createsEntity)) {
        const nextStart = values.next_action_at || toDateTimeLocalValue(new Date())
        await mutations.create.mutateAsync({
          title: `${nextActionConfig.label} - ${activity.relatedEntity?.name || activity.title}`,
          type: nextActionConfig.createsEntity,
          priority: activity.priority || 'medium',
          start_at: formatDateTimeForApi(nextStart),
          taskable_type: activity.relatedEntity?.type === 'customer' ? 'App\\Models\\Customer' : 'App\\Models\\Lead',
          taskable_id: activity.relatedEntity?.id || activity.raw?.taskable_id,
          users: activity.assignedUser?.id ? [activity.assignedUser.id] : [],
          team_id: activity.assignedTeam?.id || '',
          description: t('activities.reportDialog.followUpDescription', { title: activity.title }),
        })
      }

      await mutations.complete.mutateAsync(activity.id)
      toast.success(t('activities.reportDialog.savedToast'))
      onSaved?.()
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, t('activities.reportDialog.saveFailed')))
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('activities.reportDialog.title')}
      description={t('activities.reportDialog.description')}
      size="lg"
      className="max-w-2xl"
      closeOnBackdrop={false}
      footer={(
        <>
          <Button variant="outline" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button type="submit" form={FORM_ID} variant="ai" loading={isPending}>{t('activities.reportDialog.saveAndFinish')}</Button>
        </>
      )}
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
            <span>{t('activities.meetingDrawer.fields.outcome')}</span>
            <select {...register('outcome')} className={inputClassName}>
              {outcomes.map((outcome) => (
                <option key={outcome.value} value={outcome.value}>{outcome.label}</option>
              ))}
            </select>
            {errors.outcome ? <span className="block text-[11px] text-red-600">{errors.outcome.message}</span> : null}
          </label>

          <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
            <span>{t('activities.meetingDrawer.fields.rating')}</span>
            <select {...register('rating')} className={inputClassName}>
              <option value="">{t('activities.reportDialog.noRating')}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>

          {activity?.type === 'call' ? <CallReportFields register={register} inputClassName={inputClassName} /> : null}
          {activity?.type === 'meeting' ? <MeetingReportFields register={register} inputClassName={inputClassName} /> : null}
          <NextActionFields register={register} watch={watch} errors={errors} inputClassName={inputClassName} />
        </div>

        <label className="block min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
          <span>{t('activities.reportDialog.summaryLabel')}</span>
          <textarea {...register('summary')} className={textareaClassName} placeholder={t('activities.reportDialog.summaryPlaceholder')} />
          {errors.summary ? <span className="block text-[11px] text-red-600">{errors.summary.message}</span> : null}
        </label>

        <label className="block min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
          <span>{t('activities.afterMeetingReport.additionalNotesLabel')}</span>
          <textarea {...register('notes')} className={textareaClassName} placeholder={t('activities.scheduleDialog.optionalPlaceholder')} />
        </label>
      </form>
    </AppModal>
  )
}
