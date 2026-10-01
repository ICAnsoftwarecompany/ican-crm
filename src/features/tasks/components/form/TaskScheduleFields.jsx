import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../../shared/utils/dateTime'
import { buildTodoSchedule, TODO_PERIODS } from '../../utils/todoPeriods'
import { fieldHintClass, fieldInputClass, fieldLabelClass } from './taskFormStyles'

/**
 * When the task happens. Any task: date + time. A To-Do can instead belong to a period
 * (day / week / month): it is then due by the last day of that period, with no time.
 */
export function TaskScheduleFields({ form, onChange }) {
  const { t, i18n } = useTranslation()
  const isTodo = form.type === 'todo'
  const period = isTodo ? form.period_type : ''
  const schedule = period ? buildTodoSchedule(period, form.period_date || new Date()) : null

  return (
    <>
      {isTodo && (
        <label className={`${fieldLabelClass} sm:col-span-2`}>
          {t('tasks.form.periodLabel')}
          <div role="radiogroup" aria-label={t('tasks.form.periodLabel')} className="flex flex-wrap gap-1.5">
            {['', ...TODO_PERIODS].map((value) => {
              const active = (form.period_type || '') === value
              return (
                <button
                  key={value || 'exact'}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('period_type', value)}
                  className={[
                    'h-9 rounded-lg border px-3 text-xs font-black transition-colors',
                    active
                      ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                      : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]',
                  ].join(' ')}
                >
                  {t(`tasks.form.periodOptions.${value || 'exact'}`)}
                </button>
              )
            })}
          </div>
        </label>
      )}

      {period ? (
        <label className={`${fieldLabelClass} sm:col-span-2`}>
          {t('tasks.form.periodDateLabel')}
          <input
            type="date"
            value={form.period_date}
            onChange={(event) => onChange('period_date', event.target.value)}
            className={fieldInputClass}
          />
          {schedule && (
            <span className={fieldHintClass}>
              {t('tasks.form.periodHint', { date: formatDate(schedule.due_date, i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }) })}
            </span>
          )}
        </label>
      ) : (
        <>
          <label className={fieldLabelClass}>
            {t('tasks.form.dateLabel')}
            <input type="date" value={form.due_date} onChange={(event) => onChange('due_date', event.target.value)} className={fieldInputClass} />
          </label>
          <label className={fieldLabelClass}>
            {t('tasks.form.timeLabel')}
            <input type="time" value={form.due_time} onChange={(event) => onChange('due_time', event.target.value)} className={fieldInputClass} />
          </label>
        </>
      )}
    </>
  )
}
