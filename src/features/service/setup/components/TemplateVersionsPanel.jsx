import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowUpCircle, CheckCircle2, GitCompare } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useTemplateInstallation, useTemplateUpgrade } from '../api/setupApi'

const STATUS_TONE = { pending: 'text-[var(--text)]', conflict: 'text-sla-at-risk', already: 'text-[var(--text-muted)]' }

/** Settings → Template version: what is installed, what the new version changes, and a safe upgrade (keep my edits). */
export function TemplateVersionsPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const installation = useTemplateInstallation()
  const { preview, upgrade } = useTemplateUpgrade()
  const [choices, setChoices] = useState({})
  const data = installation.data
  const changes = preview.data?.changes || []
  const apply = () =>
    upgrade.mutate(choices, {
      onSuccess: (result) => {
        toast.success(t('service.templates.done', { applied: result.applied.length, skipped: result.skipped.length }))
        preview.reset()
      },
      onError: (error) => toast.error(getServiceErrorMessage(error, t)),
    })
  const valueText = (change, value) => (change.field?.endsWith('_minutes') ? t('service.templates.minutes', { count: value }) : String(value))

  return (
    <div className="grid gap-4">
      <header className="grid gap-1">
        <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <ResourceState isLoading={installation.isLoading} error={installation.error} onRetry={installation.refetch}>
        {data && (
          <>
            <section className={cn('flex flex-col gap-3 rounded-lg border bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between', data.upgrade_available ? 'border-brand-accent' : 'border-[var(--border)]')}>
              <div className="grid gap-0.5">
                <span className="flex items-center gap-2 font-semibold text-[var(--text)]">
                  {data.upgrade_available ? <ArrowUpCircle size={18} className="text-brand-accent" aria-hidden="true" /> : <CheckCircle2 size={18} className="text-sla-on-track" aria-hidden="true" />}
                  {data.upgrade_available ? t('service.templates.available', { version: data.latest_version }) : t('service.templates.upToDate')}
                </span>
                <span className="text-sm text-[var(--text-muted)]">{t('service.templates.installed', { template: t(`service.mock.templates.${data.template}`, { defaultValue: data.template }), version: data.installed_version })}</span>
                {data.upgrade_available && <span className="text-sm text-[var(--text-muted)]">{localizeLabel(data.versions.find((entry) => entry.version === data.latest_version)?.notes, language, '')}</span>}
              </div>
              {data.upgrade_available && !preview.data && <Button variant="outline" loading={preview.isPending} onClick={() => preview.mutate()}><GitCompare size={16} aria-hidden="true" />{t('service.templates.preview')}</Button>}
            </section>

            {preview.data && (
              <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.templates.changes')}>
                <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.templates.changes')}</h3>
                <ul className="divide-y divide-[var(--border)]">
                  {changes.map((change) => (
                    <li key={change.id} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="grid gap-0.5">
                        <span className="text-sm text-[var(--text)]">
                          <span className="font-medium">{t(`service.templates.kinds.${change.change}`)}</span>
                          {' · '}
                          {t(`service.templates.entities.${change.entity}`)}: {localizeLabel(change.label, language, change.id)}
                        </span>
                        {change.change === 'changed' && <span className="text-xs text-[var(--text-muted)]">{t('service.templates.fromTo', { from: valueText(change, change.from), to: valueText(change, change.to) })}</span>}
                        <span className="text-xs text-[var(--text-muted)]">{localizeLabel(change.note, language, '')}</span>
                        <span className={cn('text-xs font-medium', STATUS_TONE[change.status])}>{t(`service.templates.statuses.${change.status}`)}</span>
                      </div>
                      {change.status !== 'already' && (
                        <div className="flex gap-1" role="radiogroup" aria-label={localizeLabel(change.label, language, change.id)}>
                          {['take', 'keep'].map((choice) => {
                            const selected = (choices[change.id] || (change.status === 'conflict' ? 'keep' : 'take')) === choice
                            return <button key={choice} type="button" role="radio" aria-checked={selected} onClick={() => setChoices((current) => ({ ...current, [change.id]: choice }))} className={cn('rounded-md border px-3 py-1 text-xs', selected ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>{t(`service.templates.choices.${choice}`)}</button>
                          })}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[var(--text-muted)]">{t('service.templates.safeHint')}</p>
                <div className="flex gap-2">
                  <Button loading={upgrade.isPending} onClick={apply}>{t('service.templates.upgrade', { version: data.latest_version })}</Button>
                  <Button variant="ghost" onClick={() => preview.reset()}>{t('service.templates.cancel')}</Button>
                </div>
              </section>
            )}

            {data.history.length > 0 && (
              <section className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.templates.history')}</h3>
                <ul className="grid gap-1 text-sm">
                  {data.history.map((entry, index) => (
                    <li key={index} className="text-[var(--text)]">{t('service.templates.historyLine', { from: entry.from, to: entry.to, applied: entry.applied.length, skipped: entry.skipped.length, date: formatDate(entry.at, language), name: entry.by?.name })}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </ResourceState>
    </div>
  )
}
