import { useTranslation } from 'react-i18next'
import { Badge } from '../../../../shared/components/ui/Badge'
import { isInstallmentOverdue } from '../../utils/dealContracts'
import { formatMoney } from '../../utils/dealMoney'

const VARIANTS = { paid: 'success', partial: 'warning', overdue: 'danger', cancelled: 'default', pending: 'info' }

/** Installments of one payment plan; overdue ones are flagged from the due date when the backend has not. */
export function InstallmentsTable({ installments = [] }) {
  const { t, i18n } = useTranslation()
  if (!installments.length) return <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.contracts.noInstallments')}</p>

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2 text-start font-medium">#</th>
            <th className="px-3 py-2 text-start font-medium">{t('dealWorkspace.contracts.dueDate')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('dealWorkspace.contracts.amount')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('dealWorkspace.fields.status')}</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((row) => {
            const status = isInstallmentOverdue(row) ? 'overdue' : row.status
            return (
              <tr key={row.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 text-[var(--text)]" dir="ltr">{row.number}</td>
                <td className="px-3 py-2 text-[var(--text)]" dir="ltr">{row.dueDate || '—'}</td>
                <td className="px-3 py-2 font-semibold text-[var(--text)]" dir="ltr">{formatMoney(row.amount, i18n.language)}</td>
                <td className="px-3 py-2"><Badge variant={VARIANTS[status] || 'default'}>{t(`dealWorkspace.options.installmentStatus.${status}`, status)}</Badge></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
