import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Loader2, Plus } from 'lucide-react'

import { useTeams } from '../../teams/hooks/useTeams'
import { useUsers } from '../../users/hooks/useUsers'
import { useCurrentUserId } from '../hooks/useCurrentUserId'
import { getTaskTypeMetaMap } from '../utils/taskMeta'
import { resolveTaskableAlias } from '../constants/taskableTypes'
import { buildTaskPayload, TASK_FORM_DEFAULTS } from '../utils/taskPayload'
import { AssigneePicker } from './form/AssigneePicker'
import { ChoiceChips } from './form/ChoiceChips'
import { TaskLinkFields } from './form/TaskLinkFields'
import { TaskScheduleFields } from './form/TaskScheduleFields'
import { TaskWhenFields } from './form/TaskWhenFields'
import { fieldInputClass, fieldLabelClass } from './form/taskFormStyles'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

function toIds(value) {
  return Array.isArray(value) ? value.map((item) => Number(item?.id ?? item)).filter(Number.isFinite) : []
}

function normalizeInitialValues(initialValues = {}, currentUserId) {
  const values = { ...TASK_FORM_DEFAULTS, ...(initialValues || {}) }
  const isTodo = values.type === 'todo'
  const users = toIds(initialValues?.users)
  const me = Number(currentUserId)
  return {
    ...values,
    // A To-Do is private by default unless the caller says otherwise.
    visibility: initialValues?.visibility || (isTodo ? 'private' : TASK_FORM_DEFAULTS.visibility),
    taskable_type: resolveTaskableAlias(values.taskable_type),
    taskable_id: values.taskable_id ? String(values.taskable_id) : '',
    // New task: assigned to me until I change it.
    users: users.length || initialValues?.users ? users : (Number.isFinite(me) && currentUserId !== null ? [me] : []),
    teams: toIds(initialValues?.teams),
    attachments: [],
  }
}

function toEntityList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.teams)) return value.teams
  if (Array.isArray(value?.users)) return value.users
  return []
}

/**
 * The full task form, ordered by how often a field is used: title, kind, when, who it is about,
 * who does it, priority. Notes, visibility, reminder, teams and attachments sit under "More options".
 */
