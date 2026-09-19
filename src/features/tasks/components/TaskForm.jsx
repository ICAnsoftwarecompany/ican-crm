import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus } from 'lucide-react'

import { useTeams } from '../../teams/hooks/useTeams'
import { useUsers } from '../../users/hooks/useUsers'
import { getTaskPriorityMetaMap, getTaskTypeMetaMap } from '../utils/taskMeta'

const DEFAULT_FORM = {
  title: '',
  description: '',
  type: 'follow_up',
  priority: 'medium',
  visibility: 'shared',
  due_date: '',
  due_time: '',
  reminder_type: 'system',
  reminder_before: '30',
  reminder_unit: 'minutes',
  taskable_type: 'App\\Models\\Lead',
  taskable_id: '',
  users: [],
  teams: [],
  attachments: [],
}

function normalizeInitialValues(initialValues = {}) {
  return {
    ...DEFAULT_FORM,
    ...initialValues,
    users: Array.isArray(initialValues?.users) ? initialValues.users.map((item) => Number(item)).filter(Number.isFinite) : [],
    teams: Array.isArray(initialValues?.teams) ? initialValues.teams.map((item) => Number(item)).filter(Number.isFinite) : [],
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

export function TaskForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSaving = false,
  hideTaskableFields = false,
}) {
  const { t } = useTranslation()
  const resolvedSubmitLabel = submitLabel ?? t('tasks.form.submitLabel')
  const [form, setForm] = useState(() => normalizeInitialValues(initialValues))
  const usersQuery = useUsers()
  const teamsQuery = useTeams()

  const users = useMemo(() => toEntityList(usersQuery.data), [usersQuery.data])
  const teams = useMemo(() => toEntityList(teamsQuery.data), [teamsQuery.data])

  const taskTypes = useMemo(() => Object.entries(getTaskTypeMetaMap(t)).map(([value, meta]) => ({ value, label: meta.label })), [t])
  const taskPriorities = useMemo(() => Object.entries(getTaskPriorityMetaMap(t)).map(([value, meta]) => ({ value, label: meta.label })), [t])
  const taskVisibility = useMemo(() => [
    { value: 'private', label: t('tasks.visibility.private') },
    { value: 'shared', label: t('tasks.visibility.shared') },
  ], [t])
  const reminderTypes = useMemo(() => [
    { value: 'system', label: t('tasks.reminderTypes.system') },
    { value: 'gmail', label: t('tasks.reminderTypes.gmail') },
  ], [t])
  const reminderUnits = useMemo(() => [
    { value: 'minutes', label: t('activities.scheduleDialog.minutesOption') },
    { value: 'hours', label: t('activities.scheduleDialog.hoursOption') },
    { value: 'days', label: t('activities.scheduleDialog.daysOption') },
  ], [t])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const toggleListValue = (field, rawValue) => {
    const value = Number(rawValue)
    if (!Number.isFinite(value)) return

    setForm((current) => {
      const set = new Set(Array.isArray(current[field]) ? current[field] : [])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      return { ...current, [field]: Array.from(set) }
    })
  }

  const handleAttachments = (event) => {
    const files = Array.from(event.target.files || [])
    updateField('attachments', files)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || isSaving) return

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim?.() || '',
      type: form.type,
      priority: form.priority,
      visibility: form.visibility,
      due_time: form.due_time || '',
      due_date: form.due_date || '',
      reminder_type: form.reminder_type,
      reminder_before: form.reminder_before || '',
      reminder_unit: form.reminder_unit,
      taskable_type: form.taskable_type,
      taskable_id: form.taskable_id || '',
      users: form.users,
      teams: form.teams,
      attachments: form.attachments,
    }

    await onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          {t('tasks.form.titleLabel')}
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder={t('tasks.form.titlePlaceholder')}
            className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          {t('tasks.form.descriptionLabel')}
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={3}
            className="min-h-20 resize-y rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.typeLabel')}
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {taskTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.priorityLabel')}
          <select value={form.priority} onChange={(event) => updateField('priority', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {taskPriorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.dateLabel')}
          <input type="date" value={form.due_date} onChange={(event) => updateField('due_date', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.timeLabel')}
          <input type="time" value={form.due_time} onChange={(event) => updateField('due_time', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.visibilityLabel')}
          <select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {taskVisibility.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.reminderTypeLabel')}
          <select value={form.reminder_type} onChange={(event) => updateField('reminder_type', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {reminderTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.reminderBeforeLabel')}
          <input type="number" min="0" value={form.reminder_before} onChange={(event) => updateField('reminder_before', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          {t('tasks.form.reminderUnitLabel')}
          <select value={form.reminder_unit} onChange={(event) => updateField('reminder_unit', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {reminderUnits.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        {!hideTaskableFields && (
          <>
            <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
              taskable_type
              <input value={form.taskable_type} onChange={(event) => updateField('taskable_type', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
            </label>

            <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
              taskable_id
              <input value={form.taskable_id} onChange={(event) => updateField('taskable_id', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
            </label>
          </>
        )}

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          {t('tasks.form.usersLabel')}
          <div className="max-h-28 overflow-auto rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] p-2">
            {users.length ? users.map((user) => {
              const checked = form.users.includes(Number(user.id))
              return (
                <label key={user.id} className="mb-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <input type="checkbox" checked={checked} onChange={() => toggleListValue('users', user.id)} />
                  <span>{user.name || user.username || user.email || `User ${user.id}`}</span>
                </label>
              )
            }) : <div className="text-xs text-[var(--text-muted)]">{t('tasks.fallback.noUsers')}</div>}
          </div>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          {t('tasks.form.teamsLabel')}
          <div className="max-h-28 overflow-auto rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] p-2">
            {teams.length ? teams.map((team) => {
              const checked = form.teams.includes(Number(team.id))
              return (
                <label key={team.id} className="mb-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <input type="checkbox" checked={checked} onChange={() => toggleListValue('teams', team.id)} />
                  <span>{team.name || `Team ${team.id}`}</span>
                </label>
              )
            }) : <div className="text-xs text-[var(--text-muted)]">{t('tasks.fallback.noTeams')}</div>}
          </div>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          {t('tasks.form.attachmentsLabel')}
          <input type="file" multiple onChange={handleAttachments} className="block h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-2 text-xs" />
        </label>
      </div>

      <button
        type="submit"
        disabled={!form.title.trim() || isSaving}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#007A80] px-4 text-sm font-black text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {resolvedSubmitLabel}
      </button>
    </form>
  )
}
