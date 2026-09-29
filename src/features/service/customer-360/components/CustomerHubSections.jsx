import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Cpu, FileSignature, Layers3, Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { CaseStatusBadge } from '../../cases/components/CaseBadges'
import { useRecordList, useRecordsSetup } from '../../records/hooks/useRecords'
import { RecordCreateDialog } from '../../records/components/RecordCreateDialog'
import { useAssetList } from '../../assets/api/assetsApi'
import { AssetStatusBadge } from '../../assets/components/AssetStatusBadge'
import { useContractList } from '../../contracts/api/contractsApi'
import { ContractStatusBadge } from '../../contracts/components/ContractStatusBadge'

function Section({ icon: Icon, title, action, children }) {
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Icon size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const rowClass = 'flex items-center gap-3 rounded-md bg-[var(--surface-2)] px-3 py-2 transition-colors hover:bg-[var(--shell-hover)]'

/** Service records of the customer, one section per record type. */
export function CustomerRecordsSection({ customer }) {
  const { t, i18n } = useTranslation()
  const setup = useRecordsSetup()
  const records = useRecordList({ customer_id: String(customer.id), view: 'all' })
  const [creating, setCreating] = useState(null)
  const types = setup.data?.record_types || []
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '')

  return types.map((type) => {
    const list = records.records.filter((record) => record.record_type?.id === type.id)
    const label = localizeLabel(type.label, i18n.language, type.key)
    return (
      <Section
        key={type.id}
        icon={Layers3}
        title={label}
        action={
          <Button size="sm" variant="outline" onClick={() => setCreating(type)}>
            <Plus size={14} aria-hidden="true" />
            {t('service.records.create.button', { type: label })}
          </Button>
        }
      >
        <ResourceState isLoading={records.isLoading} error={records.error} onRetry={records.refetch} empty={!list.length} emptyTitle={t('service.customer.noRecords', { type: label })}>
          <ul className="grid gap-2">
            {list.map((record) => (
              <li key={record.id}>
                <Link to={`/service/records/${type.key}/${record.id}`} className={rowClass}>
                  <span className="min-w-0 flex-1 text-sm text-[var(--text)]">
                    <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{record.reference_no}</span> {date(record.starts_at)}
                  </span>
                  <CaseStatusBadge status={record.status} />
                </Link>
              </li>
            ))}
          </ul>
        </ResourceState>
        <RecordCreateDialog open={creating?.id === type.id} onClose={() => setCreating(null)} recordType={type} customer={customer} />
      </Section>
    )
  })
}

export function CustomerAssetsSection({ customer }) {
  const { t, i18n } = useTranslation()
  const assets = useAssetList({ customer_id: String(customer.id) })
  return (
    <Section icon={Cpu} title={t('service.hub.assets')}>
      <ResourceState isLoading={assets.isLoading} error={assets.error} onRetry={assets.refetch} empty={!assets.assets.length} emptyTitle={t('service.assets.empty')}>
        <ul className="grid gap-2">
          {assets.assets.map((asset) => (
            <li key={asset.id}>
              <Link to={`/service/assets/${asset.id}`} className={rowClass}>
                <span className="min-w-0 flex-1 text-sm text-[var(--text)]">
                  {localizeLabel(asset.name, i18n.language, asset.id)} <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{asset.serial_number}</span>
                </span>
                <AssetStatusBadge status={asset.status} />
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </Section>
  )
}

export function CustomerContractsSection({ customer }) {
  const { t, i18n } = useTranslation()
  const contracts = useContractList({ customer_id: String(customer.id) })
  const money = (value, currency) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: currency || 'EGP', maximumFractionDigits: 0 }).format(value || 0)
  return (
    <Section icon={FileSignature} title={t('service.hub.contracts')}>
      <ResourceState isLoading={contracts.isLoading} error={contracts.error} onRetry={contracts.refetch} empty={!contracts.contracts.length} emptyTitle={t('service.contracts.empty')}>
        <ul className="grid gap-2">
          {contracts.contracts.map((contract) => (
            <li key={contract.id}>
              <Link to={`/service/contracts/${contract.id}`} className={rowClass}>
                <span className="min-w-0 flex-1 text-sm text-[var(--text)]">
                  <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{contract.contract_number}</span> {localizeLabel(contract.type?.label, i18n.language, '')} · <span dir="ltr">{money(contract.total_value, contract.currency)}</span>
                </span>
                <ContractStatusBadge status={contract.status} />
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </Section>
  )
}
