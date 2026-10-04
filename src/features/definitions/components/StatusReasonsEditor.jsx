import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { addReason } from '../utils/statusReasons'

const inputClass = 'h-9 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand-accent)] disabled:opacity-60'

/**
 * Reasons of a sale / lost / retarget status (Statuses settings). Saved reasons can be turned off, never deleted
 * (reports group by their key); new ones can be removed before saving. Disabled with a note until the backend
 * stores them (`DEFINITIONS_API_STATUS.statusReasons`).
 */
export function StatusReasonsEditor({ kind, rows, onChange, disabled = false, error }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const add = () => {
    onChange(addReason(rows, draft))
    setDraft('')
  }
  const update = (index, patch) => onChange(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)))

  return (
    <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div>
        <h3 className="text-sm font-bold text-[var(--text)]">{t('customers.statusReasons.title')}</h3>
        <p className="text-xs text-[var(--text-muted)]">{t(`customers.statusReasons.hints.${kind}`)}</p>
      </div>
      {disabled && <p className="rounded-md border border-dashed border-[var(--border)] p-2 text-xs text-[var(--text-muted)]">{t('customers.statusReasons.planned')}</p>}
      {rows.length > 0 && (
        <ul className="space-y-1.5">
          {rows.map((row, index) => (
            <li key={row.key} className="flex items-center gap-2">
              <input className={inputClass} value={row.label} disabled={disabled} onChange={(event) => update(index, { label: event.target.value })} aria-label={t('customers.statusReasons.label')} />
              <label className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                <input type="checkbox" checked={row.active} disabled={disabled} onChange={(event) => update(index, { active: event.target.checked })} />
                {t('customers.statusReasons.active')}
              </label>
              {row.id === null && (
                <button type="button" disabled={disabled} onClick={() => onChange(rows.filter((_, position) => position !== index))} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-red-600" aria-label={t('customers.statusReasons.remove')}>
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={draft}
          disabled={disabled}
          placeholder={t('customers.statusReasons.placeholder')}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
        />
        <button type="button" onClick={add} disabled={disabled || !draft.trim()} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] disabled:opacity-60">
          <Plus size={14} />{t('customers.statusReasons.add')}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
