import { useTranslation } from 'react-i18next'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../shared/utils/cn'
import { AvailabilityBadge, instanceLabel } from '../../../products'

/**
 * One-of-a-kind items (`unique_unit`: apartments, specific cars): the units the lead is interested in, with their
 * availability. Sold units cannot be picked; reserved ones can (the lead may wait for them).
 */
export function InterestUnitsPicker({ instances, selectedIds, onToggle, loading, error, holdDays }) {
  const { t } = useTranslation()
  const available = instances.filter((instance) => instance.availability === 'available').length

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[var(--text)]">{t('leads.interestDialog.units.title')}</legend>
      <p className="text-xs text-[var(--text-muted)]">
        {t('leads.interestDialog.units.hint', { available, total: instances.length })}
        {holdDays ? ` ${t('leads.interestDialog.units.holdHint', { count: holdDays })}` : ''}
      </p>

      {loading && <Skeleton className="h-20 w-full" />}
      {!loading && error && <p role="alert" className="text-xs text-[#EF4444]">{t('leads.interestDialog.units.loadFailed')}</p>}
      {!loading && !error && instances.length === 0 && (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-center text-xs text-[var(--text-muted)]">
          {t('leads.interestDialog.units.empty')}
        </p>
      )}

      {!loading && !error && instances.length > 0 && (
        <ul className="grid max-h-48 gap-1.5 overflow-y-auto pe-1 sm:grid-cols-2">
          {instances.map((instance) => {
            const id = String(instance.id)
            const sold = instance.availability === 'sold'
            const checked = selectedIds.includes(id)
            return (
              <li key={id}>
                <label
                  className={cn(
                    'flex min-w-0 items-center gap-2 rounded-lg border p-2 text-sm',
                    checked ? 'border-[#00C2CB] bg-[var(--surface-2)]' : 'border-[var(--border)]',
                    sold ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-[#00C2CB]"
                    checked={checked}
                    disabled={sold && !checked}
                    onChange={() => onToggle(id)}
                  />
                  <span className="min-w-0 flex-1 truncate text-[var(--text)]" dir="auto">{instanceLabel(instance)}</span>
                  <AvailabilityBadge status={instance.availability} />
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </fieldset>
  )
}
