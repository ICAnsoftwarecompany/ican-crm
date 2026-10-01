import { useTranslation } from 'react-i18next'
import { getTaskableTypes } from '../../constants/taskableTypes'
import { fieldInputClass, fieldLabelClass } from './taskFormStyles'

/**
 * What the task is about: nothing (personal task / To-Do) or a CRM record from the taskable
 * registry (lead, customer, …). Values are aliases; the payload builder converts them.
 */
export function TaskLinkFields({ form, onChange }) {
  const { t } = useTranslation()
  const types = getTaskableTypes()

  return (
    <>
      <label className={fieldLabelClass}>
        {t('tasks.taskable.label')}
        <select
          value={form.taskable_type || ''}
          onChange={(event) => onChange('taskable_type', event.target.value)}
          className={fieldInputClass}
        >
          <option value="">{t('tasks.taskable.none')}</option>
          {types.map((type) => <option key={type.id} value={type.id}>{t(type.labelKey)}</option>)}
        </select>
      </label>

      {form.taskable_type ? (
        <label className={fieldLabelClass}>
          {t('tasks.taskable.idLabel')}
          <input
            dir="ltr"
            inputMode="numeric"
            value={form.taskable_id}
            onChange={(event) => onChange('taskable_id', event.target.value)}
            placeholder={t('tasks.taskable.idPlaceholder')}
            className={fieldInputClass}
          />
        </label>
      ) : <div className="hidden sm:block" />}
    </>
  )
}
