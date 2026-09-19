import { useTranslation } from 'react-i18next'
import { FormField, inputClassName } from './ActivityFormFields'

export function MeetingFields({ register, watch, errors }) {
  const { t } = useTranslation()
  const mode = watch('mode')

  return (
    <>
      <FormField label={t('activities.scheduleDialog.meetingModeLabel')}>
        <select {...register('mode')} className={inputClassName}>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </FormField>
      {mode === 'online' ? (
        <FormField label={t('activities.scheduleDialog.meetingLinkLabel')} error={errors.meeting_link?.message}>
          <input {...register('meeting_link')} className={inputClassName} placeholder="https://..." />
        </FormField>
      ) : (
        <FormField label={t('activities.form.meetingLocationLabel')} error={errors.location?.message}>
          <input {...register('location')} className={inputClassName} placeholder={t('activities.meetingDrawer.fields.location')} />
        </FormField>
      )}
    </>
  )
}
