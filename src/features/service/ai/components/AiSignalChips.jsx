import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { useAiSettings } from '../api/aiApi'

const TONE = { negative: 'border-sla-breached text-sla-breached', positive: 'border-sla-on-track text-sla-on-track', high: 'border-sla-at-risk text-sla-at-risk' }

/** `ai_signals` on a case: sentiment, urgency, sensitive topics. Signals are inputs for rules, not decisions. */
export function AiSignalChips({ signals, compact = false }) {
  const { t } = useTranslation()
  const settings = useAiSettings()
  if (!signals || settings.data?.features?.sentiment === false) return null
  const chip = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs'
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" title={t('service.ai.signalsHint')}>
      {signals.sentiment !== 'neutral' && <span className={cn(chip, TONE[signals.sentiment])}><Sparkles size={12} aria-hidden="true" />{t(`service.ai.sentiment.${signals.sentiment}`)}</span>}
      {signals.urgency === 'high' && <span className={cn(chip, TONE.high)}>{t('service.ai.urgencyHigh')}</span>}
      {!compact && signals.topics?.map((topic) => <span key={topic} className={cn(chip, 'border-[var(--border)] text-[var(--text-muted)]')}>{t(`service.ai.topics.${topic}`)}</span>)}
    </span>
  )
}
