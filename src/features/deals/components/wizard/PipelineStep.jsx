import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { DEAL_TYPES } from '../../constants/dealOptions'
import { usePipelineTemplates } from '../../hooks/useDeals'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { StagesEditor } from '../hub/StagesEditor'

function StagesStrip({ stages = [] }) {
  return (
    <ol className="flex flex-wrap gap-1.5">
      {[...stages].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)).map((stage, index) => (
        <li key={stage.id || index} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color || 'var(--text-muted)' }} />{stage.name}
        </li>
      ))}
    </ol>
  )
}

/** Step 1 — the deal's stages: an existing pipeline template, or a new one defined here. */
export function PipelineStep({ value, onChange, errors = {} }) {
  const { t } = useTranslation()
  const templatesQuery = usePipelineTemplates()
  const err = (key) => (errors[key] && typeof errors[key] === 'string' ? t(`dealWorkspace.wizard.errors.${errors[key]}`) : null)

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('dealWorkspace.wizard.pipeline.choice')}>
        {['existing', 'new'].map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={value.mode === mode}
            onClick={() => onChange({ mode })}
            className={cn('rounded-lg border p-4 text-start', value.mode === mode ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]')}
          >
            <span className="block text-sm font-bold text-[var(--text)]">{t(`dealWorkspace.wizard.pipeline.${mode}.title`)}</span>
            <span className="mt-1 block text-xs text-[var(--text-muted)]">{t(`dealWorkspace.wizard.pipeline.${mode}.description`)}</span>
          </button>
        ))}
      </div>

      {value.mode === 'existing' ? (
        <ResourceState
          isLoading={templatesQuery.isLoading}
          error={templatesQuery.error}
          onRetry={templatesQuery.refetch}
          empty={!templatesQuery.templates.length}
          emptyTitle={t('dealWorkspace.pipelines.emptyTitle')}
          emptyDescription={t('dealWorkspace.wizard.pipeline.noTemplates')}
        >
          <div className="space-y-2" role="radiogroup" aria-label={t('dealWorkspace.fields.pipeline')}>
            {templatesQuery.templates.map((template) => (
              <button
                key={template.id}
                type="button"
                role="radio"
                aria-checked={String(value.templateId) === String(template.id)}
                onClick={() => onChange({ templateId: String(template.id) })}
                className={cn('w-full space-y-2 rounded-lg border p-3 text-start', String(value.templateId) === String(template.id) ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]')}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-bold text-[var(--text)]">
                  {template.name}
                  <span className="text-xs font-normal text-[var(--text-muted)]">{t(`dealWorkspace.options.dealType.${template.type}`, template.type || '')}</span>
                </span>
                <StagesStrip stages={template.stages} />
              </button>
            ))}
          </div>
          {err('templateId') && <p className="text-xs text-red-600 dark:text-red-400">{err('templateId')}</p>}
        </ResourceState>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label={t('dealWorkspace.pipelines.name')} error={err('name')}>
              <input className={dealInputClass} value={value.name} onChange={(event) => onChange({ name: event.target.value })} />
            </FieldLabel>
            <FieldLabel label={t('dealWorkspace.fields.type')}>
              <select className={dealInputClass} value={value.type} onChange={(event) => onChange({ type: event.target.value })}>
                {DEAL_TYPES.map((type) => <option key={type} value={type}>{t(`dealWorkspace.options.dealType.${type}`)}</option>)}
              </select>
            </FieldLabel>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.pipeline.stagesHint')}</p>
          <StagesEditor stages={value.stages} onChange={(stages) => onChange({ stages })} />
          {Array.isArray(errors.stages) && errors.stages.map((key) => <p key={key} className="text-xs text-red-600 dark:text-red-400">{t(`dealWorkspace.pipelines.errors.${key}`)}</p>)}
        </div>
      )}
    </div>
  )
}
