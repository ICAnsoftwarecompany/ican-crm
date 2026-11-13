import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, CircleHelp, RefreshCw } from 'lucide-react'
import { createResourceApi } from '../api/settingsApi'
import { assignmentApi } from '../../assignment/api/assignmentApi'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getSettingsResource, getSettingsSlug } from '../resources'
import { READINESS_CHECKS, evaluateReadiness } from './settingsHealth'

const assignmentQueries = {
  assignmentRules: { queryKey: ['service', 'assignment', 'rules'], queryFn: assignmentApi.rules.list },
  distributionSettings: { queryKey: ['service', 'assignment', 'distribution'], queryFn: assignmentApi.distribution.list },
}

export function SettingsHealthPanel() {
  const { t } = useTranslation()
  const results = useQueries({ queries: READINESS_CHECKS.map((check) => ({
    ...(assignmentQueries[check.source] || {
      queryKey: serviceKeys.settings(check.key),
      queryFn: () => createResourceApi(getSettingsResource(check.key).endpoint).list(),
    }),
    staleTime: 60000,
    retry: 1,
  })) })
  const health = evaluateReadiness(READINESS_CHECKS, results)
  const pending = results.some((result) => result.isPending)
  return (
    <section className="grid min-w-0 gap-5 text-[var(--text)]">
      <header><h1 className="text-xl font-bold">{t('serviceHealth.title')}</h1><p className="mt-1 text-sm text-[var(--text-muted)]">{t('serviceHealth.description')}</p></header>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm text-[var(--text-muted)]">{t('serviceHealth.progress')}</p><p className="mt-1 text-3xl font-bold" aria-live="polite">{health.percentage === null ? '—' : `${health.percentage}%`}</p></div>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-2)]" onClick={() => results.forEach((result) => result.refetch())}><RefreshCw size={15} />{t('serviceHealth.refresh')}</button>
        </div>
        <div role="progressbar" aria-label={t('serviceHealth.progress')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={health.percentage ?? 0} className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--brand-accent)] transition-all" style={{ width: `${health.percentage ?? 0}%` }} /></div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{t('serviceHealth.coverage', { completed: health.completed, units: health.units, verified: health.verified, total: health.total })}</p>
        {pending && <p className="mt-2 text-xs text-[var(--text-muted)]">{t('serviceHealth.loading')}</p>}
        {health.verified < health.total && <p className="mt-2 text-xs text-[var(--text-muted)]">{t('serviceHealth.unknownNote')}</p>}
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t('serviceHealth.discoveryNote')}</p>
      </div>
      <div className="grid gap-3">
        {health.items.map((item) => {
          const resource = item.source === 'resource' ? getSettingsResource(item.key) : getSettingsResource(item.key)
          const label = item.source === 'resource' ? t(`${resource.i18nKey}.title`) : t(`serviceHealth.resources.${item.key}`)
          const Icon = item.status === 'complete' ? CheckCircle2 : item.status === 'missing' ? AlertCircle : CircleHelp
          return <div key={item.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <Icon size={19} className={item.status === 'complete' ? 'text-emerald-500' : 'text-[var(--text-muted)]'} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{label} · {item.percentage === null ? '—' : `${item.percentage}%`}</p>
              <p className="text-xs text-[var(--text-muted)]">{t(`serviceHealth.status.${item.status}`)}</p>
              {item.types.length > 0 && <ul className="mt-2 flex flex-wrap gap-2">{item.types.map(({ type, complete }) => <li key={type} className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs">{type}: {t(`serviceHealth.status.${complete ? 'complete' : 'missing'}`)}</li>)}</ul>}
            </div>
            <Link to={`/service/settings/${getSettingsSlug(resource.key)}`} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]">{t('serviceHealth.configure')}</Link>
          </div>
        })}
      </div>
      <p className="text-xs text-[var(--text-muted)]">{t('serviceHealth.disclaimer')}</p>
    </section>
  )
}
