import { useTranslation } from 'react-i18next'
import { FormField, inputClassName } from './ActivityFormFields'

export function CallFields({ register }) {
  const { t } = useTranslation()

  return (
    <>
      <FormField label={t('activities.form.phoneLabel')}>
        <input {...register('phone')} className={inputClassName} placeholder={t('activities.form.phonePlaceholder')} />
      </FormField>
      <FormField label={t('activities.scheduleDialog.callProviderLabel')}>
        <select {...register('call_provider')} className={inputClassName}>
          <option value="manual">Manual</option>
          <option value="cloud_call_center">Cloud Call Center</option>
        </select>
      </FormField>
    </>
  )
}
