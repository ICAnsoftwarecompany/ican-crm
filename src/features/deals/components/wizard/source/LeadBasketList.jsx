import { useTranslation } from 'react-i18next'
import { Trash2, X } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { MAX_NEW_LEADS } from '../../../utils/leadSource'

const cellClass = 'h-8 w-full min-w-0 rounded-md border bg-[var(--surface)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--brand-accent)]'

/**
 * The basket: CRM leads (chips) and new leads (editable rows with their problems shown in place).
 * `rowErrors`: `{ [key]: { name?, phone?, email? } }` from validateLeadRows.
 */
export function LeadBasketList({ existing, rows, rowErrors, onExisting, onRows }) {
  const { t } = useTranslation()
  const invalid = rows.filter((row) => rowErrors[row.key]).length
  const edit = (key, field, value) => onRows(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)))
  const errorText = (key, field) => (rowErrors[key]?.[field] ? t(`dealWorkspace.wizard.errors.${rowErrors[key][field]}`) : null)

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3" aria-label={t('dealWorkspace.wizard.source.leads.basketTitle')}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.source.leads.basketTitle')}</h3>
          <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.basketSummary', { existing: existing.length, created: rows.length, max: MAX_NEW_LEADS })}</p>
        </div>
        {invalid > 0 && (
          <button type="button" onClick={() => onRows(rows.filter((row) => !rowErrors[row.key]))} className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400">
            {t('dealWorkspace.wizard.source.leads.removeInvalid', { count: invalid })}
          </button>
        )}
      </header>

      {!existing.length && !rows.length && <p className="rounded-md bg-[var(--surface-2)] p-4 text-center text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.basketEmpty')}</p>}

      {existing.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.fromCrm', { count: existing.length })}</h4>
          <ul className="flex flex-wrap gap-1.5">
            {existing.map((lead) => (
              <li key={lead.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-0.5 pe-1 ps-2.5 text-xs text-[var(--text)]">
                {lead.name}
                <button type="button" onClick={() => onExisting(existing.filter((item) => item.id !== lead.id))} className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-red-600" aria-label={`${t('dealWorkspace.wizard.source.leads.remove')} — ${lead.name}`}><X size={12} /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-[var(--text-muted)]">{t('dealWorkspace.wizard.source.leads.newRows', { count: rows.length })}</h4>
            <button type="button" onClick={() => onRows([])} className="text-xs text-[var(--text-muted)] hover:text-red-600">{t('dealWorkspace.wizard.source.leads.clearNew')}</button>
          </div>
          <ul className="max-h-80 space-y-1.5 overflow-y-auto pe-1">
            {rows.map((row, index) => {
              const errors = rowErrors[row.key] || {}
              const messages = ['name', 'phone', 'email'].map((field) => errorText(row.key, field)).filter(Boolean)
              return (
                <li key={row.key} className={cn('rounded-md border p-1.5', messages.length ? 'border-red-300 dark:border-red-800' : 'border-[var(--border)]')}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 shrink-0 text-center text-[11px] text-[var(--text-muted)]">{index + 1}</span>
                    <input className={cn(cellClass, errors.name ? 'border-red-400' : 'border-[var(--border)]')} value={row.name} onChange={(event) => edit(row.key, 'name', event.target.value)} placeholder={t('dealWorkspace.fields.name')} aria-label={`${t('dealWorkspace.fields.name')} ${index + 1}`} />
                    <input dir="ltr" className={cn(cellClass, 'w-32 shrink-0', errors.phone ? 'border-red-400' : 'border-[var(--border)]')} value={row.phone} onChange={(event) => edit(row.key, 'phone', event.target.value)} placeholder={t('dealWorkspace.fields.phone')} aria-label={`${t('dealWorkspace.fields.phone')} ${index + 1}`} />
                    <input dir="ltr" className={cn(cellClass, 'hidden sm:block', errors.email ? 'border-red-400' : 'border-[var(--border)]')} value={row.email || ''} onChange={(event) => edit(row.key, 'email', event.target.value)} placeholder={t('dealWorkspace.fields.email')} aria-label={`${t('dealWorkspace.fields.email')} ${index + 1}`} />
                    <button type="button" onClick={() => onRows(rows.filter((item) => item.key !== row.key))} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-red-600" aria-label={`${t('dealWorkspace.wizard.source.leads.remove')} ${index + 1}`}><Trash2 size={14} /></button>
                  </div>
                  {messages.length > 0 && <p className="mt-1 ps-7 text-[11px] text-red-600 dark:text-red-400">{messages.join(' · ')}</p>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
