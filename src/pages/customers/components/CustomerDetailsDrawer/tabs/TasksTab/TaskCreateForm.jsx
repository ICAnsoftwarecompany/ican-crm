import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'

import { TASK_PRIORITIES, TASK_TYPES } from './taskUtils'

const INITIAL_FORM = {
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
}

export function TaskCreateForm({ leadId, onSubmit, isSaving }) {
  const [form, setForm] = useState(INITIAL_FORM)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !leadId || isSaving) return

    await onSubmit(form)
    setForm(INITIAL_FORM)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#BEEFF2] bg-white p-3 shadow-sm">
      <div className="grid gap-2">
        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          عنوان المهمة
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="مثال: متابعة العميل"
            className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          />
        </label>

        <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
          الوصف
          <textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="اكتب تفاصيل مختصرة للمهمة"
            rows={3}
            className="min-h-20 resize-y rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          />
        </label>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
            النوع
            <select
              value={form.type}
              onChange={(event) => updateField('type', event.target.value)}
              className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)]"
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
            الأولوية
            <select
              value={form.priority}
              onChange={(event) => updateField('priority', event.target.value)}
              className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)]"
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
            التاريخ
            <input
              type="date"
              value={form.due_date}
              onChange={(event) => updateField('due_date', event.target.value)}
              className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)]"
            />
          </label>

          <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
            الوقت
            <input
              type="time"
              value={form.due_time}
              onChange={(event) => updateField('due_time', event.target.value)}
              className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)]"
            />
          </label>

          <label className="grid gap-1 text-xs font-bold text-[var(--text)]">
            الظهور
            <select
              value={form.visibility}
              onChange={(event) => updateField('visibility', event.target.value)}
              className="h-10 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-3 text-sm text-[var(--text)]"
            >
              <option value="shared">مشتركة</option>
              <option value="private">خاصة</option>
            </select>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={!form.title.trim() || !leadId || isSaving}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#007A80] px-4 text-sm font-black text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        إنشاء مهمة
      </button>
    </form>
  )
}
