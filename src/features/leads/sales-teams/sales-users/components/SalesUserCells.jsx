import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { checkPriority } from '../utils/salesUsersModel'

const inputClass = 'h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--brand-accent)] disabled:opacity-50'

/** Stops the DataTable row from reacting to clicks / keys inside an editor. */
const stop = (event) => event.stopPropagation()

function Saving({ show }) {
  return show ? <Loader2 size={14} className="shrink-0 animate-spin text-[var(--brand-accent)]" aria-hidden="true" /> : null
}

/**
 * Rank: number input (saved on Enter / blur), conflict → "swap with X", and up / down to swap with the neighbour in
 * the shown order. `neighbours` = { previous, next } in the current list.
 */
export function PriorityCell({ user, users, neighbours, saving, disabled, onSave, onSwap }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(null)
  const value = draft ?? (user.priority ? String(user.priority) : '')
  const check = draft === null ? null : checkPriority(draft, users, user.id)
  const changed = draft !== null && Number(draft || 0) !== user.priority

  const commit = async () => {
    if (!changed || check) return
    if (await onSave(draft)) setDraft(null)
  }

  return (
    <div className="grid min-w-[9rem] gap-1" onClick={stop} onKeyDown={stop}>
      <div className="flex items-center gap-1">
        <button type="button" disabled={disabled || !neighbours.previous} onClick={() => onSwap(user, neighbours.previous)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label={t('salesTeams.salesUsers.moveUp', { name: user.name })}>
          <ArrowUp size={14} />
        </button>
        <button type="button" disabled={disabled || !neighbours.next} onClick={() => onSwap(user, neighbours.next)} className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label={t('salesTeams.salesUsers.moveDown', { name: user.name })}>
          <ArrowDown size={14} />
        </button>
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          placeholder="—"
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => { if (event.key === 'Enter') commit(); if (event.key === 'Escape') setDraft(null) }}
          className={cn(inputClass, 'w-16 text-center font-bold', check && 'border-red-500')}
          aria-label={t('salesTeams.salesUsers.priorityOf', { name: user.name })}
        />
        <Saving show={saving} />
      </div>
      {check === 'invalid' && <p className="text-[11px] text-red-600 dark:text-red-300">{t('salesTeams.salesUsers.priorityInvalid')}</p>}
      {check?.conflict && (
        <p className="text-[11px] text-red-600 dark:text-red-300">
          {t('salesTeams.salesUsers.priorityTaken', { name: check.conflict.name })}{' '}
          <button type="button" onClick={() => { setDraft(null); onSwap(user, check.conflict) }} className="font-semibold text-[var(--brand-accent)] hover:underline">
            {t('salesTeams.salesUsers.swapWith', { name: check.conflict.name })}
          </button>
        </p>
      )}
    </div>
  )
}

export function ManagerCell({ user, users, saving, disabled, onSave }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-w-[10rem] items-center gap-1" onClick={stop} onKeyDown={stop}>
      <select value={user.managerId} disabled={disabled} onChange={(event) => onSave(event.target.value)} className={inputClass} aria-label={t('salesTeams.salesUsers.managerOf', { name: user.name })}>
        <option value="">{t('salesTeams.salesUsers.noManager')}</option>
        {users.filter((item) => item.id !== user.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <Saving show={saving} />
    </div>
  )
}

/** Free value with suggestions (role / type), saved on Enter / blur / picking a suggestion. */
export function ValueCell({ user, field, listId, saving, disabled, onSave, label }) {
  const [draft, setDraft] = useState(null)
  const value = draft ?? user[field]
  const commit = async () => {
    if (draft === null || draft.trim() === user[field]) {
      setDraft(null)
      return
    }
    if (await onSave(draft.trim())) setDraft(null)
  }

  return (
    <div className="flex min-w-[8rem] items-center gap-1" onClick={stop} onKeyDown={stop}>
      <input
        list={listId}
        value={value}
        placeholder="—"
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => { if (event.key === 'Enter') commit(); if (event.key === 'Escape') setDraft(null) }}
        className={inputClass}
        dir="ltr"
        aria-label={label}
      />
      <Saving show={saving} />
    </div>
  )
}

export function ActiveCell({ user, saving, disabled, onSave }) {
  const { t } = useTranslation()
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--text-muted)]" onClick={stop}>
      <input
        type="checkbox"
        role="switch"
        className="h-4 w-4 accent-[var(--brand-accent)]"
        checked={user.active}
        disabled={disabled}
        onChange={(event) => onSave(event.target.checked)}
        aria-label={t('salesTeams.salesUsers.activeOf', { name: user.name })}
      />
      {t(user.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive')}
      <Saving show={saving} />
    </label>
  )
}
