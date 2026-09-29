import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileCheck2 } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useContract } from '../api/contractsApi'
import { ContractActions } from './ContractActions'
import { ContractAmendments } from './ContractAmendments'
import { ContractStatusBadge } from './ContractStatusBadge'

const FULFILLMENT_TONE = { fulfilled: 'text-sla-on-track', needs_review: 'text-sla-at-risk', pending: 'text-[var(--text-muted)]' }

function Section({ title, children }) {
  return (
    <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

/** Contract: lifecycle actions, lines with fulfillment state, versions, signatures, amendments, handoff link. */
export function ContractDetailView({ contractId, backTo, detailPath, handoffPath }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const contract = useContract(contractId)
  const item = contract.data
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')
  const money = (value) => new Intl.NumberFormat(language, { style: 'currency', currency: item?.currency || 'EGP', maximumFractionDigits: 0 }).format(value || 0)

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.contracts.back')}
      </Link>
      <ResourceState isLoading={contract.isLoading} error={contract.error} onRetry={contract.refetch}>
        {item && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{item.contract_number}</span>
                  <ContractStatusBadge status={item.status} />
                  <span>{t('service.contracts.versionLabel', { version: item.effective_version })}</span>
                </div>
                <h1 className="text-lg font-bold text-[var(--text)]">{localizeLabel(item.type?.label, language, '')} · {item.customer?.name}</h1>
                <p className="text-sm text-[var(--text-muted)]">
                  <span dir="ltr">{money(item.total_value)}</span> · {t('service.entitlements.range', { from: date(item.start_date), to: date(item.end_date) })}
                </p>
                {item.handoff && handoffPath && (
                  <Link to={handoffPath(item.handoff)} className="inline-flex w-fit items-center gap-1 text-xs text-[var(--text)] underline">
                    <FileCheck2 size={14} aria-hidden="true" />
                    {t('service.contracts.handoffLink', { status: t(`service.handoffs.statuses.${item.handoff.status}`) })}
                  </Link>
                )}
              </div>
              <ContractActions contract={item} detailPath={detailPath} />
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Section title={t('service.contracts.fields.items')}>
                <ul className="divide-y divide-[var(--border)]">
                  {item.items.map((line) => (
                    <li key={line.id} className="grid gap-1 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <span className="grid gap-0.5">
                        <span className="text-[var(--text)]">{localizeLabel(line.name, language, line.item_id)} <span className="text-xs text-[var(--text-muted)]" dir="ltr">×{line.quantity}</span></span>
                        <span className={`text-xs ${FULFILLMENT_TONE[line.fulfillment_status]}`}>{t(`service.contracts.fulfillment.${line.fulfillment_status}`)}</span>
                      </span>
                      <span className="text-xs text-[var(--text)]" dir="ltr">{money(line.total)}</span>
                    </li>
                  ))}
                </ul>
              </Section>
              <div className="grid content-start gap-4">
                <Section title={t('service.contracts.parties.title')}>
                  <ul className="grid gap-1 text-sm">
                    {item.parties.map((party, index) => (
                      <li key={index} className="flex justify-between gap-2"><span className="text-[var(--text-muted)]">{t(`service.contracts.parties.${party.party_type}`, { defaultValue: party.party_type })}</span><span className="text-[var(--text)]">{party.name}</span></li>
                    ))}
                  </ul>
                  <p className="text-xs text-[var(--text-muted)]">{t('service.contracts.fields.renewal')}: {t(`service.contracts.renewals.${item.renewal_type}`)}</p>
                  {item.terminated_reason && <p className="text-xs text-status-lost">{localizeLabel(item.terminated_reason, language, '')}</p>}
                </Section>
                <Section title={t('service.contracts.versions')}>
                  <ul className="grid gap-2 text-xs">
                    {item.versions.map((version) => (
                      <li key={version.version} className="flex justify-between gap-2">
                        <span className="text-[var(--text)]">v{version.version} · <bdi>{localizeLabel(version.summary, language, '')}</bdi></span>
                        <span className="text-[var(--text-muted)]">{t(`service.contracts.versionStatuses.${version.status}`, { defaultValue: version.status })} · {date(version.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="text-xs font-semibold text-[var(--text-muted)]">{t('service.contracts.signatures')}</h3>
                  {!item.signatures.length && <p className="text-xs text-[var(--text-muted)]">{t('service.contracts.noSignatures')}</p>}
                  <ul className="grid gap-1 text-xs">
                    {item.signatures.map((signature, index) => (
                      <li key={index} className="flex justify-between gap-2">
                        <span className="text-[var(--text)]">{signature.signer_name} ({t(`service.contracts.parties.${signature.signer_type}`)})</span>
                        <span className="text-[var(--text-muted)]">{t(`service.contracts.methods.${signature.method}`, { defaultValue: signature.method })} · v{signature.version} · {date(signature.signed_at)}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </div>
            <ContractAmendments contract={item} />
            <p className="text-xs text-[var(--text-muted)]">{term('customer')}: {item.customer?.name}{item.deal_id ? ` · ${t('service.contracts.fromDeal')}` : ''}</p>
          </>
        )}
      </ResourceState>
    </div>
  )
}
