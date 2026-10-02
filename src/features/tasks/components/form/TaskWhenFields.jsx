import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addDays, formatDateInput } from '../../../../shared/utils/dateTime'
import { ChoiceChips } from './ChoiceChips'
import { fieldInputClass, fieldLabelClass } from './taskFormStyles'

const WHEN_OPTIONS = ['today', 'tomorrow', 'date', 'none']

function modeFor(dueDate, now = new Date()) {
  if (!dueDate) return 'none'
  if (dueDate === formatDateInput(now)) return 'today'
  if (dueDate === formatDateInput(addDays(now, 1))) return 'tomorrow'
  return 'date'
}

/**
 * "When" for a task: Today / Tomorrow / Pick a date / No date, plus an optional time. Writes
 * `due_date` ("YYYY-MM-DD") and `due_time` ("HH:mm") on the form.
 */
export function TaskWhenFields({ form, onChange }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState(() => modeFor(form.due_date))

  const choose = (next) => {
    setMode(next)
    const now = new Date()
    if (next === 'today') onChange('due_date', formatDateInput(now))
    if (next === 'tomorrow') onChange('due_date', formatDateInput(addDays(now, 1)))
    if (next === 'date' && !form.due_date) onChange('due_date', formatDateInput(addDays(now, 2)))
    if (next === 'none') {
      onChange('due_date', '')
      onChange('due_time', '')
    }
  }

  return (
    <div className="grid gap-2 sm:col-span-2">
      <ChoiceChips
        label={t('tasks.form.whenLabel')}
        options={WHEN_OPTIONS}
        value={mode}
        onChange={choose}
        renderLabel={(option) => t(`tasks.form.when.${option}`)}
      />
      {mode !== 'none' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {mode === 'date' && (
            <label className={fieldLabelClass}>
              {t('tasks.form.dateLabel')}
              <input type="date" value={form.due_date} onChange={(event) => onChange('due_date', event.target.value)} className={fieldInputClass} />
            </label>
          )}
          <label className={fieldLabelClass}>
            {t('tasks.todo.form.timeOptional')}
            <input type="time" value={form.due_time} onChange={(event) => onChange('due_time', event.target.value)} className={fieldInputClass} />
          </label>
        </div>
      )}
    </div>
  )
}
