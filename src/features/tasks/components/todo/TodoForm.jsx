import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Loader2, Plus } from 'lucide-react'
import { useCurrentUserId } from '../../hooks/useCurrentUserId'
import { buildTodoPayload, TODO_FORM_DEFAULTS, TODO_PRIORITIES, TODO_WHEN_OPTIONS, todoHasTime } from '../../utils/todoForm'
import { TaskLinkFields } from '../form/TaskLinkFields'
import { fieldInputClass, fieldLabelClass } from '../form/taskFormStyles'

function ChoiceChips({ label, options, value, onChange, renderLabel }) {
  return (
    <div className={fieldLabelClass}>
      <span>{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={[
                'h-8 rounded-lg border px-2.5 text-xs font-black transition-colors',
                active
                  ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              {renderLabel(option)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The To-Do form: a title and *when* (today / tomorrow / this week / this month / a date) are all a
 * to-do needs. Priority and notes are one tap away; a linked customer and a reminder sit under
 * "More options". Saved as a task with `type: 'todo'` (see utils/todoForm.js).
 */
export function TodoForm({ initialValues, onSubmit, isSaving = false, submitLabel }) {
  const { t } = useTranslation()
  const currentUserId = useCurrentUserId()
  const [values, setValues] = useState(() => ({ ...TODO_FORM_DEFAULTS, ...(initialValues || {}) }))
  const hasExtras = Boolean(values.taskable_id || todoHasTime(values))
  const [showMore, setShowMore] = useState(hasExtras)

  const update = (field, value) => setValues((current) => {
    const next = { ...current, [field]: value }
    if (field === 'taskable_type') { next.taskable_id = ''; next.taskable_name = '' }
    return next
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!values.title.trim() || isSaving) return
    await onSubmit?.(buildTodoPayload(values, { currentUserId }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        autoFocus
        value={values.title}
        onChange={(event) => update('title', event.target.value)}
        placeholder={t('tasks.todo.form.titlePlaceholder')}
        aria-label={t('tasks.todo.form.titleLabel')}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-base font-bold text-[var(--text)] outline-none focus:border-[var(--brand-accent)]"
      />

      <ChoiceChips
        label={t('tasks.todo.form.whenLabel')}
        options={TODO_WHEN_OPTIONS}
        value={values.when}
        onChange={(option) => update('when', option)}
        renderLabel={(option) => t(`tasks.todo.form.when.${option}`)}
      />

      {values.when === 'date' && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className={fieldLabelClass}>
            {t('tasks.form.dateLabel')}
            <input type="date" value={values.date} onChange={(event) => update('date', event.target.value)} className={fieldInputClass} />
          </label>
          <label className={fieldLabelClass}>
            {t('tasks.todo.form.timeOptional')}
            <input type="time" value={values.time} onChange={(event) => update('time', event.target.value)} className={fieldInputClass} />
          </label>
        </div>
      )}

      <ChoiceChips
        label={t('tasks.form.priorityLabel')}
        options={TODO_PRIORITIES}
        value={values.priority}
        onChange={(option) => update('priority', option)}
        renderLabel={(option) => t(`activities.scheduleDialog.priorityOptions.${option}`)}
      />

      <label className={fieldLabelClass}>
        {t('tasks.todo.form.notesLabel')}
        <textarea
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
          rows={2}
          placeholder={t('tasks.todo.form.notesPlaceholder')}
          className="min-h-16 resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--brand-accent)]"
        />
      </label>

      <section className="rounded-xl border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setShowMore((value) => !value)}
          aria-expanded={showMore}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-black text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {t('tasks.todo.form.moreOptions')}
          <ChevronDown size={14} className={showMore ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        {showMore && (
          <div className="grid gap-2 border-t border-[var(--border)] p-3 sm:grid-cols-2">
            <TaskLinkFields form={values} onChange={update} />
            {todoHasTime(values) ? (
              <>
                <label className={fieldLabelClass}>
                  {t('tasks.form.reminderBeforeLabel')}
                  <input type="number" min="0" value={values.reminder_before} onChange={(event) => update('reminder_before', event.target.value)} className={fieldInputClass} />
                </label>
                <label className={fieldLabelClass}>
                  {t('tasks.form.reminderUnitLabel')}
                  <select value={values.reminder_unit} onChange={(event) => update('reminder_unit', event.target.value)} className={fieldInputClass}>
                    {['minutes', 'hours', 'days'].map((unit) => (
                      <option key={unit} value={unit}>{t(`activities.scheduleDialog.${unit}Option`)}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] sm:col-span-2">{t('tasks.todo.form.reminderNeedsTime')}</p>
            )}
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={!values.title.trim() || isSaving}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#007A80] px-4 text-sm font-black text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {submitLabel ?? t('tasks.todo.form.submit')}
      </button>
    </form>
  )
}
