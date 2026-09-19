import { useTranslation } from 'react-i18next'
import { getActivityNextActions, getNextActionConfig } from '../../utils/activityNextActions'

export function NextActionFields({ register, watch, errors, inputClassName }) {
  const { t } = useTranslation()
  const nextAction = watch('next_action')
  const config = getNextActionConfig(nextAction, t)
  const actions = getActivityNextActions(t)

  return (
    <>
      <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
        <span>{t('activities.meetingDrawer.fields.nextAction')}</span>
        <select {...register('next_action')} className={inputClassName}>
          {actions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        {errors.next_action ? <span className="block text-[11px] text-red-600">{errors.next_action.message}</span> : null}
      </label>
      {config.requiresDate ? (
        <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
          <span>{t('activities.nextActionFields.dateLabel')}</span>
          <input {...register('next_action_at')} type="datetime-local" className={inputClassName} />
          {errors.next_action_at ? <span className="block text-[11px] text-red-600">{errors.next_action_at.message}</span> : null}
        </label>
      ) : null}
    </>
  )
}
