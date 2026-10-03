import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Badge } from '../../../../shared/components/ui/Badge'
import { formatDate } from '../../../../shared/utils/dateTime'
import { EntityTasksPanel } from '../../../tasks'
import { useDealContract } from '../../hooks/useDealContracts'
import { summarizeContract } from '../../utils/dealContracts'
import { formatMoney } from '../../utils/dealMoney'
import { PlannedNotice } from '../common/PlannedNotice'
import { InstallmentsTable } from './InstallmentsTable'

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-base font-bold text-[var(--text)]" dir="ltr">{value}</p>
    </div>
  )
}

/** One contract (`GET /deals/contracts/{id}`): totals, payment plan, installments and its follow-up tasks. */
export function ContractDrawer({ contractId, open, onClose, showDealLink = false }) {
  const { t, i18n } = useTranslation()
  const query = useDealContract(open ? contractId : null)
  const contract = query.contract
  const summary = contract ? summarizeContract(contract) : null
  const money = (value) => formatMoney(value, i18n.language)

  return (
    <AppDrawer open={open} onClose={onClose} size="lg" drawerKey="deal-contract" title={contract?.number || t('dealWorkspace.contracts.title')} description={contract?.leadName || ''}>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!query.isLoading && !contract} emptyTitle={t('dealWorkspace.contracts.notFound')}>
        {contract && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              <Badge variant={contract.status === 'active' ? 'success' : 'default'}>{t(`dealWorkspace.options.contractStatus.${contract.status}`, contract.status)}</Badge>
              <span>{t(`dealWorkspace.options.paymentType.${contract.paymentType}`, contract.paymentType)}</span>
              {contract.signedAt && <span>{t('dealWorkspace.contracts.signedAt')}: {formatDate(contract.signedAt, i18n.language)}</span>}
              {showDealLink && contract.dealId && <Link className="font-semibold text-[var(--brand-accent)] hover:underline" to={`/deals/${contract.dealId}/contracts`}>{contract.dealName || t('dealWorkspace.contracts.openDeal')}</Link>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={t('dealWorkspace.contracts.total')} value={money(contract.total)} />
              <Stat label={t('dealWorkspace.contracts.downPayment')} value={money(contract.downPayment)} />
              <Stat label={t('dealWorkspace.contracts.paid')} value={money(summary.paid)} />
              <Stat label={t('dealWorkspace.contracts.remaining')} value={money(summary.remaining)} />
            </div>
            {summary.overdueCount > 0 && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {t('dealWorkspace.contracts.overdueNotice', { count: summary.overdueCount, amount: money(summary.overdueAmount) })}
              </p>
            )}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.contracts.installments')}</h3>
              <InstallmentsTable installments={contract.installments} />
              <PlannedNotice capability="installmentPayment" />
            </section>
            <EntityTasksPanel taskable={{ type: 'contract', id: contract.id, name: contract.number }} />
          </div>
        )}
      </ResourceState>
    </AppDrawer>
  )
}
