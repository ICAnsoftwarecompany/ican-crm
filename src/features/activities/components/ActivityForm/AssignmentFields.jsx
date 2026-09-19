import { useTranslation } from 'react-i18next'
import { FormField, inputClassName } from './ActivityFormFields'

export function AssignmentFields({ register }) {
  const { t } = useTranslation()

  return (
    <>
      <FormField label={t('activities.form.assignedUserLabel')}>
        <input {...register('assigned_to')} className={inputClassName} placeholder={t('activities.form.assignedUserPlaceholder')} />
      </FormField>
      <FormField label={t('activities.scheduleDialog.teamLabel')}>
        <input {...register('team_id')} className={inputClassName} placeholder={t('activities.form.teamPlaceholder')} />
      </FormField>
    </>
  )
}
