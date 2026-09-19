import { useTranslation } from 'react-i18next'
import { Clock, X } from 'lucide-react'
import { EXECUTION_STATE_TONE } from '../constants/executionStates'

const TONE_BADGE = {
  neutral: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
  info: 'bg-[#EFF6FF] text-[#1D4ED8]',
  warning: 'bg-[#FFFBEB] text-[#92400E]',
  success: 'bg-[#ECFDF5] text-[#065F46]',
  danger: 'bg-[#FEF2F2] text-[#991B1B]',
}

/**
 * Purely a display of `executionState` — it never opens a WebSocket, never
 * polls, never knows how the data got there. See docs "Live Execution"
 * and "Realtime Integration": the consuming feature's own hook produces
 * `executionState` and VisualFlow only renders it.
 */
export function ExecutionPanel({ executionState, selectedNodeId, onClose }) {
  const { t } = useTranslation()

  if (!executionState) {
    return <p className="p-4 text-sm text-[var(--text-muted)]">{t('visualFlow.execution.noData')}</p>
  }

  const nodeExecution = selectedNodeId ? executionState.nodes?.[selectedNodeId] : null

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
          <Clock size={16} />
          {t('visualFlow.execution.title')}
        </h3>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t('actions.close')}>
            <X size={16} />
          </button>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        {executionState.executionId && (
          <div>
            <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.id')}</dt>
            <dd className="font-bold text-[var(--text)]" dir="ltr">{executionState.executionId}</dd>
          </div>
        )}
        {executionState.startedAt && (
          <div>
            <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.startedAt')}</dt>
            <dd className="font-bold text-[var(--text)]" dir="ltr">{executionState.startedAt}</dd>
          </div>
        )}
        {executionState.finishedAt && (
          <div>
            <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.finishedAt')}</dt>
            <dd className="font-bold text-[var(--text)]" dir="ltr">{executionState.finishedAt}</dd>
          </div>
        )}
        {executionState.status && (
          <div>
            <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.status')}</dt>
            <dd>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TONE_BADGE[EXECUTION_STATE_TONE[executionState.status]] || TONE_BADGE.neutral}`}>
                {t(`visualFlow.executionStates.${executionState.status}`)}
              </span>
            </dd>
          </div>
        )}
      </dl>

      {nodeExecution && (
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <p className="mb-2 text-xs font-black text-[var(--text-muted)]">{t('visualFlow.execution.selectedNode')}</p>
          <dl className="space-y-2 text-xs">
            <div>
              <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.status')}</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TONE_BADGE[EXECUTION_STATE_TONE[nodeExecution.status]] || TONE_BADGE.neutral}`}>
                  {t(`visualFlow.executionStates.${nodeExecution.status}`)}
                </span>
              </dd>
            </div>
            {nodeExecution.error && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.error')}</dt>
                <dd className="font-semibold text-[#991B1B]">{nodeExecution.error}</dd>
              </div>
            )}
            {nodeExecution.output && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('visualFlow.execution.output')}</dt>
                <dd>
                  <pre className="max-h-40 overflow-auto rounded bg-[var(--surface-2)] p-2 text-[11px]" dir="ltr">
                    {JSON.stringify(nodeExecution.output, null, 2)}
                  </pre>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
