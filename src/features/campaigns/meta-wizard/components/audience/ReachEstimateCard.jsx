import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { useReachEstimate } from '../../hooks/useWizardAssets'
import { buildTargeting } from '../../domain/buildMetaPayloads'
import { DemoDataBadge } from '../fields'

const compact = (value, language) => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0)

/** Estimated audience size with a narrow/broad gauge, like Ads Manager's side card. */
export function ReachEstimateCard({ adSet }) {
  const { t, i18n } = useTranslation()
  const { tenantId, accountId, state } = useMetaWizard()
  const estimate = useReachEstimate({ tenantId, accountId, adSet, specialAdCategories: state.campaign.specialAdCategories, targeting: buildTargeting(state, adSet) })
  const upper = estimate.data?.upper || 0
  const level = upper === 0 ? 'none' : upper < 50_000 ? 'narrow' : upper > 20_000_000 ? 'broad' : 'good'
  const position = { none: 0, narrow: 15, good: 50, broad: 88 }[level]

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--text)]"><Users size={15} />{t('campaignWizard.audience.reachTitle')}</span>
        <DemoDataBadge show={estimate.data?.isMock} />
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-[var(--border)]">
        <span className="absolute inset-y-0 start-[33%] w-[34%] rounded-full bg-[var(--notification-success)] opacity-40" />
        <span className="absolute -top-1 h-4 w-1.5 rounded-full bg-[var(--text)] transition-all" style={{ insetInlineStart: `${position}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-[var(--text-light)]">
        <span>{t('campaignWizard.audience.narrow')}</span>
        <span>{t('campaignWizard.audience.broad')}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--text)]">
        {estimate.isLoading ? t('campaignWizard.common.loading') : upper ? t('campaignWizard.audience.reachRange', { lower: compact(estimate.data.lower, i18n.language), upper: compact(upper, i18n.language) }) : t('campaignWizard.audience.reachUnknown')}
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{t(`campaignWizard.audience.reachLevels.${level}`)}</p>
    </div>
  )
}
