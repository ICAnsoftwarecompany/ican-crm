import { useTranslation } from 'react-i18next'
import './dealStageTabs.css'

export const NO_DEAL_STAGE = '__no_stage__'
export const hasDealStage = (lead) => lead.stageId != null && lead.stageId !== ''

export function DealStageTabs({ stages, leads, value, onChange }) {
  const { t } = useTranslation()
  const tabs = [
    { id: '', label: t('dealWorkspace.pipeline.allStages'), count: leads.length },
    { id: NO_DEAL_STAGE, label: t('dealWorkspace.pipeline.noStage'), count: leads.filter((lead) => !hasDealStage(lead)).length },
    ...stages.map((stage) => ({ ...stage, count: leads.filter((lead) => String(lead.stageId) === String(stage.id)).length })),
  ]
  return (
    <div className="flex flex-wrap rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" role="group" aria-label={t('dealWorkspace.pipeline.stages')}>
      {tabs.map((tab) => (
        <button key={tab.id} type="button" aria-pressed={String(value) === String(tab.id)} onClick={() => onChange(tab.id)}
          className="deal-stage-filter relative inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--border)] bg-[var(--surface-2)] px-6 pb-3 pt-2 text-sm text-[var(--text)]">
          <span>{tab.label || tab.name}</span>
          <span className="min-w-6 rounded-full bg-[var(--surface)] px-2 text-center text-xs font-semibold">{tab.count}</span>
          <span className="absolute inset-x-5 bottom-1 h-1 rounded-full" style={{ backgroundColor: tab.color || 'var(--text-muted)' }} />
        </button>
      ))}
    </div>
  )
}
