import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CalendarRange, Plus, Sparkles, UserRound } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { WorkflowLauncher } from '../../../workflow-engine'
import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { formatMoney, progressPercent } from '../../utils/dealMoney'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { ProgressBar } from '../common/ProgressBar'

/**
 * Top strip of every deal page: which deal, its status and dates, target progress, and the actions used from
 * anywhere in the workspace (add leads, automation, assistant).
 */
export function DealWorkspaceHeader() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { deal, dealId, summary } = useDealWorkspace()
  if (!deal) return null

  const leadsProgress = progressPercent(summary.total, deal.target_leads)
  const revenueProgress = progressPercent(summary.wonValue, deal.target_revenue)
  const owner = deal.owner?.name || deal.owner_name

  return (
    <header className="mb-4 space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link to="/deals" className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
            <ArrowLeft size={13} className="rtl:rotate-180" />
            {t('dealWorkspace.back')}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold text-[var(--text)]">{deal.name}</h1>
            <DealStatusBadge status={deal.status} />
            {deal.type && <span className="text-xs text-[var(--text-muted)]">{t(`dealWorkspace.options.dealType.${deal.type}`, deal.type)}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
            {(deal.start_date || deal.end_date) && (
              <span className="inline-flex items-center gap-1"><CalendarRange size={13} /><span dir="ltr">{String(deal.start_date || '—').slice(0, 10)} → {String(deal.end_date || '—').slice(0, 10)}</span></span>
            )}
            {owner && <span className="inline-flex items-center gap-1"><UserRound size={13} />{owner}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => navigate(`${getDealPagePath(dealId, 'pipeline')}?add=1`)}><Plus size={15} />{t('dealWorkspace.leads.add')}</Button>
          <WorkflowLauncher context={{ module: 'deals', entity: 'deal', entityId: dealId }} variant="outline" size="sm">
            <span>{t('dealWorkspace.actions.workflow')}</span>
          </WorkflowLauncher>
          <Button variant="ai" size="sm" onClick={() => navigate(getDealPagePath(dealId, 'assistant'))}><Sparkles size={15} />{t('dealWorkspace.actions.ai')}</Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ProgressBar
          value={leadsProgress}
          label={<><span>{t('dealWorkspace.header.leadsTarget')}</span><span dir="ltr">{summary.total} / {deal.target_leads ?? '—'}</span></>}
        />
        <ProgressBar
          value={revenueProgress}
          label={<><span>{t('dealWorkspace.header.revenueTarget')}</span><span dir="ltr">{formatMoney(summary.wonValue, i18n.language)} / {deal.target_revenue ? formatMoney(deal.target_revenue, i18n.language) : '—'}</span></>}
        />
      </div>
    </header>
  )
}
