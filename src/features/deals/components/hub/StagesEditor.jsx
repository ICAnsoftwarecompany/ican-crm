import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { dealInputClass } from '../common/FieldLabel'

export const NEW_STAGE = { name: '', color: '#3B82F6', is_won_stage: false, is_lost_stage: false }

/** Ordered stage list of a pipeline template: name, color, won / lost flag, move, remove. */
export function StagesEditor({ stages, onChange }) {
  const { t } = useTranslation()
  const update = (index, patch) => onChange(stages.map((stage, position) => {
    if (position !== index) {
      // Only one won stage and one lost stage per pipeline.
      if (patch.is_won_stage) return { ...stage, is_won_stage: false }
      if (patch.is_lost_stage) return { ...stage, is_lost_stage: false }
      return stage
    }
    return { ...stage, ...patch, ...(patch.is_won_stage ? { is_lost_stage: false } : {}), ...(patch.is_lost_stage ? { is_won_stage: false } : {}) }
  }))
  const move = (index, delta) => {
    const next = [...stages]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30'

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => (
        <div key={stage.id ?? `new-${index}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] p-2">
          <span className="w-5 text-center text-xs text-[var(--text-muted)]" dir="ltr">{index + 1}</span>
          <input type="color" value={stage.color || '#3B82F6'} onChange={(event) => update(index, { color: event.target.value })} className="h-9 w-10 cursor-pointer rounded border border-[var(--border)] bg-transparent" aria-label={t('dealWorkspace.pipelines.stageColor')} />
          <input className={`${dealInputClass} min-w-[140px] flex-1`} value={stage.name} placeholder={t('dealWorkspace.pipelines.stageName')} aria-label={t('dealWorkspace.pipelines.stageName')} onChange={(event) => update(index, { name: event.target.value })} />
          <label className="inline-flex items-center gap-1 text-xs text-[var(--text)]"><input type="checkbox" checked={Boolean(stage.is_won_stage)} onChange={(event) => update(index, { is_won_stage: event.target.checked })} />{t('dealWorkspace.settings.wonStage')}</label>
          <label className="inline-flex items-center gap-1 text-xs text-[var(--text)]"><input type="checkbox" checked={Boolean(stage.is_lost_stage)} onChange={(event) => update(index, { is_lost_stage: event.target.checked })} />{t('dealWorkspace.settings.lostStage')}</label>
          <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, -1)} aria-label={t('dealWorkspace.pipelines.moveUp')}><ArrowUp size={15} /></button>
          <button type="button" className={iconButton} disabled={index === stages.length - 1} onClick={() => move(index, 1)} aria-label={t('dealWorkspace.pipelines.moveDown')}><ArrowDown size={15} /></button>
          <button type="button" className={`${iconButton} hover:text-red-600`} disabled={stages.length <= 1} onClick={() => onChange(stages.filter((_, position) => position !== index))} aria-label={t('dealWorkspace.pipelines.removeStage')}><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...stages, { ...NEW_STAGE }])} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]">
        <Plus size={14} />{t('dealWorkspace.pipelines.addStage')}
      </button>
    </div>
  )
}

