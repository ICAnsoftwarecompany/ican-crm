import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Headset, Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { CaseCreateDialog } from '../../cases/components/CaseCreateDialog'
import { CasePriorityBadge, CaseStatusBadge } from '../../cases/components/CaseBadges'
import { useCaseList } from '../../cases/hooks/useCases'
import { isCaseOpen } from '../../cases/utils/caseStatus'
import { CustomerContactsPanel } from '../../contacts/components/CustomerContactsPanel'
import { useServiceCapabilities } from '../../core/capabilities/useServiceCapabilities'
import { EntitlementsList } from '../../entitlements/components/EntitlementsList'
import { CustomerAssetsSection, CustomerContractsSection, CustomerRecordsSection } from './CustomerHubSections'
import { CustomerPaymentsSection, CustomerSubscriptionsSection } from './CustomerPaymentsSection'

/**
 * "Service" tab of the customer drawer / page (Customer 360).
 * Cases, service records (per type), assets and entitlements (when the
 * tenant has them), contracts and contacts. Payment schedules arrive in F4.
 *
 * @param {{ customer: { id: string|number, name?: string, phone?: string } }} props
 */
export function CustomerServiceTab({ customer }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const { hasFeature } = useServiceCapabilities()
  const [createOpen, setCreateOpen] = useState(false)
  const customerId = customer?.id != null ? String(customer.id) : ''
  const cases = useCaseList({ view: 'all', customer_id: customerId })
  const openCount = cases.cases.filter(isCaseOpen).length

  return (
    <div className="grid gap-4 py-4">
      <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Headset size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
            {term('case', 'other')}
            {!cases.isLoading && (
              <span className="text-xs font-normal text-[var(--text-muted)]">
                {t('service.customer.openCount', { count: openCount })}
              </span>
            )}
          </h2>
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!customerId}>
            <Plus size={14} aria-hidden="true" />
            {t('service.cases.create.button', { entity: term('case') })}
          </Button>
        </div>

        <ResourceState
          isLoading={cases.isLoading}
          error={cases.error}
          onRetry={cases.refetch}
          empty={!cases.cases.length}
          emptyTitle={t('service.customer.noCases', { entity: term('case', 'other') })}
        >
          <ul className="grid gap-2">
            {cases.cases.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/service/cases/${item.id}`}
                  className="flex items-center gap-3 rounded-md bg-[var(--surface-2)] px-3 py-2 transition-colors hover:bg-[var(--shell-hover)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text)]">{item.subject}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      <span dir="ltr" className="font-mono">{item.case_number}</span> · {formatRelativeTime(item.updated_at, i18n.language)}
                    </p>
                  </div>
                  <CasePriorityBadge priority={item.priority} showLabel={false} />
                  <CaseStatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        </ResourceState>
      </section>

      {customerId && <CustomerRecordsSection customer={{ id: customerId, name: customer?.name, phone: customer?.phone }} />}
      {customerId && hasFeature('assets') && <CustomerAssetsSection customer={{ id: customerId }} />}
      {customerId && hasFeature('entitlements') && (
        <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.hub.entitlements')}</h2>
          <EntitlementsList params={{ customer_id: customerId }} showCustomer={false} />
        </section>
      )}
      {customerId && <CustomerContractsSection customer={{ id: customerId }} />}
      {customerId && hasFeature('subscriptions') && <CustomerSubscriptionsSection customer={{ id: customerId }} />}
      {customerId && <CustomerPaymentsSection customer={{ id: customerId }} />}

      <CustomerContactsPanel customerId={customerId} />

      <CaseCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        navigateOnCreate={false}
        defaults={{ customer: { id: customerId, name: customer?.name || '', phone: customer?.phone || '' } }}
      />
    </div>
  )
}
