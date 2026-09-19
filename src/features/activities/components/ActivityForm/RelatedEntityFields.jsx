import { useTranslation } from 'react-i18next'
import { FormField, inputClassName } from './ActivityFormFields'

export function RelatedEntityFields({ register, errors }) {
  const { t } = useTranslation()

  return (
    <>
      <FormField label={t('activities.form.relatedTypeLabel')} error={errors.related_type?.message}>
        <select {...register('related_type')} className={inputClassName}>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
        </select>
      </FormField>
      <FormField label={t('activities.form.relatedIdLabel')} error={errors.taskable_id?.message}>
        <input {...register('taskable_id')} className={inputClassName} placeholder={t('activities.form.relatedIdPlaceholder')} />
      </FormField>
    </>
  )
}
