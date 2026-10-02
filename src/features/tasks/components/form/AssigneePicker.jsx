import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, UserPlus, X } from 'lucide-react'
import { fieldLabelClass } from './taskFormStyles'

function userLabel(user) {
  return user?.name || user?.username || user?.email || `#${user?.id}`
}

/**
 * Who does the task: selected people as chips, a search box to add more, and "Me" as a shortcut.
 * `users` is the tenant user list; `value` the selected ids (numbers).
 */
export function AssigneePicker({ users = [], value = [], onChange, currentUserId }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const selected = useMemo(() => new Set((value || []).map(String)), [value])
  const byId = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return users
      .filter((user) => !selected.has(String(user.id)))
      .filter((user) => [user.name, user.username, user.email].join(' ').toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, selected, users])

  const add = (id) => {
    const num = Number(id)
    if (!Number.isFinite(num) || selected.has(String(num))) return
    onChange([...(value || []), num])
    setQuery('')
  }
  const remove = (id) => onChange((value || []).filter((item) => String(item) !== String(id)))
  const meSelected = currentUserId !== null && currentUserId !== undefined && selected.has(String(currentUserId))

  return (
    <div className={`${fieldLabelClass} sm:col-span-2`}>
      <span>{t('tasks.form.assigneesLabel')}</span>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {(value || []).map((id) => (
            <span key={id} className="inline-flex h-7 items-center gap-1 rounded-full bg-[var(--brand-accent-soft)] ps-2.5 pe-1 text-xs font-bold text-[var(--brand-accent)]">
              {String(id) === String(currentUserId) ? t('tasks.form.me') : userLabel(byId.get(String(id)) || { id })}
              <button type="button" onClick={() => remove(id)} aria-label={t('tasks.form.removeAssignee')} className="rounded-full p-0.5 hover:bg-[var(--surface)]">
                <X size={12} />
              </button>
            </span>
          ))}
          {!meSelected && currentUserId !== null && currentUserId !== undefined && (
            <button type="button" onClick={() => add(currentUserId)} className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-[var(--border)] px-2.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--brand-accent)]">
              <UserPlus size={12} />
              {t('tasks.form.assignMe')}
            </button>
          )}
          <span className="relative min-w-[140px] flex-1">
            <Search size={13} className="pointer-events-none absolute start-2 top-2 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && matches[0]) { event.preventDefault(); add(matches[0].id) }
              }}
              placeholder={t('tasks.form.searchPeople')}
              aria-label={t('tasks.form.searchPeople')}
              className="h-7 w-full bg-transparent ps-7 text-xs font-semibold text-[var(--text)] outline-none"
            />
          </span>
        </div>
        {matches.length > 0 && (
          <div role="listbox" className="mt-1 max-h-44 overflow-auto border-t border-[var(--border)] pt-1">
            {matches.map((user) => (
              <button
                key={user.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => add(user.id)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-start text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
              >
                {userLabel(user)}
                {user.email && <span dir="ltr" className="truncate text-[11px] text-[var(--text-muted)]">{user.email}</span>}
              </button>
            ))}
          </div>
        )}
        {query.trim() && !matches.length && (
          <p className="mt-1 px-2 text-[11px] text-[var(--text-muted)]">{t('tasks.fallback.noUsers')}</p>
        )}
      </div>
    </div>
  )
}
