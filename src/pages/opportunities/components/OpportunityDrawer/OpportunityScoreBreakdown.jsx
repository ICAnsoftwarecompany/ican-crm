import { BarChart3, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getScoreComponents } from '../../../../features/opportunities/utils/opportunityFormatters'

export function OpportunityScoreBreakdown({ opportunity }) {
  const { t } = useTranslation()
  const components = getScoreComponents(opportunity.score, t)
  const hasAiConfidence = Number.isFinite(opportunity.ai_confidence)

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} className="text-[var(--text-muted)]" />
        <h4 className="font-bold text-[var(--text)]">{t('opportunities.scoreBreakdown')}</h4>
      </div>

      <div className="grid gap-3">
        {components.map((component) => {
          const percent = Math.min(100, Math.round((component.value / component.max) * 100))
          return (
            <div key={component.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--text-muted)]">{component.label}</span>
                <span className="text-xs font-bold text-[var(--text)] font-latin">{component.value}/{component.max}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                <div className="h-full rounded-full bg-[#00C2CB]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-3">
        {hasAiConfidence ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#00C2CB]" />
              <div>
                <p className="text-xs font-bold text-[var(--text)]">{t('opportunities.aiConfidence')}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t('opportunities.aiConfidenceHint')}</p>
              </div>
            </div>
            <span className="shrink-0 text-lg font-black text-[#00A8B0] font-latin">{opportunity.ai_confidence}%</span>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">{t('opportunities.aiConfidenceUnavailable')}</p>
        )}
      </div>
    </section>
  )
}
