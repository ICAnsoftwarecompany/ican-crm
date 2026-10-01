import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, Check } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { STAGES } from '../../state/wizardStages'
import { issuesForStage, stageStatus } from '../../domain/validateWizard'

/**
 * Free navigation between stages, with a live status per stage:
 * ✓ complete, ! errors (count), ⚠ warnings. Users can jump anywhere; only
 * publishing is gated.
 */
export function WizardStepper({ activeStage, issues, visitedStages = [], onSelect }) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('campaignWizard.common.stepsLabel')} className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1.5">
        {STAGES.map((stage, index) => {
          const active = stage === activeStage
          const visited = visitedStages.includes(stage)
          const status = stageStatus(issues, stage)
          const errorCount = issuesForStage(issues, stage).filter((issue) => issue.severity === 'error').length
          const showStatus = visited && !active
          return (
            <li key={stage} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelect(stage)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
                  active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                )}
              >
                <span
                  dir="ltr"
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                    active ? 'bg-white/25' : showStatus && status === 'complete' ? 'bg-[var(--notification-success)] text-white' : showStatus && status === 'error' ? 'bg-[var(--notification-danger)] text-white' : 'bg-[var(--surface-2)]'
                  )}
                >
                  {showStatus && status === 'complete' ? <Check size={12} /> : showStatus && status === 'error' ? <AlertCircle size={12} /> : index + 1}
                </span>
                <span>{t(`campaignWizard.stages.${stage}.short`)}</span>
                {showStatus && status === 'error' && <span className="rounded-full bg-[var(--notification-danger)] px-1.5 text-[10px] text-white" dir="ltr">{errorCount}</span>}
                {showStatus && status === 'warning' && <AlertTriangle size={13} className="text-[var(--notification-warning)]" />}
              </button>
              {index < STAGES.length - 1 && <span className="h-px w-4 bg-[var(--border)]" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
