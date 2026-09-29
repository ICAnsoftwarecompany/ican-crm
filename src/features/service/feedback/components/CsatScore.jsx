import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'

const TONE = { 5: 'text-sla-on-track', 4: 'text-sla-on-track', 3: 'text-sla-at-risk', 2: 'text-sla-breached', 1: 'text-sla-breached' }

/** "4/5 ★" with a status tone; the number + label carry meaning, not the color. */
export function CsatScore({ score, className }) {
  const { t } = useTranslation()
  if (!score) return null
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', TONE[score], className)} title={t('service.feedback.scoreTitle', { score })}>
      <Star size={14} aria-hidden="true" className="fill-current" />
      <span dir="ltr">{score}/5</span>
    </span>
  )
}
