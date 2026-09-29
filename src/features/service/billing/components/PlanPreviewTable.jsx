import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'

const COLLAPSE_AFTER = 12

/** Renders a server preview (or a schedule): totals, warnings and dated lines. */
export function PlanPreviewTable({ preview, currency = 'EGP' }) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const language = i18n.language
  const money = useMemo(() => new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 2 }), [language, currency])
  if (!preview) return null
  const lines = preview.lines || []
  const visible = expanded ? lines : lines.slice(0, COLLAPSE_AFTER)

  return (
    <div className="grid gap-3">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['finalPrice', preview.final_price],
          ['interest', preview.totals?.interest],
          ['outsidePrice', preview.totals?.outside_price],
          ['grandTotal', preview.totals?.grand_total],
        ].map(([key, value]) => (
          <div key={key} className="rounded-md bg-[var(--surface-2)] p-3">
            <dt className="text-xs text-[var(--text-muted)]">{t(`service.billing.totals.${key}`)}</dt>
            <dd className="text-base font-bold text-[var(--text)]"><span dir="ltr">{money.format(value || 0)}</span></dd>
          </div>
        ))}
      </dl>
      {(preview.warnings || []).length > 0 && (
        <ul className="grid gap-1">
          {preview.warnings.map((warning) => (
            <li key={warning} className="flex items-center gap-1.5 text-xs text-sla-at-risk">
              <AlertTriangle size={12} aria-hidden="true" />
              {t(`service.billing.warnings.${warning}`, { defaultValue: warning })}
            </li>
          ))}
          {preview.requires_approval && <li className="text-xs font-semibold text-sla-at-risk">{t('service.billing.requiresApproval')}</li>}
        </ul>
      )}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2 text-start font-medium">#</th>
              <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.type')}</th>
              <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.due')}</th>
              <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.amount')}</th>
              {'paid_amount' in (lines[0] || {}) && lines.some((line) => line.status) && <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.status')}</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((line) => (
              <tr key={`${line.seq}-${line.due_date}`} className={cn('border-t border-[var(--border)]', !line.in_price && 'text-[var(--text-muted)]')}>
                <td className="px-3 py-1.5 text-xs" dir="ltr">{line.seq}</td>
                <td className="px-3 py-1.5">
                  {t(`service.billing.lineTypes.${line.line_type}`, { defaultValue: line.line_type })}
                  {line.includes_reservation ? <span className="ms-1 text-xs text-[var(--text-muted)]">({t('service.billing.includesReservation', { amount: money.format(line.includes_reservation) })})</span> : null}
                  {!line.in_price && <span className="ms-1 text-xs">· {t('service.billing.outside')}</span>}
                </td>
                <td className="px-3 py-1.5 text-xs">{line.due_date ? formatDate(line.due_date, language, { dateStyle: 'medium' }) : '—'}</td>
                <td className="px-3 py-1.5 text-end font-medium"><span dir="ltr">{money.format(line.amount)}</span></td>
                {line.status && <td className="px-3 py-1.5 text-end text-xs">{t(`service.billing.lineStatuses.${line.status}`, { defaultValue: line.status })}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lines.length > COLLAPSE_AFTER && (
        <button type="button" className="w-fit text-xs text-[var(--text)] underline" onClick={() => setExpanded((value) => !value)}>
          {expanded ? t('service.billing.showLess') : t('service.billing.showAll', { count: lines.length })}
        </button>
      )}
    </div>
  )
}
