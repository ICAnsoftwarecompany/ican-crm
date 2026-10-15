import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { cn } from '../../../../shared/utils/cn'
import { TEAM_ROLES } from '../../constants/dealOptions'
import { dealInputClass } from '../common/FieldLabel'

/**
 * Searchable checklist of teams or users for the wizard's team step. A checked row gets a role select.
 * `items`: `[{ id, name, meta? }]`; `selected`: `Map<id, role>`; `locked`: `Map<id, note>` (checked, not editable).
 * `headerAction`: a node beside the title; `emptyAction`: a node under the empty message (e.g. "create a quick team").
 */
export function TeamPicker({ title, description, items, selected, locked = new Map(), onToggle, onRole, isLoading, error, onRetry, emptyTitle, emptyDescription, headerAction, emptyAction }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return text ? items.filter((item) => `${item.name} ${item.meta || ''}`.toLowerCase().includes(text)) : items
  }, [items, query])

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
          <p className="text-xs leading-5 text-[var(--text-muted)]">{description}</p>
        </div>
        {headerAction}
      </header>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.wizard.team.search')} aria-label={`${title} — ${t('dealWorkspace.wizard.team.search')}`} />
      </div>
      <ResourceState isLoading={isLoading} error={error} onRetry={onRetry} empty={!items.length && !emptyAction} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
        {!items.length ? <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} /> : (
        <ul className="max-h-72 space-y-1 overflow-y-auto pe-1">
          {visible.map((item) => {
            const lockNote = locked.get(item.id)
            const checked = Boolean(lockNote) || selected.has(item.id)
            return (
              <li key={item.id} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5', checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}>
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={checked} disabled={Boolean(lockNote)} onChange={() => onToggle(item.id)} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-[var(--text)]">{item.name}</span>
                    {(lockNote || item.meta) && <span className="block truncate text-xs text-[var(--text-muted)]">{lockNote || item.meta}</span>}
                  </span>
                </label>
                {checked && !lockNote && (
                  <select className={`${dealInputClass.replace('w-full', '')} h-8 w-36 shrink-0`} value={selected.get(item.id)} onChange={(event) => onRole(item.id, event.target.value)} aria-label={`${t('dealWorkspace.team.role')} — ${item.name}`}>
                    {TEAM_ROLES.map((role) => <option key={role} value={role}>{t(`dealWorkspace.options.teamRole.${role}`)}</option>)}
                  </select>
                )}
              </li>
            )
          })}
          {!visible.length && <li className="p-3 text-center text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.noMatch')}</li>}
        </ul>
        )}
      </ResourceState>
    </section>
  )
}
