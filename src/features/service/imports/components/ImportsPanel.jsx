import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useImportEntities, useImportJobs } from '../api/importsApi'
import { ImportWizard } from './ImportWizard'

const TONE = { validated: 'text-sla-at-risk', completed: 'text-sla-on-track', completed_with_errors: 'text-sla-at-risk' }

/** Operations settings → Import data: the wizard + recent import jobs. */
export function ImportsPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const jobs = useImportJobs()
  const entities = useImportEntities()
  const labelOf = (job) => (job.entity_type === 'asset' ? t('service.imports.entities.asset') : localizeLabel((entities.data || []).find((entry) => entry.scope_id === job.scope_id)?.label, i18n.language, job.scope_id))
  return (
    <div className="grid gap-4">
      <header className="grid gap-1">
        <h2 className="text-lg font-bold text-[var(--text)]">{t(`${resource.i18nKey}.title`)}</h2>
        <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
      </header>
      <ImportWizard />
      <section className="grid gap-2">
        <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.imports.history')}</h3>
        <ResourceState isLoading={jobs.isLoading} error={jobs.error} onRetry={jobs.refetch} empty={!jobs.data?.length} emptyTitle={t('service.imports.noJobs')}>
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {(jobs.data || []).map((job) => (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="grid">
                  <span className="font-medium">{labelOf(job)} · <span dir="ltr">{job.file_name}</span></span>
                  <span className="text-xs text-[var(--text-muted)]">{t(`service.imports.modes.${job.mode}`)} · {job.created_by?.name} · {formatRelativeTime(job.created_at, i18n.language)}</span>
                </span>
                <span className={`text-xs font-medium ${TONE[job.status]}`}>{t(`service.imports.statuses.${job.status}`)} · {t('service.imports.jobCounts', { ok: job.status === 'validated' ? job.valid : job.succeeded, failed: job.failed })}</span>
              </li>
            ))}
          </ul>
        </ResourceState>
      </section>
    </div>
  )
}
