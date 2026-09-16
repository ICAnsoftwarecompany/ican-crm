import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ACTIVITY_PRIORITIES, ACTIVITY_TYPES } from '../../constants/activityConstants'
import { activitySchema } from '../../schemas/activitySchema'
import { addMinutes, formatDateTimeForApi, toDateTimeLocalValue } from '../../utils/activityDateHelpers'
import { AssignmentFields } from './AssignmentFields'
import { CallFields } from './CallFields'
import { FormField, inputClassName, textareaClassName } from './ActivityFormFields'
import { MeetingFields } from './MeetingFields'
import { RelatedEntityFields } from './RelatedEntityFields'
import { ReminderFields } from './ReminderFields'

function modelTypeForRelatedType(relatedType) {
  return relatedType === 'customer' ? 'App\\Models\\Customer' : 'App\\Models\\Lead'
}

export function ActivityForm({ formId, activity, initialType = 'call', onSubmit }) {
  const defaults = useMemo(() => {
    const start = activity?.startAt ? new Date(activity.startAt) : addMinutes(new Date(), initialType === 'call' ? 15 : 30)
    const end = activity?.endAt ? new Date(activity.endAt) : addMinutes(start, 60)
    const relatedType = activity?.relatedEntity?.type || 'lead'

    return {
      type: activity?.type || initialType,
      title: activity?.title || '',
      related_type: relatedType,
      taskable_id: activity?.relatedEntity?.id ? String(activity.relatedEntity.id) : '',
      assigned_to: activity?.assignedUser?.id ? String(activity.assignedUser.id) : '',
      team_id: activity?.assignedTeam?.id ? String(activity.assignedTeam.id) : '',
      priority: activity?.priority || 'medium',
      start_at: toDateTimeLocalValue(start),
      end_at: toDateTimeLocalValue(end),
      reminder_before: activity?.raw?.reminder_before || '15',
      reminder_unit: activity?.raw?.reminder_unit || 'minutes',
      description: activity?.description || '',
      phone: activity?.phone || '',
      call_provider: activity?.callProvider || 'manual',
      mode: activity?.mode || 'online',
      meeting_link: activity?.meetingUrl || '',
      location: activity?.location || '',
    }
  }, [activity, initialType])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  const type = watch('type')

  const submit = (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || '',
      type: values.type,
      priority: values.priority,
      start_at: formatDateTimeForApi(values.start_at),
      end_at: values.end_at ? formatDateTimeForApi(values.end_at) : '',
      taskable_type: modelTypeForRelatedType(values.related_type),
      taskable_id: values.taskable_id,
      users: values.assigned_to ? [values.assigned_to] : [],
      team_id: values.team_id || '',
      reminder_type: 'system',
      reminder_before: values.reminder_before || '',
      reminder_unit: values.reminder_unit || 'minutes',
    }

    if (values.type === 'call') {
      payload.mode = 'online'
      payload.call_provider = values.call_provider || 'manual'
      payload.callee_number = values.phone || ''
      payload.phone = values.phone || ''
    }

    if (values.type === 'meeting') {
      payload.mode = values.mode
      payload.meeting_link = values.meeting_link || ''
      payload.location = values.location || ''
      payload.scope = 'participants'
    }

    onSubmit(payload)
  }

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="نوع النشاط" error={errors.type?.message}>
          <select {...register('type')} className={inputClassName}>
            <option value="call">{ACTIVITY_TYPES.call.label}</option>
            <option value="meeting">{ACTIVITY_TYPES.meeting.label}</option>
          </select>
        </FormField>

        <FormField label="العنوان" error={errors.title?.message}>
          <input {...register('title')} className={inputClassName} placeholder="عنوان النشاط" />
        </FormField>

        <RelatedEntityFields register={register} errors={errors} />
        <AssignmentFields register={register} />

        <FormField label="الأولوية" error={errors.priority?.message}>
          <select {...register('priority')} className={inputClassName}>
            {Object.values(ACTIVITY_PRIORITIES).map((priority) => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="بداية النشاط" error={errors.start_at?.message}>
          <input {...register('start_at')} type="datetime-local" className={inputClassName} />
        </FormField>

        <FormField label="نهاية النشاط" error={errors.end_at?.message}>
          <input {...register('end_at')} type="datetime-local" className={inputClassName} />
        </FormField>

        {type === 'call' ? <CallFields register={register} /> : null}
        {type === 'meeting' ? <MeetingFields register={register} watch={watch} errors={errors} /> : null}
      </div>

      <FormField label="الوصف">
        <textarea {...register('description')} className={textareaClassName} placeholder="اكتب أي ملاحظات أو هدف النشاط..." />
      </FormField>

      <ReminderFields register={register} />
    </form>
  )
}
