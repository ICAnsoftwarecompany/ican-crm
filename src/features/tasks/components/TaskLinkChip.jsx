import { useTranslation } from 'react-i18next'
import { Link2, UserRound } from 'lucide-react'
import { getTaskableLabelKey, getTaskTaskable } from '../constants/taskableTypes'

/** "Lead #15 · Ahmed" for a linked task, "Personal" for a To-Do with no record (when `showPersonal`). */
export function TaskLinkChip({ task, showPersonal = true, className = '' }) {
  const { t } = useTranslation()
  const link = getTaskTaskable(task)

  if (!link) {
    if (!showPersonal) return null
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)] ${className}`}>
        <UserRound size={12} />
        {t('tasks.taskable.personal')}
      </span>
    )
  }

  const typeLabel = t(getTaskableLabelKey(link.type))
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full bg-[var(--brand-accent-soft)] px-2 py-1 text-[11px] font-bold text-[var(--brand-accent)] ${className}`}>
      <Link2 size={12} className="shrink-0" />
      <span className="truncate">
        {typeLabel} <span dir="ltr">#{link.id}</span>{link.name ? ` · ${link.name}` : ''}
      </span>
    </span>
  )
}
