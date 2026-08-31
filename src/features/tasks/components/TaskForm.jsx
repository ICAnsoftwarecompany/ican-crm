import { useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'

import { useTeams } from '../../teams/hooks/useTeams'
import { useUsers } from '../../users/hooks/useUsers'

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

const TASK_TYPES = [
  { value: 'call', label: 'مكالمة' },
  { value: 'email', label: 'بريد' },
  { value: 'meeting', label: 'اجتماع' },
  { value: 'follow_up', label: 'متابعة' },
  { value: 'todo', label: 'مهمة' },
]

const TASK_PRIORITIES = [
  { value: 'low', label: 'منخفضة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'high', label: 'عالية' },
  { value: 'urgent', label: 'عاجلة' },
]

const TASK_VISIBILITY = [
  { value: 'private', label: 'خاصة' },
  { value: 'shared', label: 'مشتركة' },
]

const REMINDER_TYPES = [
  { value: 'system', label: 'System' },
  { value: 'gmail', label: 'Gmail' },
]

const REMINDER_UNITS = [
  { value: 'minutes', label: 'دقائق' },
  { value: 'hours', label: 'ساعات' },
  { value: 'days', label: 'أيام' },
]

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
  submitLabel = 'حفظ المهمة',
  isSaving = false,
  hideTaskableFields = false,
}) {
  const [form, setForm] = useState(() => normalizeInitialValues(initialValues))
  const usersQuery = useUsers()
  const teamsQuery = useTeams()

  const users = useMemo(() => toEntityList(usersQuery.data), [usersQuery.data])
  const teams = useMemo(() => toEntityList(teamsQuery.data), [teamsQuery.data])

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
          عنوان المهمة
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="مثال: متابعة العميل"
            className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          الوصف
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={3}
            className="min-h-20 resize-y rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          النوع
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {TASK_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          الأولوية
          <select value={form.priority} onChange={(event) => updateField('priority', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {TASK_PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          التاريخ
          <input type="date" value={form.due_date} onChange={(event) => updateField('due_date', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          الوقت
          <input type="time" value={form.due_time} onChange={(event) => updateField('due_time', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          الظهور
          <select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {TASK_VISIBILITY.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          نوع التذكير
          <select value={form.reminder_type} onChange={(event) => updateField('reminder_type', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {REMINDER_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          قبل التذكير
          <input type="number" min="0" value={form.reminder_before} onChange={(event) => updateField('reminder_before', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm" />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          وحدة التذكير
          <select value={form.reminder_unit} onChange={(event) => updateField('reminder_unit', event.target.value)} className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm">
            {REMINDER_UNITS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
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
          المستخدمون
          <div className="max-h-28 overflow-auto rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] p-2">
            {users.length ? users.map((user) => {
              const checked = form.users.includes(Number(user.id))
              return (
                <label key={user.id} className="mb-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <input type="checkbox" checked={checked} onChange={() => toggleListValue('users', user.id)} />
                  <span>{user.name || user.username || user.email || `User ${user.id}`}</span>
                </label>
              )
            }) : <div className="text-xs text-[var(--text-muted)]">لا يوجد مستخدمون</div>}
          </div>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          الفرق
          <div className="max-h-28 overflow-auto rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] p-2">
            {teams.length ? teams.map((team) => {
              const checked = form.teams.includes(Number(team.id))
              return (
                <label key={team.id} className="mb-1 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <input type="checkbox" checked={checked} onChange={() => toggleListValue('teams', team.id)} />
                  <span>{team.name || `Team ${team.id}`}</span>
                </label>
              )
            }) : <div className="text-xs text-[var(--text-muted)]">لا توجد فرق</div>}
          </div>
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)] sm:col-span-2">
          المرفقات
          <input type="file" multiple onChange={handleAttachments} className="block h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-2 text-xs" />
        </label>
      </div>

      <button
        type="submit"
        disabled={!form.title.trim() || isSaving}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#007A80] px-4 text-sm font-black text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {submitLabel}
      </button>
    </form>
  )
}
