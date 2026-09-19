import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export function FlowValidationPanel({ validation, onSelectIssue }) {
  const { t } = useTranslation()
  if (!validation) return null

  if (validation.valid && validation.warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
        <CheckCircle2 size={14} />
        {t('visualFlow.validation.allGood')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <p className="mb-1 font-bold">{t('visualFlow.validation.errorsTitle')}</p>
          <ul className="list-inside list-disc space-y-0.5">
            {validation.errors.map((issue, index) => (
              <li key={index}>
                <button type="button" className="text-start hover:underline" onClick={() => onSelectIssue?.(issue)}>
                  {t(issue.messageKey, issue.messageParams)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="mb-1 flex items-center gap-1 font-bold">
            <AlertTriangle size={12} />
            {t('visualFlow.validation.warningsTitle')}
          </p>
          <ul className="list-inside list-disc space-y-0.5">
            {validation.warnings.map((issue, index) => (
              <li key={index}>
                <button type="button" className="text-start hover:underline" onClick={() => onSelectIssue?.(issue)}>
                  {t(issue.messageKey, issue.messageParams)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
