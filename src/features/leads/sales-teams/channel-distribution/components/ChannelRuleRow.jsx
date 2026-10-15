import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Loader2, Trash2 } from 'lucide-react'
import { Avatar } from '../../../../../shared/components/ui/Avatar'
import { cn } from '../../../../../shared/utils/cn'
import { priorityTakenBy } from '../utils/channelDistributionModel'

/** One user in a channel's order: priority (editable), user, page / number, active, move up / down, delete. */
export function ChannelRuleRow({ rule, rules, userName, identifierLabel, previous, next, busy, actions, onDelete }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(null)
  const value = draft ?? String(rule.priority)
  const number = Number(value)
  const invalid = draft !== null && (!Number.isInteger(number) || number < 1)
  const taken = draft !== null && !invalid ? priorityTakenBy(rules, { channel: rule.channel, identifier: rule.identifier, priority: number, exceptId: rule.id }) : null

  const commit = async () => {
    if (draft === null || invalid || taken) return
    if (number === rule.priority) {
      setDraft(null)
      return
    }
    if (await actions.setPriority(rule, number)) setDraft(null)
  }

  return (
    <li className={cn('grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2', !rule.active && 'opacity-70')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-0.5">
          <button type="button" disabled={busy || !previous} onClick={() => actions.swap(rule, previous)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label={t('salesTeams.channels.rules.moveUp', { name: userName })}><ArrowUp size={14} /></button>
          <button type="button" disabled={busy || !next} onClick={() => actions.swap(rule, next)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label={t('salesTeams.channels.rules.moveDown', { name: userName })}><ArrowDown size={14} /></button>
        </span>
        <input
          type="number"
          min="1"
          step="1"
          value={value}
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => { if (event.key === 'Enter') commit(); if (event.key === 'Escape') setDraft(null) }}
          className={cn('h-8 w-14 rounded-md border bg-[var(--surface)] text-center text-sm font-bold text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--brand-accent)]', invalid || taken ? 'border-red-500' : 'border-[var(--border)]')}
          aria-label={t('salesTeams.channels.rules.priorityOf', { name: userName })}
        />
        <Avatar name={userName} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--text)]">{userName}</span>
          <span className="block truncate text-xs text-[var(--text-muted)]">{identifierLabel}</span>
        </span>
        {busy && <Loader2 size={14} className="animate-spin text-[var(--brand-accent)]" aria-hidden="true" />}
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
          <input type="checkbox" role="switch" className="h-4 w-4 accent-[var(--brand-accent)]" checked={rule.active} disabled={busy} onChange={() => actions.toggle(rule)} aria-label={t('salesTeams.channels.rules.activeOf', { name: userName })} />
          {t(rule.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive')}
        </label>
        <button type="button" disabled={busy} onClick={() => onDelete(rule)} className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600 disabled:opacity-30" aria-label={t('salesTeams.channels.rules.deleteOf', { name: userName })}>
          <Trash2 size={15} />
        </button>
      </div>
      {invalid && <p className="text-[11px] text-red-600 dark:text-red-300">{t('salesTeams.errors.channelPriorityInvalid')}</p>}
      {taken && <p className="text-[11px] text-red-600 dark:text-red-300">{t('salesTeams.channels.rules.priorityTakenBy', { value: number })}</p>}
    </li>
  )
}
