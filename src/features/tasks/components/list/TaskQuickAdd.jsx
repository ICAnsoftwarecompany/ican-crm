import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useCurrentUserId } from '../../hooks/useCurrentUserId'
import { useTaskMutations } from '../../hooks/useTasks'
import { getTaskTypeMeta } from '../../utils/taskMeta'
import { buildQuickTaskPayload, QUICK_TASK_TYPES, QUICK_TASK_WHEN, quickTaskValues } from '../../utils/taskQuickAdd'

const segmentClass = (active) => [
  'inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-black transition-colors',
  active ? 'bg-[var(--surface)] text-[var(--brand-accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]',
].join(' ')

/**
 * One line to add a task: type a title, pick the kind and when (optional), press Enter.
 * "More details" opens the full form with what was typed. `compact` hides the kind/when row
 * until the input is focused (header panel).
 */
export function TaskQuickAdd({ onOpenFull, onCreated, compact = false }) {
  const { t } = useTranslation()
  const currentUserId = useCurrentUserId()
  const { create } = useTaskMutations()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('follow_up')
  const [when, setWhen] = useState('today')
  const [focused, setFocused] = useState(false)
  const showOptions = !compact || focused || Boolean(title)

  const submit = async (event) => {
    event.preventDefault()
    if (!title.trim() || create.isPending) return
    try {
      await create.mutateAsync(buildQuickTaskPayload({ title, type, when }, { currentUserId }))
      toast.success(t('tasks.page.createdToast'))
      setTitle('')
      onCreated?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.page.createFailedToast')))
    }
  }

  return (
    <form
      onSubmit={submit}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm focus-within:border-[var(--brand-accent)]"
    >
      <div className="flex items-center gap-2">
        <Plus size={16} className="ms-1 shrink-0 text-[var(--brand-accent)]" />
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t('tasks.list.quickAdd.placeholder')}
          aria-label={t('tasks.list.quickAdd.label')}
          className="h-9 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-[#007A80] px-3 text-xs font-black text-white transition-colors hover:bg-[#00656A] disabled:opacity-40"
        >
          {create.isPending && <Loader2 size={13} className="animate-spin" />}
          {t('tasks.list.quickAdd.submit')}
        </button>
      </div>

      {showOptions && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-2">
          <div role="radiogroup" aria-label={t('tasks.form.typeLabel')} className="inline-flex flex-wrap rounded-lg bg-[var(--surface-2)] p-0.5">
            {QUICK_TASK_TYPES.map((value) => {
              const meta = getTaskTypeMeta(value, t)
              const Icon = meta.icon
              return (
                <button key={value} type="button" role="radio" aria-checked={type === value} onClick={() => setType(value)} className={segmentClass(type === value)}>
                  <Icon size={12} />
                  {meta.label}
                </button>
              )
            })}
          </div>
          <div role="radiogroup" aria-label={t('tasks.list.quickAdd.whenLabel')} className="inline-flex rounded-lg bg-[var(--surface-2)] p-0.5">
            {QUICK_TASK_WHEN.map((value) => (
              <button key={value} type="button" role="radio" aria-checked={when === value} onClick={() => setWhen(value)} className={segmentClass(when === value)}>
                {t(`tasks.list.quickAdd.when.${value}`)}
              </button>
            ))}
          </div>
          {onOpenFull && (
            <button
              type="button"
              onClick={() => { onOpenFull(quickTaskValues({ title, type, when })); setTitle('') }}
              className="ms-auto inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-black text-[var(--text-muted)] hover:text-[var(--brand-accent)]"
            >
              <SlidersHorizontal size={12} />
              {t('tasks.list.quickAdd.moreDetails')}
            </button>
          )}
        </div>
      )}
    </form>
  )
}