export function TaskForm({ initialValues, onSubmit, submitLabel, isSaving = false, hideTaskableFields = false }) {
  const { t } = useTranslation()
  const currentUserId = useCurrentUserId()
  const [form, setForm] = useState(() => normalizeInitialValues(initialValues, currentUserId))
  const [visibilityTouched, setVisibilityTouched] = useState(Boolean(initialValues?.visibility))
  const [showMore, setShowMore] = useState(Boolean(initialValues?.description))
  const users = toEntityList(useUsers().data)
  const teams = toEntityList(useTeams().data)
  const isTodo = form.type === 'todo'

  // To-Dos have their own short form; 'todo' is offered only when editing one.
  const initialType = initialValues?.type
  const typeMap = getTaskTypeMetaMap(t)
  const types = Object.keys(typeMap).filter((value) => value !== 'todo' || initialType === 'todo')

  const updateField = (field, value) => {
    if (field === 'visibility') setVisibilityTouched(true)
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'type' && !visibilityTouched) next.visibility = value === 'todo' ? 'private' : 'shared'
      if (field === 'taskable_type') { next.taskable_id = ''; next.taskable_name = '' }
      return next
    })
  }

  const toggleTeam = (id) => setForm((current) => {
    const set = new Set(current.teams)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    return { ...current, teams: [...set] }
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || isSaving) return
    await onSubmit?.(buildTaskPayload(form, { currentUserId }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        autoFocus
        value={form.title}
        onChange={(event) => updateField('title', event.target.value)}
        placeholder={t('tasks.form.titlePlaceholder')}
        aria-label={t('tasks.form.titleLabel')}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-base font-bold text-[var(--text)] outline-none focus:border-[var(--brand-accent)]"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ChoiceChips
            label={t('tasks.form.typeLabel')}
            options={types}
            value={form.type}
            onChange={(value) => updateField('type', value)}
            renderLabel={(value) => typeMap[value]?.label || value}
            renderIcon={(value) => typeMap[value]?.icon}
          />
        </div>

        {isTodo ? <TaskScheduleFields form={form} onChange={updateField} /> : <TaskWhenFields form={form} onChange={updateField} />}

        {!hideTaskableFields && <TaskLinkFields form={form} onChange={updateField} />}

        <AssigneePicker users={users} value={form.users} onChange={(value) => updateField('users', value)} currentUserId={currentUserId} />

        <div className="sm:col-span-2">
          <ChoiceChips
            label={t('tasks.form.priorityLabel')}
            options={PRIORITIES}
            value={form.priority}
            onChange={(value) => updateField('priority', value)}
            renderLabel={(value) => t(`activities.scheduleDialog.priorityOptions.${value}`)}
          />
        </div>
      </div>

      <section className="rounded-xl border border-[var(--border)]">
        <button
          type="button"
          onClick={() => setShowMore((value) => !value)}
          aria-expanded={showMore}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-black text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {t('tasks.form.moreOptions')}
          <ChevronDown size={14} className={showMore ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        {showMore && (
          <div className="grid gap-3 border-t border-[var(--border)] p-3 sm:grid-cols-2">
            <label className={`${fieldLabelClass} sm:col-span-2`}>
              {t('tasks.form.descriptionLabel')}
              <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={3} className="min-h-20 resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--brand-accent)]" />
            </label>

            <label className={fieldLabelClass}>
              {t('tasks.form.visibilityLabel')}
              <select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)} className={fieldInputClass}>
                <option value="private">{t('tasks.visibility.private')}</option>
                <option value="shared">{t('tasks.visibility.shared')}</option>
              </select>
            </label>

            <label className={fieldLabelClass}>
              {t('tasks.form.reminderTypeLabel')}
              <select value={form.reminder_type} onChange={(event) => updateField('reminder_type', event.target.value)} className={fieldInputClass}>
                <option value="system">{t('tasks.reminderTypes.system')}</option>
                <option value="gmail">{t('tasks.reminderTypes.gmail')}</option>
              </select>
            </label>

            <label className={fieldLabelClass}>
              {t('tasks.form.reminderBeforeLabel')}
              <input type="number" min="0" value={form.reminder_before} onChange={(event) => updateField('reminder_before', event.target.value)} className={fieldInputClass} />
            </label>

            <label className={fieldLabelClass}>
              {t('tasks.form.reminderUnitLabel')}
              <select value={form.reminder_unit} onChange={(event) => updateField('reminder_unit', event.target.value)} className={fieldInputClass}>
                {['minutes', 'hours', 'days'].map((unit) => <option key={unit} value={unit}>{t(`activities.scheduleDialog.${unit}Option`)}</option>)}
              </select>
            </label>

            {teams.length > 0 && (
              <div className={`${fieldLabelClass} sm:col-span-2`}>
                <span>{t('tasks.form.teamsLabel')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {teams.map((team) => {
                    const id = Number(team.id)
                    const active = form.teams.includes(id)
                    return (
                      <button key={team.id} type="button" aria-pressed={active} onClick={() => toggleTeam(id)} className={`h-7 rounded-full border px-2.5 text-xs font-bold ${active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                        {team.name || `#${team.id}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <label className={`${fieldLabelClass} sm:col-span-2`}>
              {t('tasks.form.attachmentsLabel')}
              <input type="file" multiple onChange={(event) => updateField('attachments', Array.from(event.target.files || []))} className="block rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-xs" />
            </label>
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={!form.title.trim() || isSaving}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#007A80] px-4 text-sm font-black text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {submitLabel ?? t('tasks.form.submitLabel')}
      </button>
    </form>
  )
}
