import { useTranslation } from 'react-i18next'
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../shared/utils/cn'
import { useEntitlementCheck } from '../api/entitlementsApi'

const LOOK = {
  covered: { icon: ShieldCheck, tone: 'text-sla-on-track' },
  not_covered: { icon: ShieldQuestion, tone: 'text-[var(--text-muted)]' },
  exhausted: { icon: ShieldAlert, tone: 'text-sla-breached' },
  expired: { icon: ShieldAlert, tone: 'text-sla-at-risk' },
  suspended: { icon: ShieldAlert, tone: 'text-sla-at-risk' },
  paid_required: { icon: ShieldAlert, tone: 'text-sla-at-risk' },
}

/** Case side panel: is the customer entitled to this service? (server check, read-only). */
export function CaseCoveragePanel({ caseItem }) {
  const { t } = useTranslation()
  const check = useEntitlementCheck({ customer_id: caseItem?.customer?.id, case_type_id: caseItem?.type?.id, asset_id: caseItem?.asset_id || undefined })
  const result = check.data
  const look = LOOK[result?.result] || LOOK.not_covered
  const Icon = look.icon

  return (
    <section className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.entitlements.coverageTitle')}</h2>
      {check.isLoading && <Skeleton className="h-8 w-full" />}
      {check.error && (
        <button type="button" className="w-fit text-xs text-[var(--text-muted)] underline" onClick={() => check.refetch()}>
          {t('service.entitlements.checkError')}
        </button>
      )}
      {result && (
        <div className="flex items-start gap-2">
          <Icon size={18} aria-hidden="true" className={cn('mt-0.5 shrink-0', look.tone)} />
          <div className="grid gap-0.5">
            <p className={cn('text-sm font-semibold', look.tone)}>{t(`service.entitlements.results.${result.result}`)}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {result.type && t(`service.entitlements.types.${result.type}`, { defaultValue: result.type })}
              {result.remaining != null && result.result === 'covered' ? ` · ${t('service.entitlements.remaining', { count: result.remaining })}` : ''}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
