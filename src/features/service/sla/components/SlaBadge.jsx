import { useTranslation } from 'react-i18next'
import { AlarmClock, CheckCircle2, PauseCircle, TimerOff } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { SLA_TEXT_TONE } from '../utils/slaState'

const ICONS = { breached: TimerOff, paused: PauseCircle, met: CheckCircle2 }

/**
 * Compact SLA indicator for lists and cards: state color + time to the next
 * target ("in 2 hours" / "3 hours ago" when breached). Renders nothing when
 * the case has no SLA policy.
 */
export function SlaBadge({ sla, showState = false, className }) {
  const { t, i18n } = useTranslation()
  if (!sla) return null
  const Icon = ICONS[sla.state] || AlarmClock
  const stateLabel = t(`service.sla.states.${sla.state}`)
  const due = sla.next_due_at ? formatRelativeTime(sla.next_due_at, i18n.language) : null
  const text = showState || !due ? stateLabel : due

  return (
    <span
      className={cn('inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium', SLA_TEXT_TONE[sla.state], className)}
      title={due ? t('service.sla.badgeTitle', { state: stateLabel, due }) : stateLabel}
    >
      <Icon size={14} aria-hidden="true" />
      {text}
      {!showState && due && <span className="sr-only">{stateLabel}</span>}
    </span>
  )
}
