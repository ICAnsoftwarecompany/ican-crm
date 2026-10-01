import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { extractMessage } from '../../../../shared/utils/apiResponse'

/** One-line add: type a title, press Enter → a To-Do in the view's period, assigned to me. */
export function TodoQuickAdd({ view, onAdd, isAdding = false }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const value = title.trim()
    if (!value || isAdding) return
    try {
      await onAdd(value)
      setTitle('')
      toast.success(t('tasks.todo.quickAdd.created'))
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.todo.quickAdd.failed')))
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t('tasks.todo.quickAdd.placeholder', { period: t(`tasks.todo.views.${view}`) })}
        aria-label={t('tasks.todo.quickAdd.label')}
        className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand-accent)]"
      />
      <button
        type="submit"
        disabled={!title.trim() || isAdding}
        className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#007A80] px-3 text-xs font-black text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {t('tasks.todo.quickAdd.submit')}
      </button>
    </form>
  )
}
