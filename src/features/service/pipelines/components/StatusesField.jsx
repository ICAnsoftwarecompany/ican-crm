import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { cn } from '../../../../shared/utils/cn'
import { STATUS_CATEGORY_TONE } from '../../cases/utils/caseStatus'
import { STATUS_CATEGORIES, addStatus, moveStatus, removeStatus, setInitial } from '../utils/pipelineEditing'

/**
 * Status list of a pipeline (custom settings field). The category drives the
 * UI (colors, board columns, open/closed); the key is stable for integrations.
 */
export function StatusesField({ label, value = [], onPatch, values, error }) {
  const { t } = useTranslation()
  const statuses = value || []
  const isCase = values?.entity === 'case'
  const update = (id, patch) => onPatch({ statuses: statuses.map((status) => (status.id === id ? { ...status, ...patch } : status)) })

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      {statuses.map((status, index) => (
        <div key={status.id} className="grid gap-2 rounded-lg border border-[var(--border)] p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem]">
            <Input lang="ar" dir="auto" value={status.label?.ar || ''} placeholder={t('service.settings.fields.language.ar')} aria-label={`${t('service.pipelines.statusLabel')} · ${t('service.settings.fields.language.ar')}`} onChange={(event) => update(status.id, { label: { ...status.label, ar: event.target.value } })} />
            <Input lang="en" dir="ltr" value={status.label?.en || ''} placeholder={t('service.settings.fields.language.en')} aria-label={`${t('service.pipelines.statusLabel')} · ${t('service.settings.fields.language.en')}`} onChange={(event) => update(status.id, { label: { ...status.label, en: event.target.value } })} />
            <Input dir="ltr" value={status.key} placeholder={t('service.settings.fields.key')} aria-label={t('service.settings.fields.key')} onChange={(event) => update(status.id, { key: event.target.value.replace(/\s+/g, '_').toLowerCase() })} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_CATEGORY_TONE[status.category])} aria-hidden="true" />
            <div className="w-40">
              <Select
                aria-label={t('service.pipelines.category')}
                value={status.category}
                onChange={(next) => update(status.id, { category: next || 'open' })}
                options={STATUS_CATEGORIES.map((category) => ({ value: category, label: t(`service.pipelines.categories.${category}`) }))}
              />
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text)]">
              <input type="radio" name="initial-status" className="accent-[var(--brand-accent)]" checked={Boolean(status.is_initial)} onChange={() => onPatch({ statuses: setInitial(statuses, status.id) })} />
              {t('service.pipelines.initial')}
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text)]">
              <input type="checkbox" className="accent-[var(--brand-accent)]" checked={Boolean(status.is_terminal)} onChange={(event) => update(status.id, { is_terminal: event.target.checked })} />
              {t('service.pipelines.terminal')}
            </label>
            {isCase && (
              <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text)]">
                <input type="checkbox" className="accent-[var(--brand-accent)]" checked={status.sla_behavior === 'pause'} onChange={(event) => update(status.id, { sla_behavior: event.target.checked ? 'pause' : null })} />
                {t('service.pipelines.pausesSla')}
              </label>
            )}
            <span className="ms-auto flex items-center">
              <Button type="button" variant="ghost" size="icon" disabled={index === 0} aria-label={t('service.pipelines.moveUp')} onClick={() => onPatch({ statuses: moveStatus(statuses, index, -1) })}>
                <ArrowUp size={14} aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon" disabled={index === statuses.length - 1} aria-label={t('service.pipelines.moveDown')} onClick={() => onPatch({ statuses: moveStatus(statuses, index, 1) })}>
                <ArrowDown size={14} aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onPatch(removeStatus(values, status.id))}>
                <Trash2 size={14} aria-hidden="true" />
              </Button>
            </span>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onPatch({ statuses: addStatus(statuses) })}>
        <Plus size={14} aria-hidden="true" />
        {t('service.pipelines.addStatus')}
      </Button>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
