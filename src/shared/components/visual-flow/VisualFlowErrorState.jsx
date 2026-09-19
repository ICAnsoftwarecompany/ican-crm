import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'

/** Explicit `error` prop path (VisualFlow received a load error from the consumer's own data-fetching, e.g. a failed adapter call) — distinct from VisualFlowErrorBoundary.jsx, which catches unexpected render-time exceptions. */
export function VisualFlowErrorState({ error, onRetry }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm text-red-600">{error?.message || t('common.error')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
